package main

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"github.com/campus-share/backend/internal/models"
	"github.com/google/uuid"
)

func main() {
	// Load .env file (ignore error if it doesn't exist)
	_ = godotenv.Load()

	// Get database connection string from environment or use default
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		// Construct from individual env vars or use defaults
		dbHost := getEnv("DB_HOST", "localhost")
		dbPort := getEnv("DB_PORT", "5432")
		dbUser := getEnv("DB_USER", "postgres")
		dbPassword := getEnv("DB_PASSWORD", "password")
		dbName := getEnv("DB_NAME", "campus_share")

		dbURL = fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable",
			dbUser, dbPassword, dbHost, dbPort, dbName)
	}

	// Connect to database
	db, err := gorm.Open(postgres.Open(dbURL), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Admin credentials
	adminEmail := getEnv("ADMIN_EMAIL", "admin@campus.edu")
	adminPassword := getEnv("ADMIN_PASSWORD", "Admin123!")
	adminFirstName := getEnv("ADMIN_FIRST_NAME", "Admin")
	adminLastName := getEnv("ADMIN_LAST_NAME", "User")

	// Check if admin user already exists
	var existingUser models.User
	result := db.Where("email = ?", adminEmail).First(&existingUser)
	if result.Error == nil {
		// User exists, update to admin if not already
		if existingUser.Role != models.RoleAdmin {
			existingUser.Role = models.RoleAdmin
			if err := db.Save(&existingUser).Error; err != nil {
				log.Fatalf("Failed to update user to admin: %v", err)
			}
			fmt.Printf("✓ Updated existing user '%s' to admin role\n", adminEmail)
		} else {
			fmt.Printf("✓ Admin user '%s' already exists with admin role\n", adminEmail)
		}
		return
	}

	// Hash password (same way as auth service)
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(adminPassword), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("Failed to hash password: %v", err)
	}

	// Create admin user
	adminUser := models.User{
		ID:           uuid.New(),
		Email:        adminEmail,
		PasswordHash: string(hashedPassword),
		FirstName:    adminFirstName,
		LastName:     adminLastName,
		Role:         models.RoleAdmin,
		IsActive:     true,
		IsBanned:     false,
	}

	if err := db.Create(&adminUser).Error; err != nil {
		log.Fatalf("Failed to create admin user: %v", err)
	}

	fmt.Println("✓ Admin user created successfully!")
	fmt.Printf("  Email: %s\n", adminEmail)
	fmt.Printf("  Password: %s\n", adminPassword)
	fmt.Printf("  Role: %s\n", adminUser.Role)
	fmt.Printf("\n⚠️  IMPORTANT: Change the password after first login!\n")
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

