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

		// Construct book model
		book := models.Book{
			LibraryID:       uint(libraryID),
			Title:           c.PostForm("title"),
			Author:          c.PostForm("author"),
			Publisher:       c.PostForm("publisher"),
			Version:         c.PostForm("version"),
			TotalCopies:     totalCopies,
			AvailableCopies: availableCopies,
			CreatedAt:       time.Now(),
		}

		// Check if book already exists (by title)
		var existingBook models.Book
		if err := db.Where("title = ?", book.Title).First(&existingBook).Error; err == nil {
			c.JSON(http.StatusConflict, gin.H{"error": "Book already exists"})
			return
		}

		// Generate ISBN if not provided
		book.ISBN = utils.GenerateISBN()

		// Handle book image
		file, err := c.FormFile("book_image")
		if err == nil { // If file exists
			src, err := file.Open()
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open book image"})
				return
			}
			defer src.Close()

			// Read file bytes and convert to base64
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

		// Log creation and return response
		log.Printf("Book created: ID: %d, Title: %s", book.ID, book.Title)
		c.JSON(http.StatusCreated, gin.H{"data": book})
	}
}


func GetAllBooks(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var books []models.Book

		// Get library_id from JWT claims
		userRole, exists := c.Get("role")
		if !exists || userRole != "librarian" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized access"})
			return
		}

		libraryID, exists := c.Get("library_id")
		if !exists {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Library ID not found"})
			return
		}

		// Fetch books only from this librarian's library
		result := db.Where("library_id = ? AND available_copies > 0", libraryID).Find(&books)
		if result.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching books"})
			return
		}

		// Log retrieval and return response
		log.Printf("Books retrieved: Library ID: %v, Count: %d", libraryID, len(books))
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

        // Log retrieval and return response
        log.Printf("Book retrieved: ID: %d, Title: %s", book.ID, book.Title)
        c.JSON(http.StatusOK, gin.H{"data": book})
    }
}


//  make api to change status of member from isVerified to true
// so the thing is i have two buttons in my frontend one for approve and one for reject
// if i click on approve button then the status of the member should change to true
// if i click on reject button then delete that member from the database which is in first delete entry from library_memberships table then delete from users table
// so i have to make two apis for this one for approve and one for reject

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
		// Start transaction
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

		// Get rejection reason from request body
		var requestBody struct {
			Reason string `json:"reason"`
		}
		if err := c.ShouldBindJSON(&requestBody); err != nil {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
			return
		}

		// Add entry to rejected_users table
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

		// Delete user from library_memberships table
		if err := tx.Where("member_id = ?", user.ID).Delete(&models.LibraryMembership{}).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user from library memberships"})
			return
		}

		// Delete user from users table
		if err := tx.Delete(&user).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
			return
		}

		// Commit transaction
		if err := tx.Commit().Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "User deleted"})
	}
}


// func GetLibraryBookRequests(db *gorm.DB) gin.HandlerFunc {
//     return func(c *gin.Context) {
//         type LibraryRequestInput struct {
//             LibraryID uint `json:"library_id" binding:"required"`
//         }

//         var input LibraryRequestInput
//         if err := c.ShouldBindJSON(&input); err != nil {
//             c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input: " + err.Error()})
//             return
//         }

//         var bookRequests []models.BookRequest
//         if err := db.Joins("JOIN books ON books.id = book_requests.book_id").
//             Where("books.library_id = ?", input.LibraryID).
//             Find(&bookRequests).Error; err != nil {
//             c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch book requests"})
//             return
//         }

//         c.JSON(http.StatusOK, gin.H{"book_requests": bookRequests})
//     }
// }

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

        // Struct to hold enriched book request data
        type BookRequestDetails struct {
            ID          uint      `json:"id"`
            Status      string    `json:"status"`
            RequestedAt time.Time `json:"requested_at"`
            ApprovedAt  *time.Time `json:"approved_at,omitempty"`

            // Member details
            MemberID uint   `json:"member_id"`
            FirstName string `json:"first_name"`
			LastName  string `json:"last_name"`
            MemberEmail string `json:"member_email"`
			ContactNumber string `json:"contact_number"`

            // Book details
            BookID    uint   `json:"book_id"`
            Title     string `json:"title"`
            Author    string `json:"author"`
            ISBN      string `json:"isbn"`
        }

        var bookRequests []BookRequestDetails

        if err := db.Table("book_requests").
		Select(`book_requests.id, book_requests.status, book_requests.requested_at, 
		book_requests.approved_at, 
		members.id as member_id, members.first_name, members.last_name, 
		members.email as member_email, members.contact_number, 
		books.id as book_id, books.title, books.author, books.isbn`).
		Joins("JOIN books ON books.id = book_requests.book_id").
		Joins("JOIN users as members ON members.id = book_requests.member_id").
		Where("books.library_id = ?", libraryID).
            Scan(&bookRequests).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch book requests"})
            return
        }

        c.JSON(http.StatusOK, gin.H{"book_requests": bookRequests})
    }
}





func ApproveBookRequest(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        // Get librarian ID from context (set by AuthMiddleware)
        librarianIDRaw, exists := c.Get("user_id")
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
            RequestID uint `json:"request_id" binding:"required"`
        }

        var input ApproveRequestInput
        if err := c.ShouldBindJSON(&input); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input: " + err.Error()})
            return
        }

        // Retrieve book request details
        var bookRequest models.BookRequest
        if err := db.First(&bookRequest, input.RequestID).Error; err != nil {
            c.JSON(http.StatusNotFound, gin.H{"error": "Book request not found"})
            return
        }

        // Check if the book exists and has available copies
        var book models.Book
        if err := db.First(&book, bookRequest.BookID).Error; err != nil {
            c.JSON(http.StatusNotFound, gin.H{"error": "Book not found"})
            return
        }

        if book.AvailableCopies < 1 {
            c.JSON(http.StatusBadRequest, gin.H{"error": "No available copies of this book"})
            return
        }

        // Update book request status
        approvedAt := time.Now()
        if err := db.Model(&bookRequest).
            Updates(models.BookRequest{
                Status:      "approved",
                ApprovedAt:  approvedAt,
                LibrarianID: librarianID,
            }).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update book request"})
            return
        }

        // Create a new book transaction
        bookTransaction := models.BookTransaction{
            BookID:      bookRequest.BookID,
            MemberID:    bookRequest.MemberID,
            LibrarianID: librarianID,
            BorrowedAt:  approvedAt,
        }

        if err := db.Create(&bookTransaction).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create book transaction"})
            return
        }

        // Reduce available copies atomically
        if err := db.Model(&book).
            Where("available_copies > 0").
            UpdateColumn("available_copies", gorm.Expr("available_copies - 1")).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update book availability"})
            return
        }

        c.JSON(http.StatusOK, gin.H{"message": "Book request approved successfully"})
    }
}
