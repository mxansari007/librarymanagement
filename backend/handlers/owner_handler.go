package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/mxansari007/librarymanagement/models"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

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

		// Hash the password
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
			return
		}

		// Create the owner
		owner := models.User{
			FirstName:    req.FirstName,
			LastName:     req.LastName,
			Email:        req.Email,
			PasswordHash: string(hashedPassword),
			Role:         "owner",
		}

		// Start a database transaction
		tx := db.Begin()
		defer func() {
			if r := recover(); r != nil {
				tx.Rollback()
			}
		}()

		// Save the owner
		if err := tx.Create(&owner).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create owner"})
			return
		}

		// Create the owner membership
		startDate := time.Now()
		endDate := startDate.AddDate(1, 0, 0) // 1 year membership

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

		// Commit the transaction
		tx.Commit()

		c.JSON(http.StatusCreated, gin.H{
			"message":       "Owner created successfully",
			"owner_id":      owner.ID,
			"membership_id": membership.ID,
		})
	}
}


// type Library struct {
// 	ID               uint      `gorm:"primaryKey" json:"id"`
// 	OwnerID          uint      `gorm:"not null" json:"owner_id"`
// 	Name             string    `gorm:"not null" json:"name"`
// 	Address          string    `json:"address"`
// 	SubscriptionType string    `gorm:"not null" json:"subscription_type"`
// 	CreatedAt        time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
// }


func CreateLibrary(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        var req struct {
            Name             string `json:"name" binding:"required"`
            Address          string `json:"address"`
            SubscriptionType string `json:"subscription_type" binding:"required,oneof=free paid"`
			 Rate             uint   `json:"rate,omitempty"`
        }

		// Bind the request body to the struct
		

        if err := c.ShouldBindJSON(&req); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
            return
        }

        // Get user ID from context (set by AuthMiddleware)
        userID, exists := c.Get("user_id")
        if !exists {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
            return
        }

        // Convert userID to uint
        ownerID, ok := userID.(uint)
        if !ok {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID format"})
            return
        }

        // Create the library
        library := models.Library{
            OwnerID:          ownerID,
            Name:             req.Name,
            Address:          req.Address,
            SubscriptionType: req.SubscriptionType,
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
		// Get user ID from context (set by AuthMiddleware)
		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		// Convert userID to uint
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
		if err := db.Where("id = ?", libraryID).Delete(&models.Library{}).Error; err != nil {
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

		// Define struct for binding JSON
		var req struct {
			Name             *string  `json:"name"`
			Address          *string  `json:"address"`
			SubscriptionType *string  `json:"subscription_type"`
			Rate             *uint 	`json:"rate" binding:"required" `
		}

		

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Create a map to store only provided fields
		updateData := make(map[string]interface{})

		if req.Name != nil {
			updateData["name"] = *req.Name
		}
		if req.Address != nil {
			updateData["address"] = *req.Address
		}
		if req.SubscriptionType != nil {
			updateData["subscription_type"] = *req.SubscriptionType
		}
		if req.Rate != nil {
			updateData["rate"] = *req.Rate
		}

		// Only update if there are fields to update
		if len(updateData) == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "No fields to update"})
			return
		}

		// Update library with only provided fields
		if err := db.Model(&models.Library{}).Where("id = ?", libraryID).Updates(updateData).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Failed to update library",
				"details": err.Error(),  // Logs detailed error
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Library updated successfully",
		})
	}
}
