package handlers

import (
	"encoding/base64"
	"net/http"
    "io"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/mxansari007/librarymanagement/models"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"strings"
    "log"
)

func SignupMember(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        var req struct {
            FirstName     string `form:"firstname" binding:"required"`
            LastName      string `form:"lastname" binding:"required"`
            Email         string `form:"email" binding:"required,email"`
            Password      string `form:"password" binding:"required,min=8"`
            AadhaarNumber string `form:"aadhaar_number" binding:"required"`
            LibraryID     uint   `form:"library_id" binding:"required"`
        }

        if err := c.ShouldBind(&req); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid form data: " + err.Error()})
            return
        }

        file, header, err := c.Request.FormFile("aadhaar_image")
        if err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read Aadhaar image: " + err.Error()})
            return
        }
        defer file.Close()

        if header.Header.Get("Content-Type") != "image/png" && header.Header.Get("Content-Type") != "image/jpeg" {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid file type. Only PNG and JPEG are allowed"})
            return
        }

        fileBytes, err := io.ReadAll(file)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process Aadhaar image: " + err.Error()})
            return
        }
        encodedImage := base64.StdEncoding.EncodeToString(fileBytes)

        hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password: " + err.Error()})
            return
        }

        tx := db.Begin()
        defer func() {
            if r := recover(); r != nil {
                tx.Rollback()
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Unexpected error occurred"})
            }
        }()

        aadhaarNumber := req.AadhaarNumber
        member := models.User{
            FirstName:       req.FirstName,
            LastName:        req.LastName,
            Email:           req.Email,
            PasswordHash:    string(hashedPassword),
            Role:            "member",
            AadhaarNumber:   &aadhaarNumber,
            AadhaarImageURL: &encodedImage,
            IsVerified:      false,
            CreatedAt:       time.Now(),
        }

        if err := tx.Create(&member).Error; err != nil {
            tx.Rollback()
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create member: " + err.Error()})
            return
        }

        var library models.Library
        if err := tx.First(&library, req.LibraryID).Error; err != nil {
            tx.Rollback()
            c.JSON(http.StatusNotFound, gin.H{"error": "Library not found"})
            return
        }

        membership := models.LibraryMembership{
            MemberID:         member.ID,
            LibraryID:        req.LibraryID,
            IsPaidMembership: false,
            StartDate:        time.Now(),
            EndDate:          time.Now().AddDate(1, 0, 0),
            CreatedAt:        time.Now(),
        }

        if err := tx.Create(&membership).Error; err != nil {
            tx.Rollback()
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create membership: " + err.Error()})
            return
        }

        tx.Commit()

        c.JSON(http.StatusCreated, gin.H{
            "message":       "Member signed up and subscribed to library successfully",
            "member_id":     member.ID,
            "membership_id": membership.ID,
        })
    }
}


func FetchBooks(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        libraryIDRaw, exists := c.Get("library_id")
        if !exists {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required or library ID missing"})
            return
        }

        libraryID, ok := libraryIDRaw.(uint)
        if !ok {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid library ID format"})
            return
        }

        title := c.Query("title")
        isbn := c.Query("isbn")
        author := c.Query("author")
        publisher := c.Query("publisher")

        if title == "" && isbn == "" && author == "" {
            c.JSON(http.StatusBadRequest, gin.H{"error": "At least one search parameter (title, isbn, or author) is required"})
            return
        }

        var matchingBooks []models.Book
        query := db.Where("library_id = ?", libraryID)

        if title != "" {
            query = query.Where("LOWER(title) LIKE ?", "%"+strings.ToLower(title)+"%")
        }

        if isbn != "" {
            query = query.Where("isbn LIKE ?", "%"+isbn+"%")
        }

        if author != "" {
            query = query.Where("LOWER(author) LIKE ?", "%"+strings.ToLower(author)+"%")
        }

        if publisher != "" {
            query = query.Where("LOWER(publisher) LIKE ?", "%"+strings.ToLower(publisher)+"%")
        }

        if err := query.Find(&matchingBooks).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch books: " + err.Error()})
            return
        }

        if len(matchingBooks) == 0 {
            c.JSON(http.StatusNotFound, gin.H{"message": "No books found matching the criteria"})
            return
        }

        c.JSON(http.StatusOK, gin.H{"books": matchingBooks})
    }
}

func RequestBook(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        type RequestBookInput struct {
            BookID uint `json:"book_id" binding:"required"`
        }

        memberIDRaw, exists := c.Get("membership_id")
        if !exists {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
            return
        }

        memberID, ok := memberIDRaw.(uint)
        if !ok {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid member ID format"})
            return
        }

        var input RequestBookInput
        if err := c.ShouldBindJSON(&input); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input: " + err.Error()})
            return
        }

        bookRequest := models.BookRequest{
            MembershipID:    memberID,
            BookID:      input.BookID,
            Status:      "requested",
            RequestedAt: time.Now(),
        }

        tx := db.Begin()
        defer func() {
            if r := recover(); r != nil {
                tx.Rollback()
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Unexpected error occurred"})
            }
        }()

        err := tx.Create(&bookRequest).Error
        if err != nil {
            tx.Rollback()
            if strings.Contains(err.Error(), "duplicate key value") || strings.Contains(err.Error(), "UNIQUE constraint failed") {
                c.JSON(http.StatusConflict, gin.H{"error": "You have already requested this book"})
            } else {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create book request: " + err.Error()})
            }
            return
        }

        tx.Commit()

        c.JSON(http.StatusOK, gin.H{
            "message":      "Book request created successfully",
            "book_request": bookRequest,
        })
    }
}

// FetchBookRequests retrieves book requests for a member with book details
func FetchBookRequests(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        memberIDRaw, exists := c.Get("membership_id")
        if !exists {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
            return
        }

        memberID, ok := memberIDRaw.(uint)
        if !ok {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid member ID format"})
            return
        }

        status := c.Query("status")

        type BookRequestWithDetails struct {
            ID              uint       `json:"id"`
            Status          string     `json:"status"`
            RequestedAt     time.Time  `json:"requested_at"`
            ApprovedAt      *time.Time `json:"approved_at,omitempty"`
            LibrarianID     *uint      `json:"librarian_id,omitempty"`
            BookID          uint       `json:"book_id"`
            Title           string     `json:"title"`
            Author          string     `json:"author"`
            Publisher       string     `json:"publisher,omitempty"`
            ISBN            string     `json:"isbn"`
            TotalCopies     int        `json:"total_copies"`
            AvailableCopies int        `json:"available_copies"`
        }

        var bookRequestsWithDetails []BookRequestWithDetails

        query := db.Table("book_requests").
            Select(`book_requests.id, book_requests.status, book_requests.requested_at, 
                    book_requests.approved_at, book_requests.librarian_id,
                    books.id as book_id, books.title, books.author, books.publisher, 
                    books.isbn, books.total_copies, books.available_copies`).
            Joins("JOIN books ON books.id = book_requests.book_id").
            Where("book_requests.membership_id = ?", memberID)

        if status != "" {
            query = query.Where("book_requests.status = ?", status)
        }

        if err := query.Find(&bookRequestsWithDetails).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch book requests: " + err.Error()})
            return
        }

        c.JSON(http.StatusOK, gin.H{"book_requests": bookRequestsWithDetails})
    }
}

func CancelBookRequest(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        memberIDRaw, exists := c.Get("membership_id")
        if !exists {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
            return
        }

        memberID, ok := memberIDRaw.(uint)
        if !ok {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid member ID format"})
            return
        }

        bookRequestID := c.Param("book_request_id")

        tx := db.Begin()
        defer func() {
            if r := recover(); r != nil {
                tx.Rollback()
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Unexpected error occurred"})
            }
        }()

        var bookRequest models.BookRequest
        if err := tx.Where("id = ? AND membership_id = ?", bookRequestID, memberID).First(&bookRequest).Error; err != nil {
            tx.Rollback()
            c.JSON(http.StatusNotFound, gin.H{"error": "Book request not found"})
            return
        }

        if err := tx.Delete(&bookRequest).Error; err != nil {
            tx.Rollback()
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to cancel book request: " + err.Error()})
            return
        }

        tx.Commit()

        c.JSON(http.StatusOK, gin.H{"message": "Book request canceled successfully"})
    }
}


func GetMemberDashboard(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        // Extract member ID, library ID, and user ID from the auth middleware
        memberIDRaw, exists := c.Get("membership_id")
        if !exists {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Member authentication required"})
            return
        }

        libraryIDRaw, exists := c.Get("library_id")
        if !exists {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Library information missing"})
            return
        }

        userIDRaw, exists := c.Get("user_id")
        if !exists {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID missing"})
            return
        }

        // Convert to appropriate types
        memberID, ok := memberIDRaw.(uint)
        if !ok {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid member ID format"})
            return
        }

        libraryID, ok := libraryIDRaw.(uint)
        if !ok {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid library ID format"})
            return
        }

        userID, ok := userIDRaw.(uint)
        if !ok {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID format"})
            return
        }

        var totalBooksBorrowed int64
        var totalOverdueBooks int64

        // Count total books borrowed by the member
        if err := db.Model(&models.BookTransaction{}).
            Joins("JOIN books ON books.id = book_transactions.book_id").
            Where("book_transactions.membership_id = ? AND books.library_id = ? AND book_transactions.is_return_approved = false", memberID, libraryID).
            Count(&totalBooksBorrowed).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch borrowed books count"})
            return
        }



        // Count total overdue books (Handle nullable `due_date` and possible DB issues)
        query := db.Model(&models.BookTransaction{}).
            Joins("JOIN books ON books.id = book_transactions.book_id").
            Where("book_transactions.membership_id = ? AND books.library_id = ? AND book_transactions.is_return_approved = false", 
                memberID, libraryID).
            Where("book_transactions.due_date IS NOT NULL AND book_transactions.due_date < ?", time.Now()).
            Count(&totalOverdueBooks)

        if query.Error != nil {
            log.Printf("Error fetching overdue books: %v", query.Error) // Log the actual error
            // totalOverdueBooks = 0 // Gracefully handle failure
        }

        // Return dashboard values
        c.JSON(http.StatusOK, gin.H{
            "user_id":              userID,
            "library_id":           libraryID,
            "member_id":            memberID,
            "total_books_borrowed": totalBooksBorrowed,
            "total_overdue_books":  totalOverdueBooks,
        })
    }
}

func FetchRecentTransactions(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        // Extract member ID and library ID from auth middleware
        memberIDRaw, exists := c.Get("membership_id")
        if !exists {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Member authentication required"})
            return
        }

        libraryIDRaw, exists := c.Get("library_id")
        if !exists {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Library information missing"})
            return
        }

        // Convert to appropriate types
        memberID, ok := memberIDRaw.(uint)
        if !ok {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid member ID format"})
            return
        }

        libraryID, ok := libraryIDRaw.(uint)
        if !ok {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid library ID format"})
            return
        }

        // Fetch recent transactions with book details
        var transactions []models.BookTransaction
        if err := db.Preload("Book"). // Ensure book details are fetched
            Joins("JOIN books ON books.id = book_transactions.book_id").
            Where("book_transactions.membership_id = ? AND books.library_id = ?", memberID, libraryID).
            Order("book_transactions.borrowed_at DESC").
            Limit(10).
            Find(&transactions).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch transactions"})
            return
        }

        c.JSON(http.StatusOK, transactions)
    }
}
