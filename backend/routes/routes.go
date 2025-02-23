package routes

import (
	"github.com/gin-gonic/gin"
	db "github.com/mxansari007/librarymanagement/database"
	"github.com/mxansari007/librarymanagement/handlers"
)

// SetupRoutes defines all the routes for the application
func SetupRoutes(router *gin.Engine) {
	api := router.Group("/api")
	{
		api.POST("/users", handlers.CreateUser)
	}

	owner := router.Group("/owner")
	{
		owner.POST("/signup", handlers.SignupOwner(db.DB))
	}
}
