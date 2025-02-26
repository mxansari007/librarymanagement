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
			PasswordHash      string `form:"password" binding:"required,min=8"`
			AadhaarNumber string `form:"aadhaar_number" binding:"required"`
			LibraryID     uint   `form:"library_id" binding:"required"`
		}

		// Bind form data
		if err := c.ShouldBind(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid form data: " + err.Error()})
			return
		}

		// Retrieve the Aadhaar image file
		file, header, err := c.Request.FormFile("aadhaar_image")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read Aadhaar image: " + err.Error()})
			return
		}
		defer file.Close()

		// Validate file type
		if header.Header.Get("Content-Type") != "image/png" && header.Header.Get("Content-Type") != "image/jpeg" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid file type. Only PNG and JPEG are allowed"})
			return
		}

		// Read file content and encode to base64
		fileBytes, err := ioutil.ReadAll(file)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process Aadhaar image: " + err.Error()})
			return
		}
		encodedImage := base64.StdEncoding.EncodeToString(fileBytes)

		// Hash the password
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.PasswordHash), bcrypt.DefaultCost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password: " + err.Error()})
			return
		}

		// Start a database transaction
		tx := db.Begin()
		defer func() {
			if r := recover(); r != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Unexpected error occurred"})
			}
		}()

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

		// Save the member
		if err := tx.Create(&member).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create member: " + err.Error()})
			return
		}

		// Check if the library exists
		var library models.Library
		if err := db.First(&library, req.LibraryID).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusNotFound, gin.H{"error": "Library not found"})
			return
		}

		// Create a membership for the user
		membership := models.LibraryMembership{
			MemberID:         member.ID,
			LibraryID:        req.LibraryID,
			IsPaidMembership: false, // Defaulting to free membership; modify as needed
			StartDate:        time.Now(),
			EndDate:          time.Now().AddDate(1, 0, 0), // 1-year validity
			CreatedAt:        time.Now(),
		}

		// Save the membership
		if err := tx.Create(&membership).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create membership: " + err.Error()})
			return
		}

		// Commit the transaction
		tx.Commit()

		c.JSON(http.StatusCreated, gin.H{
			"message":      "Member signed up and subscribed to library successfully",
			"member_id":    member.ID,
			"membership_id": membership.ID,
		})
	}
}
