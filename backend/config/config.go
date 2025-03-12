package configs

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	"path/filepath"
)

// Config holds the application configuration
type Config struct {
	Port string
	DB   DBConfig
}

// DBConfig holds the database configuration
type DBConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	Name     string
	SSLMode  string
}

// LoadConfig loads configuration from the appropriate .env file
func LoadConfig() *Config {
	env := os.Getenv("GO_ENV")

	var envFile string
	if env == "test" {
		wd, _ := os.Getwd()
		envFile = filepath.Join(wd, "..", ".env.test") 
	} else {
		envFile = ".env" // Load default environment variables
	}

	err := godotenv.Load(envFile)
	if err != nil {
		log.Fatalf("Error loading %s file: %v", envFile, err)
	}

	return &Config{
		Port: os.Getenv("PORT"),
		DB: DBConfig{
			Host:     os.Getenv("DB_HOST"),
			Port:     os.Getenv("DB_PORT"),
			User:     os.Getenv("DB_USER"),
			Password: os.Getenv("DB_PASSWORD"),
			Name:     os.Getenv("DB_NAME"),
			SSLMode:  os.Getenv("DB_SSLMODE"),
		},
	}
}
