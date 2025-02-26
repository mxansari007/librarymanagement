package handlers

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	db "github.com/mxansari007/librarymanagement/database"
	"github.com/mxansari007/librarymanagement/models"
	"github.com/mxansari007/librarymanagement/utils"
	"golang.org/x/crypto/bcrypt"
)

func LoginUser(c *gin.Context) {
	// Define struct for login request
	var loginRequest struct {
		Email        string `json:"email" binding:"required,email"`
		PasswordHash string `json:"password_hash" binding:"required"`
	}

	// Bind JSON to login request
	if err := c.ShouldBindJSON(&loginRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	log.Printf("Login attempt: Email: %s", loginRequest.Email)

	// Check if the user is in the rejected users list
	var rejectedUser models.RejectedUser
	rejectedResult := db.DB.Where("email = ?", loginRequest.Email).First(&rejectedUser)
	if rejectedResult.Error == nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":    "Account is rejected",
			"reason":   rejectedUser.Reason,
			"rejected": true,
		})
		return
	}

	var existingUser models.User
	// Check if the user exists
	result := db.DB.Where("email = ?", loginRequest.Email).First(&existingUser)
	if result.Error != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	if existingUser.Role == "member" && !existingUser.IsVerified {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":    "Account is not verified",
			"verified": false,
		})
		return
	}

	// Compare hashed password
	if err := bcrypt.CompareHashAndPassword([]byte(existingUser.PasswordHash), []byte(loginRequest.PasswordHash)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// Determine librarian's library_id if applicable
	var libraryID *uint
	if existingUser.Role == "librarian" {
		var librarian models.Librarian
		if err := db.DB.Where("user_id = ?", existingUser.ID).First(&librarian).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve librarian data"})
			return
		}
		libraryID = &librarian.LibraryID
	}

	// Generate JWT token with library ID if librarian
	token, err := utils.CreateToken(existingUser.ID, existingUser.Role, libraryID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create token"})
		return
	}

	// Set the correct cookie name based on role
	cookieName := "member_token"
	if existingUser.Role == "owner" {
		cookieName = "owner_token"
	} else if existingUser.Role == "librarian" {
		cookieName = "librarian_token"
	}

	// Set HttpOnly cookie
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(cookieName, token, 3600, "/", "localhost", false, true)

	// Also set Authorization header
	c.Header("Authorization", "Bearer "+token)

	// User response data
	userResponse := gin.H{
		"id":        existingUser.ID,
		"email":     existingUser.Email,
		"role":      existingUser.Role,
		"firstName": existingUser.FirstName,
		"lastName":  existingUser.LastName,
	}

	// Add librarian-specific data if applicable
	if existingUser.Role == "librarian" {
		var library models.Library
		if err := db.DB.Where("id = ?", *libraryID).First(&library).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve library data"})
			return
		}

		// Include library details in response
		userResponse["library_id"] = *libraryID
		userResponse["library_name"] = library.Name
		userResponse["address"] = library.Address
		userResponse["created_at"] = library.CreatedAt
	}

	// Send response with user data
	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"user":  userResponse,
	})
}
