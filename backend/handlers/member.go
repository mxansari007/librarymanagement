package handlers

import (
	"encoding/base64"
	"io/ioutil"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/mxansari007/librarymanagement/models"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func SignupMember(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			FirstName     string `form:"firstname" binding:"required"`
			LastName      string `form:"lastname" binding:"required"`
			Email         string `form:"email" binding:"required,email"`
			Password      string `form:"password" binding:"required,min=8"`
			AadhaarNumber string `form:"aadhaar_number" binding:"required"`
		}

		// Bind form data (excluding the file)
		if err := c.ShouldBind(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid form data: " + err.Error()})
			return
		}

		// Retrieve the Aadhaar image file
		file, header, err := c.Request.FormFile("aadhaar_image")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Failed to read Aadhaar image: " + err.Error(),
				"debug": "Ensure the file is sent with key 'aadhaar_image'",
			})
			return
		}
		defer file.Close()

		// Validate file type (optional, but recommended)
		if header.Header.Get("Content-Type") != "image/png" && header.Header.Get("Content-Type") != "image/jpeg" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid file type. Only PNG and JPEG are allowed"})
			return
		}

		// Read file content
		fileBytes, err := ioutil.ReadAll(file)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process Aadhaar image: " + err.Error()})
			return
		}

		// Encode file to base64
		encodedImage := base64.StdEncoding.EncodeToString(fileBytes)

		// Hash the password
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password: " + err.Error()})
			return
		}

		// Create the member
		member := models.User{
			FirstName:      req.FirstName,
			LastName:       req.LastName,
			Email:          req.Email,
			PasswordHash:   string(hashedPassword),
			Role:           "member",
			AadhaarNumber:  &req.AadhaarNumber,
			AadhaarImageURL: &encodedImage,
			IsVerified:     false,
			CreatedAt:      time.Now(),
		}

		// Start a database transaction
		tx := db.Begin()
		defer func() {
			if r := recover(); r != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Unexpected error occurred"})
			}
		}()

		// Save the member
		if err := tx.Create(&member).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create member: " + err.Error()})
			return
		}

		// Commit the transaction
		tx.Commit()

		c.JSON(http.StatusCreated, gin.H{
			"message":   "Member created successfully",
			"member_id": member.ID,
		})
	}
}