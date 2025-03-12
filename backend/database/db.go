package db

import (
	"fmt"
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	configs "github.com/mxansari007/librarymanagement/config"
	"github.com/mxansari007/librarymanagement/models"
)

// DB is the global database connection
var DB *gorm.DB

// Connect initializes the database connection
func Connect(config *configs.DBConfig) {
	// Check if running in test mode
	dbName := config.Name
	if os.Getenv("GO_ENV") == "test" {
		dbName = config.Name + "_test" // Use test database
	}

	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		config.Host, config.Port, config.User, config.Password, dbName, config.SSLMode,
	)

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Auto-migrate tables
	err = DB.AutoMigrate(
		&models.User{},
		&models.OwnerMembership{},
		&models.Library{},
		&models.Librarian{},
		&models.Book{},
		&models.BookRequest{},
		&models.BookTransaction{},
		&models.LibraryMembership{},
		&models.RejectedUser{},
	)
	if err != nil {
		log.Fatalf("Failed to auto-migrate models: %v", err)
	}

	log.Println("Connected to database:", dbName)
}

// ConnectTestDB initializes a test database connection
func ConnectTestDB(config *configs.DBConfig) error {
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		config.Host, config.Port, config.User, config.Password, config.Name, config.SSLMode,
	)

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Println("Failed to connect to test database:", err)
		return err
	}

	// Auto-migrate test tables
	err = DB.AutoMigrate(
		&models.User{},
		&models.OwnerMembership{},
		&models.Library{},
		&models.Librarian{},
		&models.Book{},
		&models.BookRequest{},
		&models.BookTransaction{},
		&models.LibraryMembership{},
		&models.RejectedUser{},
	)
	if err != nil {
		log.Println("Failed to auto-migrate test database:", err)
		return err
	}

	log.Println("Test database connected successfully")
	return nil
}
