package handlers

import (
	"net/http"

	"log"
	"github.com/gin-gonic/gin"
	"github.com/mxansari007/librarymanagement/models"
	"gorm.io/gorm"

)




// create api to search library by name or by city and return the list of libraries with their details

func SearchLibraries(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
            Name  string `json:"name"`
            City string `json:"city"`
        }

        if err := c.ShouldBindJSON(&req); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
            return
        }

        var libraries []models.Library

        if req.Name != "" && req.City != "" {
            db.Where("name LIKE ? AND city LIKE ?", "%"+req.Name+"%", "%"+req.City+"%").Find(&libraries)
        } else if req.Name != "" {
            db.Where("name LIKE ?", "%"+req.Name+"%").Find(&libraries)
        } else if req.City != "" {
            db.Where("city LIKE ?", "%"+req.City+"%").Find(&libraries)
        }
		// log search and return response

		log.Printf("Libraries searched: Name: %s, City: %s, Count: %d", req.Name, req.City, len(libraries))
		c.JSON(http.StatusOK, gin.H{"data": libraries})

	}
}




// check isVerified function to check if user is verified or not using email ID



func IsVerified(db *gorm.DB) gin.HandlerFunc {

	return func(c *gin.Context) {
		var user models.User
        if err := db.Where("email = ?", c.Param("email")).First(&user).Error; err != nil {
            c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
            return
        }

        if !user.IsVerified {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Account is not verified"})
            return
        }

        c.JSON(http.StatusOK, gin.H{"verified": true})
    }
}