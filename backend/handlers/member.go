package handlers

import (
	"encoding/base64"
	"io/ioutil"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/mxansari007/librarymanagement/models"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"strings"
)

func SignupMember(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			FirstName     string `form:"firstname" binding:"required"`
			LastName      string `form:"lastname" binding:"required"`
			Email         string `form:"email" binding:"required,email"`
			PasswordHash      string `form:"password" binding:"required,min=8"`
			AadhaarNumber string `form:"aadhaar_number" binding:"required"`
			LibraryID     uint   `form:"library_id" binding:"required"`
		}

		// Bind form data
		if err := c.ShouldBind(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid form data: " + err.Error()})
			return
		}

		// Retrieve the Aadhaar image file
		file, header, err := c.Request.FormFile("aadhaar_image")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read Aadhaar image: " + err.Error()})
			return
		}
		defer file.Close()

		// Validate file type
		if header.Header.Get("Content-Type") != "image/png" && header.Header.Get("Content-Type") != "image/jpeg" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid file type. Only PNG and JPEG are allowed"})
			return
		}

		// Read file content and encode to base64
		fileBytes, err := ioutil.ReadAll(file)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process Aadhaar image: " + err.Error()})
			return
		}
		encodedImage := base64.StdEncoding.EncodeToString(fileBytes)

		// Hash the password
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.PasswordHash), bcrypt.DefaultCost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password: " + err.Error()})
			return
		}

		// Start a database transaction
		tx := db.Begin()
		defer func() {
			if r := recover(); r != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Unexpected error occurred"})
			}
		}()

		// Create the member
		member := models.User{
			FirstName:      req.FirstName,
			LastName:       req.LastName,
			Email:          req.Email,
			PasswordHash:   string(hashedPassword),
			Role:           "member",
			AadhaarNumber:  &req.AadhaarNumber,
			AadhaarImageURL: &encodedImage,
			IsVerified:     false,
			CreatedAt:      time.Now(),
		}

		// Save the member
		if err := tx.Create(&member).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create member: " + err.Error()})
			return
		}

		// Check if the library exists
		var library models.Library
		if err := db.First(&library, req.LibraryID).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusNotFound, gin.H{"error": "Library not found"})
			return
		}

		// Create a membership for the user
		membership := models.LibraryMembership{
			MemberID:         member.ID,
			LibraryID:        req.LibraryID,
			IsPaidMembership: false, // Defaulting to free membership; modify as needed
			StartDate:        time.Now(),
			EndDate:          time.Now().AddDate(1, 0, 0), // 1-year validity
			CreatedAt:        time.Now(),
		}

		// Save the membership
		if err := tx.Create(&membership).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create membership: " + err.Error()})
			return
		}

		// Commit the transaction
		tx.Commit()

		c.JSON(http.StatusCreated, gin.H{
			"message":      "Member signed up and subscribed to library successfully",
			"member_id":    member.ID,
			"membership_id": membership.ID,
		})
	}
}


// make api to fetch all books by name if book is available in library make it a get request ignore case sensitivity


// type Book struct {
// 	ID        uint      `gorm:"primaryKey" json:"id"`
// 	LibraryID uint      `gorm:"not null" json:"library_id"`
// 	Title     string    `gorm:"not null" json:"title"`
// 	Author    string    `gorm:"not null" json:"author"`
// 	Publisher string    `json:"publisher"`
// 	BookImage string    `json:"book_image"`
// 	Version   string    `json:"version"`
// 	ISBN      string    `gorm:"unique;not null" json:"isbn"`
// 	TotalCopies int       `gorm:"not null" json:"total_copies"`
// 	AvailableCopies int    `gorm:"not null" json:"available_copies"`
// 	CreatedAt time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
// }




// FetchBooks handles searching books by different criteria (Name, ISBN, Author)
// FetchBooks handles searching books by different criteria (Name, ISBN, Author)
func FetchBooks(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        // Get library_id from the authentication context (set by AuthMiddleware)
        libraryIDRaw, exists := c.Get("library_id")
        if !exists {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required or library ID missing"})
            return
        }

        // Type assert the library_id to uint
        libraryID, ok := libraryIDRaw.(uint)
        if !ok {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid library ID format"})
            return
        }

        // Get query parameters
        title := c.Query("title")
        isbn := c.Query("isbn")
        author := c.Query("author")

        // Check if at least one search parameter is provided
        if title == "" && isbn == "" && author == "" {
            c.JSON(http.StatusBadRequest, gin.H{"error": "At least one search parameter (title, isbn, or author) is required"})
            return
        }

        // Start a database transaction
        tx := db.Begin()
        defer func() {
            if r := recover(); r != nil {
                tx.Rollback()
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Unexpected error occurred"})
            }
        }()

        // Create a temporary slice to store matching books
        var matchingBooks []models.Book

        // Build query based on provided parameters
        query := tx.Where("library_id = ?", libraryID)

        if title != "" {
            query = query.Where("LOWER(title) LIKE ?", "%"+strings.ToLower(title)+"%")
        }

        if isbn != "" {
            query = query.Where("isbn LIKE ?", "%"+isbn+"%")
        }

        if author != "" {
            query = query.Where("LOWER(author) LIKE ?", "%"+strings.ToLower(author)+"%")
        }

        // Execute the query
        if err := query.Find(&matchingBooks).Error; err != nil {
            tx.Rollback()
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch books: " + err.Error()})
            return
        }

        // Check if no books were found
        if len(matchingBooks) == 0 {
            c.JSON(http.StatusNotFound, gin.H{"message": "No books found matching the criteria"})
            return
        }

        // Commit the transaction
        tx.Commit()

        // Return the books directly
        c.JSON(http.StatusOK, gin.H{"books": matchingBooks})
    }
}


func RequestBook(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        // Get member_id from context (set by AuthMiddleware as "user_id")
        type RequestBookInput struct {
            BookID uint `json:"book_id" binding:"required"`
        }

        memberIDRaw, exists := c.Get("user_id")
        if !exists {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
            return
        }

        memberID, ok := memberIDRaw.(uint)
        if !ok {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid member ID format"})
            return
        }

        // Bind JSON input from frontend
        var input RequestBookInput
        if err := c.ShouldBindJSON(&input); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input: " + err.Error()})
            return
        }

        // Create book request
        bookRequest := models.BookRequest{
            MemberID:    memberID,
            BookID:      input.BookID,
            Status:      "requested",
            RequestedAt: time.Now(),
        }

        // Start transaction
        tx := db.Begin()
        defer func() {
            if r := recover(); r != nil {
                tx.Rollback()
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Unexpected error occurred"})
            }
        }()

        // Attempt to create the record with conflict handling
        err := tx.Create(&bookRequest).Error
        if err != nil {
            tx.Rollback()
            
            // Check for unique constraint violation
            if strings.Contains(err.Error(), "duplicate key value") || strings.Contains(err.Error(), "UNIQUE constraint failed") {
                c.JSON(http.StatusConflict, gin.H{"error": "You have already requested this book"})
            } else {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create book request: " + err.Error()})
            }
            return
        }

        // Commit transaction
        tx.Commit()

        // Return success response
        c.JSON(http.StatusOK, gin.H{
            "message": "Book request created successfully",
            "book_request": bookRequest,
        })
    }
}


// FetchBookRequests retrieves book requests for a member with book details
func FetchBookRequests(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        // Get member_id from context (set by AuthMiddleware as "user_id")
        memberIDRaw, exists := c.Get("user_id")
        if !exists {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
            return
        }

        memberID, ok := memberIDRaw.(uint)
        if !ok {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid member ID format"})
            return
        }

        // Get status from query parameter
        status := c.Query("status")

        // Start transaction
        tx := db.Begin()
        defer func() {
            if r := recover(); r != nil {
                tx.Rollback()
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Unexpected error occurred"})
            }
        }()

        // Define a struct to hold the combined book request and book details
        type BookRequestWithDetails struct {
            ID          uint      `json:"id"`
            Status      string    `json:"status"`
            RequestedAt time.Time `json:"requested_at"`
            ApprovedAt  time.Time `json:"approved_at,omitempty"`
            LibrarianID uint      `json:"librarian_id,omitempty"`
            
            // Book details
            BookID         uint   `json:"book_id"`
            Title          string `json:"title"`
            Author         string `json:"author"`
            Publisher      string `json:"publisher,omitempty"`
            ISBN           string `json:"isbn"`
            TotalCopies    int    `json:"total_copies"`
            AvailableCopies int   `json:"available_copies"`
        }

        var bookRequestsWithDetails []BookRequestWithDetails

        // Build query with JOIN to get book details
        query := tx.Table("book_requests").
            Select(`book_requests.id, book_requests.status, book_requests.requested_at, 
                book_requests.approved_at, book_requests.librarian_id,
                books.id as book_id, books.title, books.author, books.publisher, 
                books.isbn, books.total_copies, books.available_copies`).
            Joins("JOIN books ON books.id = book_requests.book_id").
            Where("book_requests.member_id = ?", memberID)

        // Add status filter if provided
        if status != "" {
            query = query.Where("book_requests.status = ?", status)
        }

        // Execute query
        if err := query.Scan(&bookRequestsWithDetails).Error; err != nil {
            tx.Rollback()
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch book requests: " + err.Error()})
            return
        }

        // Commit transaction
        tx.Commit()

        // Return book requests with details
        c.JSON(http.StatusOK, gin.H{"book_requests": bookRequestsWithDetails})
    }
}


func CancelBookRequest(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        // Get member_id from context (set by AuthMiddleware as "user_id")
        memberIDRaw, exists := c.Get("user_id")
        if!exists {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
            return
        }

        memberID, ok := memberIDRaw.(uint)

        if!ok {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid member ID format"})
            return
        }

        // Get book_request_id from URL parameter
        bookRequestID := c.Param("book_request_id")

        // Start transaction
        tx := db.Begin()
        defer func() {
            if r := recover(); r!= nil {
                tx.Rollback()
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Unexpected error occurred"})
            }
        }()

        // Check if the book request exists and belongs to the member
        var bookRequest models.BookRequest
        if err := tx.Where("id =? AND member_id =?", bookRequestID, memberID).First(&bookRequest).Error; err!= nil {
            tx.Rollback()
            c.JSON(http.StatusNotFound, gin.H{"error": "Book request not found"})
            return
        }

        // Delete the book request
        if err := tx.Delete(&bookRequest).Error; err!= nil {
            tx.Rollback()
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to cancel book request: " + err.Error()})
            return
        }

        // Commit transaction
        tx.Commit()

        // Return success response
        c.JSON(http.StatusOK, gin.H{"message": "Book request canceled successfully"})
    }
}