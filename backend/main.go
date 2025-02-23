package main

import (
	"log"

	"github.com/gin-gonic/gin"
	configs "github.com/mxansari007/librarymanagement/config"
	db "github.com/mxansari007/librarymanagement/database"
	"github.com/mxansari007/librarymanagement/middlewares"
	"github.com/mxansari007/librarymanagement/routes"
)

func main() {
	// Load configuration
	config := configs.LoadConfig()

	// Initialize database
	db.Connect(&config.DB)

	// Auto-migrate models

	// Create a new Gin router
	router := gin.Default()

	// Add middlewares
	router.Use(middlewares.AuthMiddleware())

	// Set up routes
	routes.SetupRoutes(router)

	// Start the server
	err := router.Run(":" + config.Port)
	if err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
