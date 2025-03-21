package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/mxansari007/librarymanagement/models"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"strconv"
	"log"
    _ "github.com/mxansari007/librarymanagement/docs"
)




// OwnerSignupRequest represents the request body for signing up an owner.
type OwnerSignupRequest struct {
    FirstName string `json:"firstname" binding:"required"`
    LastName  string `json:"lastname" binding:"required"`
    Email     string `json:"email" binding:"required,email"`
    Password  string `json:"password" binding:"required,min=8"`
    PlanType  string `json:"plan_type" binding:"required,oneof=silver gold"`
}

// SignupOwner handles owner registration.
//
// @Summary Signup a new owner
// @Description Register a new owner with first name, last name, email, password, and plan type.
// @Tags Owner
// @Accept json
// @Produce json
// @Param request body OwnerSignupRequest true "Owner Signup Request"
// @Success 201 {object} map[string]interface{} "Owner created successfully"
// @Failure 400 {object} map[string]string "Invalid request body"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /owner/signup [post]
func SignupOwner(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        var req struct {
            FirstName string `json:"firstname" binding:"required"`
            LastName  string `json:"lastname" binding:"required"`
            Email     string `json:"email" binding:"required,email"`
            Password  string `json:"password" binding:"required,min=8"`
            PlanType  string `json:"plan_type" binding:"required,oneof=silver gold"`
        }

        if err := c.ShouldBindJSON(&req); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
            return
        }

        hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
            return
        }

        tx := db.Begin()
        defer func() {
            if r := recover(); r != nil {
                tx.Rollback()
            }
        }()

        owner := models.User{
            FirstName:    req.FirstName,
            LastName:     req.LastName,
            Email:        req.Email,
            PasswordHash: string(hashedPassword),
            Role:         "owner",
        }

        if err := tx.Create(&owner).Error; err != nil {
            tx.Rollback()
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create owner"})
            return
        }

        startDate := time.Now()
        endDate := startDate.AddDate(1, 0, 0)

        membership := models.OwnerMembership{
            UserID:    owner.ID,
            PlanType:  req.PlanType,
            StartDate: startDate,
            EndDate:   endDate,
        }

        if err := tx.Create(&membership).Error; err != nil {
            tx.Rollback()
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create owner membership"})
            return
        }

        if err := tx.Commit().Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
            return
        }

        c.JSON(http.StatusCreated, gin.H{
            "message":       "Owner created successfully",
            "owner_id":      owner.ID,
            "membership_id": membership.ID,
        })
    }
}



func CreateLibrary(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        var req struct {
            Name             string `json:"name" binding:"required"`
            Address          string `json:"address"`
            City             string `json:"city" binding:"required"`
            SubscriptionType string `json:"subscription_type" binding:"required,oneof=free paid"`
            Rate             uint   `json:"rate,omitempty"`
        }

        if err := c.ShouldBindJSON(&req); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
            return
        }

        userID, exists := c.Get("user_id")
        if !exists {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
            return
        }

        ownerID, ok := userID.(uint)
        if !ok {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID format"})
            return
        }

        // Check if owner exists in owner_memberships table
        var ownerMembership models.OwnerMembership
        if err := db.Where("user_id = ?", ownerID).First(&ownerMembership).Error; err != nil {
            c.JSON(http.StatusForbidden, gin.H{"error": "Owner does not exist or is not authorized to create a library"})
            return
        }

        library := models.Library{
            OwnerID:          ownerMembership.ID,
            Name:             req.Name,
            Address:          req.Address,
            City:             req.City,
            SubscriptionType: req.SubscriptionType,
        }

        if req.SubscriptionType == "paid" {
            library.Rate = req.Rate
        }

        if err := db.Create(&library).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create library"})
            return
        }

        c.JSON(http.StatusCreated, gin.H{
            "message": "Library created successfully",
            "library": library,
        })
    }
}

//according to owner id which is user id

func GetLibraries(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        userID, exists := c.Get("owner_id")
        if !exists {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
            return
        }

        ownerID, ok := userID.(uint)
        if !ok {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID format"})
            return
        }

        var libraries []models.Library
        if err := db.Where("owner_id = ?", ownerID).Find(&libraries).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve libraries"})
            return
        }

        c.JSON(http.StatusOK, gin.H{
            "libraries": libraries,
        })
    }
}
func DeleteLibrary(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        libraryID := c.Param("library_id")

        userID, exists := c.Get("owner_id")
        if !exists {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
            return
        }

        ownerID, ok := userID.(uint)
        if !ok {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID format"})
            return
        }

        if err := db.Where("id = ? AND owner_id = ?", libraryID, ownerID).Delete(&models.Library{}).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete library"})
            return
        }

        c.JSON(http.StatusOK, gin.H{
            "message": "Library deleted successfully",
        })
    }
}
//update only parameters which are given from frontend

func UpdateLibrary(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        libraryID := c.Param("library_id")

        var req struct {
            Name             *string `json:"name"`
            Address          *string `json:"address"`
            City             *string `json:"city"`
            SubscriptionType *string `json:"subscription_type"`
            Rate             *uint   `json:"rate"`
        }

        if err := c.ShouldBindJSON(&req); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
            return
        }

        updateData := make(map[string]interface{})

        if req.Name != nil {
            updateData["name"] = *req.Name
        }
        if req.Address != nil {
            updateData["address"] = *req.Address
        }
        if req.City != nil {
            updateData["city"] = *req.City
        }
        if req.SubscriptionType != nil {
            updateData["subscription_type"] = *req.SubscriptionType
        }
        if req.Rate != nil {
            updateData["rate"] = *req.Rate
        }

        if len(updateData) == 0 {
            c.JSON(http.StatusBadRequest, gin.H{"error": "No fields to update"})
            return
        }

        if err := db.Model(&models.Library{}).Where("id = ?", libraryID).Updates(updateData).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{
                "error":   "Failed to update library",
                "details": err.Error(),
            })
            return
        }

        c.JSON(http.StatusOK, gin.H{
            "message": "Library updated successfully",
        })
    }
}

func CreateLibrarian(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        var req struct {
            FirstName     string `json:"first_name" binding:"required"`
            LastName      string `json:"last_name" binding:"required"`
            Email         string `json:"email" binding:"required,email"`
            Password      string `json:"password" binding:"required,min=8"`
            ContactNumber string `json:"contact_number"`
            LibraryID     uint   `json:"library_id" binding:"required"`
        }

        if err := c.ShouldBindJSON(&req); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
            return
        }

        // Retrieve the authenticated owner's ID from the context
        ownerID, exists := c.Get("owner_id")
        if !exists {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
            return
        }

        // Check if the Library exists and belongs to the authenticated owner
        var library models.Library
        if err := db.Where("id = ? AND owner_id = ?", req.LibraryID, ownerID).First(&library).Error; err != nil {
            c.JSON(http.StatusForbidden, gin.H{"error": "Library does not belong to this owner or does not exist"})
            return
        }

        hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
            return
        }

        tx := db.Begin()
        defer func() {
            if r := recover(); r != nil {
                tx.Rollback()
            }
        }()

        user := models.User{
            FirstName:     req.FirstName,
            LastName:      req.LastName,
            Email:         req.Email,
            PasswordHash:  string(hashedPassword),
            Role:          "librarian",
            ContactNumber: &req.ContactNumber,
        }

        if err := tx.Create(&user).Error; err != nil {
            tx.Rollback()
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
            return
        }

        librarian := models.Librarian{
            UserID:    user.ID,
            LibraryID: req.LibraryID,
            AssignedAt: time.Now(),
        }

        if err := tx.Create(&librarian).Error; err != nil {
            tx.Rollback()
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create librarian"})
            return
        }

        if err := tx.Commit().Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
            return
        }

        c.JSON(http.StatusCreated, gin.H{
            "message":      "Librarian created successfully",
            "user_id":      user.ID,
            "librarian_id": librarian.ID,
        })
    }
}



func GetOwnerLibrarians(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        ownerID, exists := c.Get("owner_id") // Assuming owner_id is set via middleware
        if !exists {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
            return
        }

        type LibrarianWithUser struct {
            models.Librarian
            FirstName     string    `json:"first_name"`
            LastName      string    `json:"last_name"`
            Email         string    `json:"email"`
            Role          string    `json:"role"`
            ContactNumber *string   `json:"contact_number"`
            IsVerified    bool      `json:"is_verified"`
            CreatedAt     time.Time `json:"created_at"`
        }

        var librariansWithUsers []LibrarianWithUser

        // Fetch librarians belonging to libraries owned by the given owner
        if err := db.Table("librarians").
            Select("librarians.*, users.first_name, users.last_name, users.email, users.role, users.contact_number, users.is_verified, users.created_at").
            Joins("JOIN users ON librarians.user_id = users.id").
            Joins("JOIN libraries ON librarians.library_id = libraries.id").
            Where("libraries.owner_id = ?", ownerID). // Get only the owner’s librarians
            Scan(&librariansWithUsers).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve librarians"})
            return
        }

        // Construct response
        var response []gin.H
        for _, lib := range librariansWithUsers {
            librarianData := gin.H{
                "id":          lib.ID,
                "user_id":     lib.UserID,
                "library_id":  lib.LibraryID,
                "assigned_at": lib.AssignedAt,
                "user": gin.H{
                    "id":             lib.UserID,
                    "first_name":     lib.FirstName,
                    "last_name":      lib.LastName,
                    "email":          lib.Email,
                    "role":           lib.Role,
                    "contact_number": lib.ContactNumber,
                    "is_verified":    lib.IsVerified,
                    "created_at":     lib.CreatedAt,
                },
            }
            response = append(response, librarianData)
        }

        c.JSON(http.StatusOK, gin.H{
            "librarians": response,
        })
    }
}


// fetch all users with role as members based on library ID and isVerified status



// FetchMembers retrieves members based on library ID and optional verification status
func FetchMembers(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        libraryID, err := strconv.Atoi(c.Param("library_id"))
        if err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid library ID"})
            return
        }

        isVerifiedStr := c.Query("is_verified")
        var members []models.User
        query := db.Table("users").
            Select("users.*").
            Joins("JOIN library_memberships ON library_memberships.member_id = users.id").
            Where("library_memberships.library_id = ?", libraryID)

        if isVerifiedStr != "" {
            isVerified, err := strconv.ParseBool(isVerifiedStr)
            if err != nil {
                c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid verification status"})
                return
            }
            query = query.Where("users.is_verified = ?", isVerified)
        }

        if err := query.Find(&members).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching members"})
            return
        }

        log.Printf("Members retrieved: Library ID: %d, Count: %d, IsVerified: %s", libraryID, len(members), isVerifiedStr)
        c.JSON(http.StatusOK, gin.H{"data": members})
    }
}


func FetchDashboardValues(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        libraryID, err := strconv.Atoi(c.Param("library_id"))
        if err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid library ID"})
            return
        }

        var totalBooks int64
        var availableBooks int64
        var borrowedBooks int64

        if err := db.Model(&models.Book{}).Where("library_id = ?", libraryID).Count(&totalBooks).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve total books"})
            return
        }

        if err := db.Model(&models.Book{}).Where("library_id = ? AND available_copies > 0", libraryID).Count(&availableBooks).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve available books"})
            return
        }

        if err := db.Model(&models.Book{}).Where("library_id = ? AND available_copies < total_copies", libraryID).Count(&borrowedBooks).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve borrowed books"})
            return
        }

        c.JSON(http.StatusOK, gin.H{
            "total_books":     totalBooks,
            "available_books": availableBooks,
            "borrowed_books":  borrowedBooks,
        })
    }
}

