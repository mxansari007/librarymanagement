package handlers

import (
	"encoding/base64"
	"io"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/mxansari007/librarymanagement/models"
	"github.com/mxansari007/librarymanagement/utils"
	"gorm.io/gorm"
)

func CreateBook(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        libraryID, err := strconv.Atoi(c.PostForm("library_id"))
        if err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid library ID"})
            return
        }

        totalCopies, err := strconv.Atoi(c.PostForm("total_copies"))
        if err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid total copies"})
            return
        }

        availableCopies, err := strconv.Atoi(c.PostForm("available_copies"))
        if err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid available copies"})
            return
        }

        title := c.PostForm("title")
        author := c.PostForm("author")
        if title == "" || author == "" {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Title and Author are required"})
            return
        }

        // Construct book model (omit CreatedAt; GORM handles it)
        book := models.Book{
            LibraryID:       uint(libraryID),
            Title:           title,
            Author:          author,
            Publisher:       c.PostForm("publisher"),
            Version:         c.PostForm("version"),
            TotalCopies:     totalCopies,
            AvailableCopies: availableCopies,
            ISBN:            utils.GenerateISBN(),
        }

        // Check if book already exists (consider using ISBN for uniqueness)
        var existingBook models.Book
        if err := db.Where("isbn = ?", book.ISBN).First(&existingBook).Error; err == nil {
            c.JSON(http.StatusConflict, gin.H{"error": "Book with this ISBN already exists"})
            return
        }

        // Handle book image
        file, err := c.FormFile("book_image")
        if err == nil {
            src, err := file.Open()
            if err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open book image"})
                return
            }
            defer src.Close()

            bookCoverBytes, err := io.ReadAll(src)
            if err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read book image"})
                return
            }
            book.BookImage = base64.StdEncoding.EncodeToString(bookCoverBytes)
        }

        // Save book in db
        if err := db.Create(&book).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create book"})
            return
        }

        log.Printf("Book created: ID: %d, Title: %s", book.ID, book.Title)
        c.JSON(http.StatusCreated, gin.H{"data": book})
    }
}

func GetAllBooks(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        var books []models.Book

        userRole, exists := c.Get("role")
        if !exists || userRole != "librarian" {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized access"})
            return
        }

        libraryIDRaw, exists := c.Get("library_id")
        if !exists {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Library ID not found"})
            return
        }

        libraryID, ok := libraryIDRaw.(uint)
        if !ok {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid library ID format"})
            return
        }

        result := db.Where("library_id = ? AND available_copies > 0", libraryID).Find(&books)
        if result.Error != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching books"})
            return
        }

        log.Printf("Books retrieved: Library ID: %d, Count: %d", libraryID, len(books))
        c.JSON(http.StatusOK, gin.H{"data": books})
    }
}

func GetBookByID(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        bookID, err := strconv.Atoi(c.Param("book_id"))
        if err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid book ID"})
            return
        }

        var book models.Book
        if err := db.Where("id = ?", bookID).First(&book).Error; err != nil {
            c.JSON(http.StatusNotFound, gin.H{"error": "Book not found"})
            return
        }

        log.Printf("Book retrieved: ID: %d, Title: %s", book.ID, book.Title)
        c.JSON(http.StatusOK, gin.H{"data": book})
    }
}

func ChangeStatus(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        var user models.User
        if err := db.Where("email = ?", c.Param("email")).First(&user).Error; err != nil {
            c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
            return
        }

        if user.IsVerified {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Account is already verified"})
            return
        }

        user.IsVerified = true
        if err := db.Save(&user).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
            return
        }

        c.JSON(http.StatusOK, gin.H{"message": "Account verified"})
    }
}


func DeleteMember(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        tx := db.Begin()
        if tx.Error != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start transaction"})
            return
        }

        var user models.User
        if err := tx.Where("email = ?", c.Param("email")).First(&user).Error; err != nil {
            tx.Rollback()
            c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
            return
        }

        var requestBody struct {
            Reason string `json:"reason"`
        }
        if err := c.ShouldBindJSON(&requestBody); err != nil {
            tx.Rollback()
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
            return
        }

        rejectedUser := models.RejectedUser{
            Email:      user.Email,
            Reason:     requestBody.Reason,
            RejectedAt: time.Now(),
        }
        if err := tx.Create(&rejectedUser).Error; err != nil {
            tx.Rollback()
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add entry to rejected users"})
            return
        }

        if err := tx.Where("member_id = ?", user.ID).Delete(&models.LibraryMembership{}).Error; err != nil {
            tx.Rollback()
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user from library memberships"})
            return
        }

        if err := tx.Delete(&user).Error; err != nil {
            tx.Rollback()
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
            return
        }

        if err := tx.Commit().Error; err != nil {
            tx.Rollback()
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
            return
        }

        c.JSON(http.StatusOK, gin.H{"message": "User deleted"})
    }
}

func GetLibraryBookRequests(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        // Get library_id from context (set by AuthMiddleware)
        libraryIDRaw, exists := c.Get("library_id")
        if !exists {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
            return
        }

        libraryID, ok := libraryIDRaw.(uint)
        if !ok {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid library ID format"})
            return
        }

        // Get status from query parameter if provided
        status := c.Query("status")

        // Struct to hold enriched book request data
        type BookRequestDetails struct {
            ID          uint      `json:"id"`
            Status      string    `json:"status"`
            RequestedAt time.Time `json:"requested_at"`
            ApprovedAt  *time.Time `json:"approved_at,omitempty"`

            // Member details
            MemberID     uint   `json:"member_id"`
            FirstName    string `json:"first_name"`
            LastName     string `json:"last_name"`
            MemberEmail  string `json:"member_email"`
            ContactNumber string `json:"contact_number"`

            // Book details
            BookID    uint   `json:"book_id"`
            Title     string `json:"title"`
            Author    string `json:"author"`
            ISBN      string `json:"isbn"`
            
            // Transaction details (for approved requests)
            TransactionID uint   `json:"transaction_id,omitempty"`
        }

        var bookRequests []BookRequestDetails
        var query *gorm.DB

        // If status is explicitly set to "approved", use INNER JOIN to ensure we only get approved requests with transaction IDs
        if status == "approved" {
            query = db.Table("book_requests").
                Select(`book_requests.id, book_requests.status, book_requests.requested_at, 
                        book_requests.approved_at, 
                        members.id as member_id, members.first_name, members.last_name, 
                        members.email as member_email, members.contact_number, 
                        books.id as book_id, books.title, books.author, books.isbn,
                        book_transactions.id as transaction_id`).
                Joins("JOIN books ON books.id = book_requests.book_id").
                Joins("JOIN library_memberships as memberships ON memberships.id = book_requests.membership_id").
                // Use INNER JOIN to ensure we only get records with transaction IDs
                Joins("INNER JOIN users as members ON members.id = memberships.member_id").
                Joins("INNER JOIN book_transactions ON book_transactions.book_id = book_requests.book_id AND book_transactions.membership_id = book_requests.membership_id").
                Where("books.library_id = ? AND book_requests.status = 'approved' AND book_transactions.is_return_approved = false", libraryID)
        } else {
            // Original query for other statuses or when no status is specified
            query = db.Table("book_requests").
                Select(`book_requests.id, book_requests.status, book_requests.requested_at, 
                        book_requests.approved_at, 
                        members.id as member_id, members.first_name, members.last_name, 
                        members.email as member_email, members.contact_number, 
                        books.id as book_id, books.title, books.author, books.isbn,
                        book_transactions.id as transaction_id`).
                Joins("JOIN books ON books.id = book_requests.book_id").
                Joins("JOIN library_memberships as memberships ON memberships.id = book_requests.membership_id").
                Joins("JOIN users as members ON members.id = memberships.member_id").
                // Left join with book_transactions to get transaction ID for approved requests
                Joins("LEFT JOIN book_transactions ON book_transactions.book_id = book_requests.book_id AND book_transactions.membership_id = book_requests.membership_id AND book_requests.status = 'approved'").
                Where("books.library_id = ?", libraryID)

            // Add status filter if provided
            if status != "" {
                query = query.Where("book_requests.status = ?", status)
            }
        }

        // Execute the query
        if err := query.Scan(&bookRequests).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch book requests"})
            return
        }

        // Log the retrieval with status filter if applied
        if status != "" {
            log.Printf("Book requests retrieved: Library ID: %v, Status: %s, Count: %d", libraryID, status, len(bookRequests))
        } else {
            log.Printf("All book requests retrieved: Library ID: %v, Count: %d", libraryID, len(bookRequests))
        }

        c.JSON(http.StatusOK, gin.H{"book_requests": bookRequests})
    }
}



func ApproveBookRequest(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        librarianIDRaw, exists := c.Get("librarian_id")
        if !exists {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
            return
        }

        librarianID, ok := librarianIDRaw.(uint)
        if !ok {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid librarian ID format"})
            return
        }

        type ApproveRequestInput struct {
            RequestID uint      `json:"request_id" binding:"required"`
            DueDate   time.Time `json:"due_date"`
        }

        var input ApproveRequestInput
        if err := c.ShouldBindJSON(&input); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input: " + err.Error()})
            return
        }
        log.Printf("Approving book request: Request ID: %v, Librarian ID: %v", input.RequestID, librarianID)

        // Ensure the librarian exists before proceeding
        var librarian models.Librarian
        if err := db.First(&librarian, librarianID).Error; err != nil {
            c.JSON(http.StatusNotFound, gin.H{"error": "Librarian not found"})
            return
        }

        var bookRequest models.BookRequest
        if err := db.First(&bookRequest, input.RequestID).Error; err != nil {
            c.JSON(http.StatusNotFound, gin.H{"error": "Book request not found"})
            return
        }

        var book models.Book
        if err := db.First(&book, bookRequest.BookID).Error; err != nil {
            c.JSON(http.StatusNotFound, gin.H{"error": "Book not found"})
            return
        }

        // Check if there are available copies
        if book.AvailableCopies < 1 {
            c.JSON(http.StatusBadRequest, gin.H{"error": "No available copies of this book"})
            return
        }

        // Start a new transaction to ensure atomicity
        tx := db.Begin()
        if tx.Error != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start transaction"})
            return
        }

        defer func() {
            if r := recover(); r != nil {
                tx.Rollback()
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Unexpected error occurred"})
            }
        }()

        approvedAt := time.Now()
        dueDate := input.DueDate
        if dueDate.IsZero() {
            dueDate = approvedAt.AddDate(0, 0, 7) // Default to 7 days
        }

        // Update book request status to "approved"
        if err := tx.Model(&bookRequest).
            Updates(models.BookRequest{
                Status:      "approved",
                ApprovedAt:  approvedAt,
                LibrarianID: &librarianID,
            }).Error; err != nil {
            tx.Rollback()
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update book request: " + err.Error()})
            return
        }

        // Create a new book transaction
        var returnedAt *time.Time // Nil by default

        bookTransaction := models.BookTransaction{
            BookID:           bookRequest.BookID,
            MembershipID:     bookRequest.MembershipID,
            LibrarianID:      librarianID,
            BorrowedAt:       approvedAt,
            DueDate:          dueDate,
            IsReturnApproved: false,
            ReturnedAt:       returnedAt, // Using a pointer to allow nil
        }

        if err := tx.Create(&bookTransaction).Error; err != nil {
            tx.Rollback()
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create book transaction: " + err.Error()})
            return
        }

        // Update the available copies of the book
        if err := tx.Model(&book).
            UpdateColumn("available_copies", gorm.Expr("available_copies - 1")).Error; err != nil {
            tx.Rollback()
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update book availability: " + err.Error()})
            return
        }

        // Commit the transaction if everything is successful
        if err := tx.Commit().Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction: " + err.Error()})
            return
        }

        // Return success response
        c.JSON(http.StatusOK, gin.H{
            "message":  "Book request approved successfully",
            "due_date": dueDate.Format("2006-01-02 15:04:05"),
        })
    }
}



func ReturnBook(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        type ReturnBookInput struct {
            TransactionID uint `json:"transaction_id" binding:"required"`
        }

        var input ReturnBookInput
        if err := c.ShouldBindJSON(&input); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input: " + err.Error()})
            return
        }

        tx := db.Begin()
        if tx.Error != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start transaction"})
            return
        }

        var bookTransaction models.BookTransaction
        if err := tx.First(&bookTransaction, input.TransactionID).Error; err != nil {
            tx.Rollback()
            c.JSON(http.StatusNotFound, gin.H{"error": "Book transaction not found"})
            return
        }

        // Check if book is already returned
        if bookTransaction.IsReturnApproved {
            tx.Rollback()
            c.JSON(http.StatusBadRequest, gin.H{"error": "Book is already returned"})
            return
        }

        returnedAt := time.Now()
        if err := tx.Model(&bookTransaction).Updates(map[string]interface{}{
            "returned_at":       &returnedAt,
            "is_return_approved": true,
        }).Error; err != nil {
            tx.Rollback()
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update book transaction"})
            return
        }

        // Update available copies of the book
        var book models.Book
        if err := tx.First(&book, bookTransaction.BookID).Error; err != nil {
            tx.Rollback()
            c.JSON(http.StatusNotFound, gin.H{"error": "Book not found"})
            return
        }

        if err := tx.Model(&book).UpdateColumn("available_copies", gorm.Expr("available_copies + 1")).Error; err != nil {
            tx.Rollback()
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update book availability"})
            return
        }

        // Delete the book request entry related to this book transaction
        if err := tx.Where("book_id = ? AND membership_id = ? AND status = 'approved'", 
            bookTransaction.BookID, bookTransaction.MembershipID).Delete(&models.BookRequest{}).Error; err != nil {
            tx.Rollback()
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete book request entry"})
            return
        }

        // Commit the transaction
        if err := tx.Commit().Error; err != nil {
            tx.Rollback()
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
            return
        }

        log.Printf("Book returned: Transaction ID: %d, Book ID: %d, Member ID: %d",
            bookTransaction.ID, bookTransaction.BookID, bookTransaction.MembershipID)
        c.JSON(http.StatusOK, gin.H{"message": "Book returned successfully"})
    }
}


func GetReturnedBooks(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        libraryIDRaw, exists := c.Get("library_id")
        if !exists {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
            return
        }

        libraryID, ok := libraryIDRaw.(uint)
        if !ok {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid library ID format"})
            return
        }

        type ReturnedBookDetails struct {
            TransactionID   uint       `json:"transaction_id"`
            BorrowedAt      time.Time  `json:"borrowed_at"`
            ReturnedAt      *time.Time `json:"returned_at"`
            MemberID        uint       `json:"member_id"`
            MemberFirstName string     `json:"member_first_name"`
            MemberLastName  string     `json:"member_last_name"`
            MemberEmail     string     `json:"member_email"`
            ContactNumber   string     `json:"contact_number"`
            BookID          uint       `json:"book_id"`
            Title           string     `json:"title"`
            Author          string     `json:"author"`
            ISBN            string     `json:"isbn"`
            LibrarianID     *uint      `json:"librarian_id"`
            LibrarianName   string     `json:"librarian_name"`
        }

        var returnedBooks []ReturnedBookDetails

        query := db.Table("book_transactions").
            Select(`book_transactions.id as transaction_id, book_transactions.borrowed_at, book_transactions.returned_at,
                    members.id as member_id, members.first_name as member_first_name, members.last_name as member_last_name, 
                    members.email as member_email, members.contact_number,
                    books.id as book_id, books.title, books.author, books.isbn,
                    book_transactions.librarian_id, CONCAT(librarians.first_name, ' ', librarians.last_name) as librarian_name`).
            Joins("JOIN books ON books.id = book_transactions.book_id").
            Joins("JOIN library_memberships as memberships ON memberships.id = book_transactions.membership_id").
            Joins("JOIN users as members ON members.id = memberships.member_id").
            Joins("LEFT JOIN users as librarians ON librarians.id = book_transactions.librarian_id").
            Where("books.library_id = ? AND book_transactions.is_return_approved = true", libraryID)

        if err := query.Scan(&returnedBooks).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch returned books"})
            return
        }

        log.Printf("Returned books retrieved: Library ID: %d, Count: %d", libraryID, len(returnedBooks))
        c.JSON(http.StatusOK, gin.H{"returned_books": returnedBooks})
    }
}
