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
