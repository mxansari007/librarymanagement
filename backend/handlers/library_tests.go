package handlers

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

// Test CreateLibrary API
func TestCreateLibrary(t *testing.T) {
	// Create a mock DB
	db, mock, err := sqlmock.New()
	assert.NoError(t, err)
	defer db.Close()

	// Mock insert query
	mock.ExpectExec("INSERT INTO libraries").
		WithArgs(sqlmock.AnyArg(), "Library Name", "Address", "City", "free", 0).
		WillReturnResult(sqlmock.NewResult(1, 1))

	// Setup Gin router
	router := gin.Default()

	// Create JSON request
	reqBody := `{"name": "Library Name", "address": "Address", "city": "City", "subscription_type": "free"}`
	req, _ := http.NewRequest("POST", "/owner/create-library", bytes.NewBufferString(reqBody))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	// Assertions
	assert.Equal(t, http.StatusCreated, w.Code)
	assert.Contains(t, w.Body.String(), "Library created successfully")
}
