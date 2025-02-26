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



