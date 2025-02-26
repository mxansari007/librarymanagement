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
