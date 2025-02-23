package db

import (
	"fmt"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	configs "github.com/mxansari007/librarymanagement/config"

	"github.com/mxansari007/librarymanagement/models"
)

// DB is the global database connection
var DB *gorm.DB

// Connect initializes the database connection
func Connect(config *configs.DBConfig) {
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		config.Host, config.Port, config.User, config.Password, config.Name, config.SSLMode,
	)

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	err = DB.AutoMigrate(
		&models.User{},
		&models.OwnerMembership{},
		&models.Library{},
		&models.Librarian{},
		&models.Book{},
		&models.BookRequest{},
		&models.BookTransaction{},
		&models.LibraryMembership{},
	)

	if err != nil {
		log.Fatalf("Failed to auto-migrate models: %v", err)
	}

	log.Println("Connected to database")
}
