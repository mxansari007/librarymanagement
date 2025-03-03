package middlewares

import (
	"net/http"
	"strings"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"
)

// AuthMiddleware verifies JWT token and extracts user details
func AuthMiddleware(requiredRole string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header missing"})
			c.Abort()
			return
		}

		// Extract token
		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid Authorization format"})
			c.Abort()
			return
		}

		tokenStr := tokenParts[1]

		// Get secret key from environment
		secretKey := os.Getenv("SECRET_KEY")
		if secretKey == "" {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Server configuration error: SECRET_KEY not set"})
			c.Abort()
			return
		}

		// Parse token
		claims := jwt.MapClaims{}
		token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
			return []byte(secretKey), nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		// Extract user details safely
		userIDFloat, ok := claims["user_id"].(float64)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token structure"})
			c.Abort()
			return
		}
		userID := uint(userIDFloat)

		role, ok := claims["role"].(string)
		if !ok || role != requiredRole {
			c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
			c.Abort()
			return
		}

		// Set user details in context
		c.Set("user_id", userID)
		c.Set("role", role)

		// Store library_id for librarians and members
		if (role == "librarian" || role == "member") {
			libraryIDFloat, ok := claims["library_id"].(float64)
			if !ok {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Library ID missing"})
				c.Abort()
				return
			}
			c.Set("library_id", uint(libraryIDFloat))
		}

		if role == "librarian" {
			librarianIDFloat, ok := claims["librarian_id"].(float64)
            if!ok {
                c.JSON(http.StatusUnauthorized, gin.H{"error": "Librarian ID missing"})
                c.Abort()
                return
            }
            c.Set("librarian_id", uint(librarianIDFloat))
		}
		

		// Store membership_id for members
		if role == "member" {
			membershipIDFloat, ok := claims["membership_id"].(float64)
			if !ok {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Membership ID missing for member"})
				c.Abort()
				return
			}
			c.Set("membership_id", uint(membershipIDFloat))
		}

		c.Next()
	}
}

