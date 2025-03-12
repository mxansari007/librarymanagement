package main

import (
	"bytes"
	"log"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"

	configs "github.com/mxansari007/librarymanagement/config"
	db "github.com/mxansari007/librarymanagement/database"
	"github.com/mxansari007/librarymanagement/routes"
)

var router *gin.Engine

func TestMain(m *testing.M) {
	// Load test configuration
	config := configs.LoadConfig()

	// Connect to test database
	db.ConnectTestDB(&config.DB)

	// Set up Gin in test mode
	gin.SetMode(gin.TestMode)

	// Initialize router with test routes
	router = gin.Default()
	routes.SetupRoutes(router)

	log.Println("Test database connected successfully")

	// Run tests
	m.Run()
}

// performRequest sends a test HTTP request to the router
func performRequest(r http.Handler, method, path string, body []byte) *httptest.ResponseRecorder {
	req, _ := http.NewRequest(method, path, bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	return w
}

func TestServerSetup(t *testing.T) {
	w := performRequest(router, "GET", "/", nil) // Replace "/" with a valid route

	assert.Equal(t, 200, w.Code) // Adjust expected status based on route behavior
}
