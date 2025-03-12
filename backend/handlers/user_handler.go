package handlers

import (
	"net/http"

	"log"
	"github.com/gin-gonic/gin"
	"github.com/mxansari007/librarymanagement/models"
	"gorm.io/gorm"
    "strconv"
    "time"

)




// create api to search library by name or by city and return the list of libraries with their details
func SearchLibraries(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        var req struct {
            Name  string `json:"name"`
            City  string `json:"city"`
        }

        if err := c.ShouldBindJSON(&req); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
            return
        }

        var libraries []models.Library
        
        // Create a query scope with case-insensitive search
        query := db.Model(&models.Library{})
        
        if req.Name != "" && req.City != "" {
            query.Where("LOWER(name) LIKE LOWER(?) AND LOWER(city) LIKE LOWER(?)", 
                "%"+req.Name+"%", 
                "%"+req.City+"%").Find(&libraries)
        } else if req.Name != "" {
            query.Where("LOWER(name) LIKE LOWER(?)", 
                "%"+req.Name+"%").Find(&libraries)
        } else if req.City != "" {
            query.Where("LOWER(city) LIKE LOWER(?)", 
                "%"+req.City+"%").Find(&libraries)
        }

        // Log search and return response
        log.Printf("Libraries searched: Name: %s, City: %s, Count: %d", 
            req.Name, 
            req.City, 
            len(libraries))
        c.JSON(http.StatusOK, gin.H{"data": libraries})
    }
}



// check isVerified function to check if user is verified or not using email ID



func IsVerified(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        var rejectedUser models.RejectedUser
        if err := db.Where("email = ?", c.Param("email")).First(&rejectedUser).Error; err == nil {
            c.JSON(http.StatusForbidden, gin.H{"error": "User rejected", "reason": rejectedUser.Reason})
            return
        }

        var user models.User
        if err := db.Where("email = ?", c.Param("email")).First(&user).Error; err != nil {
            c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
            return
        }

        if !user.IsVerified {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Account is not verified"})
            return
        }

        c.JSON(http.StatusOK, gin.H{"verified": true})
    }
}


func GetLibraryDashboard(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        // Get library ID from request params
        libraryID, err := strconv.Atoi(c.Param("library_id"))
        if err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid library ID"})
            return
        }

        var totalBooks, totalMembers, totalIssuedBooks, totalOverdueBooks, totalLibrarians int64
        var totalAvailableCopies int64

        // Get total books in library by summing TotalCopies (Handle NULL with COALESCE)
        if err := db.Model(&models.Book{}).
            Where("library_id = ?", libraryID).
            Select("COALESCE(SUM(total_copies), 0)").
            Scan(&totalBooks).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch total books", "details": err.Error()})
            return
        }

        // Get total members in library
        if err := db.Model(&models.LibraryMembership{}).
            Where("library_id = ?", libraryID).
            Count(&totalMembers).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch total members", "details": err.Error()})
            return
        }

        // Get total issued books by joining BookTransaction with Book table
        if err := db.Model(&models.BookTransaction{}).
            Joins("JOIN books ON books.id = book_transactions.book_id").
            Where("books.library_id = ? AND book_transactions.returned_at IS NULL", libraryID).
            Count(&totalIssuedBooks).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch total issued books", "details": err.Error()})
            return
        }

        // Get total overdue books (due_date < today and not returned)
        if err := db.Model(&models.BookTransaction{}).
            Joins("JOIN books ON books.id = book_transactions.book_id").
            Where("books.library_id = ? AND book_transactions.returned_at IS NULL AND book_transactions.due_date < ?", libraryID, time.Now()).
            Count(&totalOverdueBooks).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch total overdue books", "details": err.Error()})
            return
        }

        // Get total librarians
        if err := db.Model(&models.Librarian{}).
            Where("library_id = ?", libraryID).
            Count(&totalLibrarians).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch total librarians", "details": err.Error()})
            return
        }

        // Get total available copies of all books in the library (Handle NULL with COALESCE)
        if err := db.Model(&models.Book{}).
            Where("library_id = ?", libraryID).
            Select("COALESCE(SUM(available_copies), 0)").
            Scan(&totalAvailableCopies).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch total available copies", "details": err.Error()})
            return
        }

        // Return response
        c.JSON(http.StatusOK, gin.H{
            "total_books":           totalBooks,
            "total_members":         totalMembers,
            "total_issued_books":    totalIssuedBooks,
            "total_overdue_books":   totalOverdueBooks,
            "total_librarians":      totalLibrarians,
            "total_available_books": totalAvailableCopies,
        })
    }
}
