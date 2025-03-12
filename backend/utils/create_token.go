package utils

import (
	"errors"
	"os"
	"time"

	"github.com/golang-jwt/jwt"
    "gorm.io/gorm"
)

// CreateToken generates a JWT token with userID, role, and optional libraryID or membershipID
func CreateToken(db *gorm.DB, userID uint, role string, libraryID *uint) (string, error) {
	secretKey := os.Getenv("SECRET_KEY")
	if secretKey == "" {
		return "", errors.New("server configuration error: SECRET_KEY not set")
	}

	claims := jwt.MapClaims{
		"user_id": userID,
		"role":    role,
		"exp":     time.Now().Add(time.Hour * 2).Unix(), // Token expires in 2 hours
	}

	// Fetch membership_id for members
	if role == "member" {
		var membership struct {
			ID uint
		}
		if err := db.Table("library_memberships").Select("id").Where("member_id = ?", userID).First(&membership).Error; err != nil {
			return "", errors.New("membership not found for the user")
		}
		claims["membership_id"] = membership.ID
	}

	// Fetch librarian_id for librarians
	if role == "librarian" {
		var librarian struct {
			ID uint
		}
		if err := db.Table("librarians").Select("id").Where("user_id = ?", userID).First(&librarian).Error; err != nil {
			return "", errors.New("librarian not found for the user")
		}
		claims["librarian_id"] = librarian.ID
	}

	// Fetch owner_id for owners
	if role == "owner" {
		var owner struct {
			ID uint
		}
		if err := db.Table("owner_memberships").Select("id").Where("user_id = ?", userID).First(&owner).Error; err != nil {
			return "", errors.New("owner not found for the user")
		}
		claims["owner_id"] = owner.ID
	}

	// Add library_id for librarians or members (if applicable)
	if (role == "librarian" || role == "member") && libraryID != nil {
		claims["library_id"] = *libraryID
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secretKey))
}

// VerifyToken validates a JWT and extracts user ID and role
func VerifyToken(tokenString string) (uint, string, error) {
    secretKey := os.Getenv("SECRET_KEY")
    if secretKey == "" {
        return 0, "", errors.New("server configuration error: SECRET_KEY not set")
    }
    
    // Parse without validating first to check the error type
    token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
        return []byte(secretKey), nil
    })
    
    // Check for token expiration specifically
    if err != nil {
        if ve, ok := err.(*jwt.ValidationError); ok {
            if ve.Errors&jwt.ValidationErrorExpired != 0 {
                return 0, "", errors.New("token has expired")
            }
        }
        return 0, "", errors.New("invalid token")
    }
    
    // Check if token is valid
    if !token.Valid {
        return 0, "", errors.New("invalid token")
    }
    
    claims, ok := token.Claims.(jwt.MapClaims)
    if !ok {
        return 0, "", errors.New("invalid token structure")
    }
    
    // Safely extract userID
    userIDFloat, ok := claims["user_id"].(float64)
    if !ok {
        return 0, "", errors.New("invalid user_id in token")
    }
    userID := uint(userIDFloat)
    
    // Extract role
    role, ok := claims["role"].(string)
    if !ok {
        return 0, "", errors.New("invalid role in token")
    }
    
    return userID, role, nil
}