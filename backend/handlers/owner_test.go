package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	db "github.com/mxansari007/librarymanagement/database"
	"github.com/stretchr/testify/assert"
	configs "github.com/mxansari007/librarymanagement/config"
)

func TestSignupOwner(t *testing.T) {
	gin.SetMode(gin.TestMode)

	config := configs.LoadConfig()

	err := db.ConnectTestDB(&config.DB)
	if err != nil {
		t.Fatalf("Failed to connect to test database: %v", err)
	}

	router := gin.Default()
	router.POST("/owner/signup", SignupOwner(db.DB)) // Ensure `SignupOwner` is correctly initialized

	payload := map[string]string{
		"firstname": "maaz",
		"lastname":  "ansari",
		"email":     "m15@gmail.com",
		"password":  "12345678",
		"plan_type": "gold",
	}

	jsonValue, _ := json.Marshal(payload)

	req, err := http.NewRequest(http.MethodPost, "/owner/signup", bytes.NewBuffer(jsonValue))
	if err != nil {
		t.Fatalf("Failed to create request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	var responseBody map[string]interface{}
	err = json.Unmarshal(w.Body.Bytes(), &responseBody)
	if err != nil {
		t.Fatalf("Failed to parse response JSON: %v", err)
	}

	assert.Equal(t, http.StatusCreated, w.Code, "Expected 201 Created status")
	assert.Equal(t, "Owner created successfully", responseBody["message"], "Response message should match")
}
