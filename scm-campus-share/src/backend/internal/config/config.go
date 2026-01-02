package config

import (
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

// Config holds all configuration for the application
type Config struct {
	Server    ServerConfig
	Database  DatabaseConfig
	JWT       JWTConfig
	AWS       AWSConfig
	OAuth     OAuthConfig
	CORS      CORSConfig
	Upload    UploadConfig
	RateLimit RateLimitConfig
}

// ServerConfig holds server-related configuration
type ServerConfig struct {
	Port        string
	Host        string
	Environment string
}

// DatabaseConfig holds database-related configuration
type DatabaseConfig struct {
	URL      string
	Host     string
	Port     string
	User     string
	Password string
	Name     string
}

// JWTConfig holds JWT-related configuration
type JWTConfig struct {
	Secret          string
	ExpirationHours int
}

// AWSConfig holds AWS S3-related configuration
type AWSConfig struct {
	AccessKeyID     string
	SecretAccessKey string
	Region          string
	BucketName      string
	Endpoint        string // For MinIO or custom S3-compatible services
}

// OAuthConfig holds OAuth-related configuration
type OAuthConfig struct {
	GoogleClientID     string
	GoogleClientSecret string
	GoogleRedirectURI  string
}

// CORSConfig holds CORS-related configuration
type CORSConfig struct {
	AllowedOrigins []string
	AllowedMethods []string
	AllowedHeaders []string
}

// UploadConfig holds file upload-related configuration
type UploadConfig struct {
	MaxFileSizeMB    int
	AllowedFileTypes []string
}

// RateLimitConfig holds rate limiting configuration
type RateLimitConfig struct {
	Requests int
	Window   time.Duration
}

// Load loads configuration from environment variables
func Load() (*Config, error) {
	// Try to load .env file (ignore error if it doesn't exist)
	_ = godotenv.Load()

	config := &Config{
		Server: ServerConfig{
			Port:        getEnv("SERVER_PORT", "8080"),
			Host:        getEnv("SERVER_HOST", "localhost"),
			Environment: getEnv("ENVIRONMENT", "development"),
		},
		Database: DatabaseConfig{
			URL:      getEnv("DATABASE_URL", ""),
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5432"),
			User:     getEnv("DB_USER", "postgres"),
			Password: getEnv("DB_PASSWORD", "password"),
			Name:     getEnv("DB_NAME", "campus_share"),
		},
		JWT: JWTConfig{
			Secret:          getEnv("JWT_SECRET", "change-this-secret-key"),
			ExpirationHours: getEnvAsInt("JWT_EXPIRATION_HOURS", 24),
		},
		AWS: AWSConfig{
			AccessKeyID:     getEnv("AWS_ACCESS_KEY_ID", ""),
			SecretAccessKey: getEnv("AWS_SECRET_ACCESS_KEY", ""),
			Region:          getEnv("AWS_REGION", "us-east-1"),
			BucketName:      getEnv("S3_BUCKET_NAME", ""),
			Endpoint:        getEnv("S3_ENDPOINT", ""),
		},
		OAuth: OAuthConfig{
			GoogleClientID:     getEnv("GOOGLE_CLIENT_ID", ""),
			GoogleClientSecret: getEnv("GOOGLE_CLIENT_SECRET", ""),
			GoogleRedirectURI:  getEnv("GOOGLE_REDIRECT_URI", "http://localhost:8080/api/v1/auth/google/callback"),
		},
		CORS: CORSConfig{
			AllowedOrigins: getEnvAsSlice("CORS_ALLOWED_ORIGINS", []string{"http://localhost:3000"}),
			AllowedMethods: getEnvAsSlice("CORS_ALLOWED_METHODS", []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}),
			AllowedHeaders: getEnvAsSlice("CORS_ALLOWED_HEADERS", []string{"Content-Type", "Authorization"}),
		},
		Upload: UploadConfig{
			MaxFileSizeMB:    getEnvAsInt("MAX_FILE_SIZE_MB", 100),
			AllowedFileTypes: getEnvAsSlice("ALLOWED_FILE_TYPES", []string{"pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "jpg", "jpeg", "png", "gif", "mp4", "avi"}),
		},
		RateLimit: RateLimitConfig{
			Requests: getEnvAsInt("RATE_LIMIT_REQUESTS", 100),
			Window:   time.Duration(getEnvAsInt("RATE_LIMIT_WINDOW_MINUTES", 15)) * time.Minute,
		},
	}

	// Validate required configuration
	if err := config.Validate(); err != nil {
		return nil, fmt.Errorf("invalid configuration: %w", err)
	}

	return config, nil
}

// Validate validates the configuration
func (c *Config) Validate() error {
	if c.JWT.Secret == "change-this-secret-key" && c.Server.Environment == "production" {
		return fmt.Errorf("JWT_SECRET must be changed in production")
	}

	if c.Database.URL == "" && (c.Database.Host == "" || c.Database.User == "" || c.Database.Name == "") {
		return fmt.Errorf("database configuration is incomplete")
	}

	// S3_BUCKET_NAME is optional for development (can be empty)
	// if c.AWS.BucketName == "" {
	// 	return fmt.Errorf("S3_BUCKET_NAME is required")
	// }

	return nil
}

// GetDatabaseURL returns the database connection URL
func (c *Config) GetDatabaseURL() string {
	if c.Database.URL != "" {
		return c.Database.URL
	}
	return fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable",
		c.Database.User,
		c.Database.Password,
		c.Database.Host,
		c.Database.Port,
		c.Database.Name,
	)
}

// Helper functions
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	valueStr := getEnv(key, "")
	if value, err := strconv.Atoi(valueStr); err == nil {
		return value
	}
	return defaultValue
}

func getEnvAsSlice(key string, defaultValue []string) []string {
	valueStr := getEnv(key, "")
	if valueStr == "" {
		return defaultValue
	}

	// Simple comma-separated parsing
	var result []string
	start := 0
	for i, char := range valueStr {
		if char == ',' {
			if i > start {
				result = append(result, valueStr[start:i])
			}
			start = i + 1
		}
	}
	if start < len(valueStr) {
		result = append(result, valueStr[start:])
	}

	if len(result) == 0 {
		return defaultValue
	}
	return result
}
