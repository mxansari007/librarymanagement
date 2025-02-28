package utils

import (
	"errors"
	"os"
	"time"

	"github.com/golang-jwt/jwt"
)

// CreateToken generates a JWT token with userID, role, and optional libraryID
func CreateToken(userID uint, role string, libraryID *uint) (string, error) {
	secretKey := os.Getenv("SECRET_KEY")
	if secretKey == "" {
		return "", errors.New("server configuration error: SECRET_KEY not set")
	}

	claims := jwt.MapClaims{
		"user_id": userID,
		"role":    role,
		"exp":     time.Now().Add(time.Hour * 2).Unix(), // Token expires in 1 hour
	}

	// Add libraryID if user is a librarian
	if role == "librarian" && libraryID != nil  || role == "member" && libraryID!= nil {
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