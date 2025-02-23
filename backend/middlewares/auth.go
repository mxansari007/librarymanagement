package middlewares

import (
	"github.com/gin-gonic/gin"
)

// AuthMiddleware is a sample authentication middleware
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Add your authentication logic here
		c.Next()
	}
}
