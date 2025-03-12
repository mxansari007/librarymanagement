package main

import (
	"log"

	"github.com/gin-gonic/gin"
	configs "github.com/mxansari007/librarymanagement/config"
	db "github.com/mxansari007/librarymanagement/database"
	"github.com/mxansari007/librarymanagement/routes"
	"github.com/gin-contrib/cors"
	"time"
	httpSwagger "github.com/swaggo/http-swagger"
)

func main() {
	// Load configuration
	config := configs.LoadConfig()

	// Initialize database
	db.Connect(&config.DB)

	// Auto-migrate models

	// Create a new Gin router
	router := gin.Default()



	router.GET("/swagger/*any", gin.WrapH(httpSwagger.WrapHandler))


	router.Use(cors.New(cors.Config{
        AllowOrigins:     []string{"http://localhost:5173"}, // Add allowed domains
        AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS","PATCH"},
        AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
        ExposeHeaders:    []string{"Content-Length","Set-Cookie"},
        AllowCredentials: true,
        MaxAge:           12 * time.Hour,
    }))




	// Set up routes
	routes.SetupRoutes(router)

	// Start the server
	err := router.Run(":" + config.Port)
	if err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
