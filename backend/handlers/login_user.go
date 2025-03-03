package handlers

import (
    "log"
    "net/http"
    "time"

    "github.com/gin-gonic/gin"
    db "github.com/mxansari007/librarymanagement/database"
    "github.com/mxansari007/librarymanagement/models"
    "github.com/mxansari007/librarymanagement/utils"
    "golang.org/x/crypto/bcrypt"
)

func LoginUser(c *gin.Context) {
    // Define struct for login request
    var loginRequest struct {
        Email    string `json:"email" binding:"required,email"`
        Password string `json:"password" binding:"required"`
    }

    // Bind JSON to login request
    if err := c.ShouldBindJSON(&loginRequest); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    log.Printf("Login attempt: Email: %s", loginRequest.Email)

    // Check if the user is in the rejected users list
    var rejectedUser models.RejectedUser
    if err := db.DB.Where("email = ?", loginRequest.Email).First(&rejectedUser).Error; err == nil {
        c.JSON(http.StatusUnauthorized, gin.H{
            "error":    "Account is rejected",
            "reason":   rejectedUser.Reason,
            "rejected": true,
        })
        return
    }

    // Check if the user exists
    var existingUser models.User
    if err := db.DB.Where("email = ?", loginRequest.Email).First(&existingUser).Error; err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
        return
    }

    // Check if member account is verified
    if existingUser.Role == "member" && !existingUser.IsVerified {
        c.JSON(http.StatusUnauthorized, gin.H{
            "error":    "Account is not verified",
            "verified": false,
        })
        return
    }

    // Compare hashed password with provided password
    if err := bcrypt.CompareHashAndPassword([]byte(existingUser.PasswordHash), []byte(loginRequest.Password)); err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
        return
    }

    // Determine library ID for librarians or members
    var libraryID *uint
    if existingUser.Role == "librarian" {
        var librarian models.Librarian
        if err := db.DB.Where("user_id = ?", existingUser.ID).First(&librarian).Error; err != nil {
            log.Printf("Failed to retrieve librarian data for user ID %d: %v", existingUser.ID, err)
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve librarian data"})
            return
        }
        libraryID = &librarian.LibraryID
    } else if existingUser.Role == "member" {
        var libraryMembership models.LibraryMembership
        if err := db.DB.Where("member_id = ?", existingUser.ID).First(&libraryMembership).Error; err != nil {
            log.Printf("Failed to retrieve membership data for user ID %d: %v", existingUser.ID, err)
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve member data"})
            return
        }
        libraryID = &libraryMembership.LibraryID
    }

    // Generate JWT token
	token, err := utils.CreateToken(db.DB, existingUser.ID, existingUser.Role, libraryID)
    if err != nil {
        log.Printf("Failed to create token for user ID %d: %v", existingUser.ID, err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create token"})
        return
    }

    // Set cookie name based on role
    cookieName := "member_token"
    if existingUser.Role == "owner" {
        cookieName = "owner_token"
    } else if existingUser.Role == "librarian" {
        cookieName = "librarian_token"
    }

    // Set secure HttpOnly cookie
    c.SetSameSite(http.SameSiteLaxMode)
    c.SetCookie(cookieName, token, 3600, "/", "localhost", false, true)
    c.Header("Authorization", "Bearer "+token)

    // Prepare user response
    userResponse := gin.H{
        "id":        existingUser.ID,
        "email":     existingUser.Email,
        "role":      existingUser.Role,
        "firstName": existingUser.FirstName,
        "lastName":  existingUser.LastName,
    }

    // Add library details for librarians and members
    if existingUser.Role == "librarian" || existingUser.Role == "member" {
        var library models.Library
        if err := db.DB.Where("id = ?", *libraryID).First(&library).Error; err != nil {
            log.Printf("Failed to retrieve library data for library ID %d: %v", *libraryID, err)
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve library data"})
            return
        }
        userResponse["library_id"] = *libraryID
        userResponse["library_name"] = library.Name
        userResponse["address"] = library.Address
        userResponse["created_at"] = library.CreatedAt.Format(time.RFC3339)
    }

    // Send response
    c.JSON(http.StatusOK, gin.H{
        "token": token,
        "user":  userResponse,
    })
}


func LogoutUser(c *gin.Context) {
    // Get role from URL parameter
    role := c.Param("role")

    // Clear the appropriate cookie based on role
    switch role {
    case "member":
        c.SetCookie("member_token", "", -1, "/", "localhost", false, true)
    case "librarian":
        c.SetCookie("librarian_token", "", -1, "/", "localhost", false, true)
    case "owner":
        c.SetCookie("owner_token", "", -1, "/", "localhost", false, true)
    default:
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid role"})
        return
    }

    // Respond with success message
    c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}


