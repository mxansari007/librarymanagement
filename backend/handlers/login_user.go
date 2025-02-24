package handlers

import (
	"net/http"
	"github.com/gin-gonic/gin"
	db "github.com/mxansari007/librarymanagement/database"
	"github.com/mxansari007/librarymanagement/models"
	"golang.org/x/crypto/bcrypt"
	"github.com/mxansari007/librarymanagement/utils"
	"log"
)

func LoginUser(c *gin.Context) {
	var user models.User

	// Bind JSON to user model
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	//log
	log.Printf("Email: %s, Password: %s", user.Email, user.PasswordHash)

	var existingUser models.User

	// Check if the user exists in the database
	result := db.DB.Where("email = ?", user.Email).First(&existingUser)
	if result.Error != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// Compare hash with the provided password
	if err := bcrypt.CompareHashAndPassword([]byte(existingUser.PasswordHash), []byte(user.PasswordHash)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// Generate JWT token
	token, err := utils.CreateToken(existingUser.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create token"})
		return
	}


	// Set the token as a cookie
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("token", token, 3600, "/", "localhost", false, true)

	// Set token in Authorization header
	c.Header("Authorization", "Bearer "+token)

	// Send token and user data in response (excluding sensitive fields)
	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"user": gin.H{
			"id":    existingUser.ID,
			"email": existingUser.Email,
			"role":  existingUser.Role,
			"name":  existingUser.FirstName + " " + existingUser.LastName,
		},
	})
}
