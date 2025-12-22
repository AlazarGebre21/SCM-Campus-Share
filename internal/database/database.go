package database

import (
	"fmt"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"github.com/campus-share/backend/internal/config"
	"github.com/campus-share/backend/internal/models"
)

// DB is the global database instance
var DB *gorm.DB

// Connect establishes a connection to the database
func Connect(cfg *config.Config) error {
	var err error

	dsn := cfg.GetDatabaseURL()

	// Configure GORM logger based on environment
	logLevel := logger.Silent
	if cfg.Server.Environment == "development" {
		logLevel = logger.Info
	}

	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logLevel),
	})

	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	log.Println("Database connection established successfully")
	return nil
}

// Migrate runs database migrations
func Migrate() error {
	if DB == nil {
		return fmt.Errorf("database connection not established")
	}

	log.Println("Running database migrations...")

	err := DB.AutoMigrate(
		&models.User{},
		&models.University{},
		&models.Department{},
		&models.Course{},
		&models.Resource{},
		&models.Comment{},
		&models.Rating{},
		&models.Bookmark{},
		&models.Report{},
		&models.Tag{},
		&models.ResourceTag{},
	)

	if err != nil {
		return fmt.Errorf("failed to run migrations: %w", err)
	}

	log.Println("Database migrations completed successfully")
	return nil
}

// Close closes the database connection
func Close() error {
	if DB == nil {
		return nil
	}

	sqlDB, err := DB.DB()
	if err != nil {
		return err
	}

	return sqlDB.Close()
}


