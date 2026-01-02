package services

import (
	"errors"
	"fmt"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	"github.com/campus-share/backend/internal/database"
	"github.com/campus-share/backend/internal/models"
	"github.com/campus-share/backend/pkg/jwt"
)

var (
	ErrUserNotFound      = errors.New("user not found")
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrUserExists        = errors.New("user already exists")
	ErrEmailRequired     = errors.New("email is required")
	ErrPasswordRequired  = errors.New("password is required")
)

// AuthService handles authentication-related operations
type AuthService struct{}

// NewAuthService creates a new auth service
func NewAuthService() *AuthService {
	return &AuthService{}
}

// RegisterRequest represents a user registration request
type RegisterRequest struct {
	Email     string `json:"email" binding:"required,email"`
	Password  string `json:"password" binding:"required,min=8"`
	FirstName string `json:"first_name" binding:"required"`
	LastName  string `json:"last_name" binding:"required"`
	StudentID string `json:"student_id,omitempty"`
}

// LoginRequest represents a user login request
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// Register registers a new user
func (s *AuthService) Register(req RegisterRequest, jwtSecret string, expirationHours int) (*models.User, string, error) {
	// Validate input
	if req.Email == "" {
		return nil, "", ErrEmailRequired
	}
	if req.Password == "" {
		return nil, "", ErrPasswordRequired
	}

	// Check if user already exists
	var existingUser models.User
	if err := database.DB.Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
		return nil, "", ErrUserExists
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, "", fmt.Errorf("failed to hash password: %w", err)
	}

	// Create user
	user := models.User{
		Email:        req.Email,
		PasswordHash: string(hashedPassword),
		FirstName:    req.FirstName,
		LastName:     req.LastName,
		StudentID:    req.StudentID,
		Role:         models.RoleStudent,
		IsActive:     true,
	}

	if err := database.DB.Create(&user).Error; err != nil {
		return nil, "", fmt.Errorf("failed to create user: %w", err)
	}

	// Generate JWT token
	token, err := jwt.GenerateToken(user.ID, user.Email, string(user.Role), jwtSecret, expirationHours)
	if err != nil {
		return nil, "", fmt.Errorf("failed to generate token: %w", err)
	}

	return &user, token, nil
}

// Login authenticates a user and returns a JWT token
func (s *AuthService) Login(req LoginRequest, jwtSecret string, expirationHours int) (*models.User, string, error) {
	// Find user
	var user models.User
	if err := database.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, "", ErrInvalidCredentials
		}
		return nil, "", fmt.Errorf("failed to find user: %w", err)
	}

	// Check if user is active and not banned
	if !user.IsActive || user.IsBanned {
		return nil, "", errors.New("account is inactive or banned")
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, "", ErrInvalidCredentials
	}

	// Generate JWT token
	token, err := jwt.GenerateToken(user.ID, user.Email, string(user.Role), jwtSecret, expirationHours)
	if err != nil {
		return nil, "", fmt.Errorf("failed to generate token: %w", err)
	}

	return &user, token, nil
}

// GetUserByID retrieves a user by ID
func (s *AuthService) GetUserByID(userID uuid.UUID) (*models.User, error) {
	var user models.User
	if err := database.DB.Preload("University").Preload("Department").Where("id = ?", userID).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	return &user, nil
}

// UpdateProfile updates a user's profile
type UpdateProfileRequest struct {
	FirstName    string     `json:"first_name,omitempty"`
	LastName     string     `json:"last_name,omitempty"`
	StudentID    string     `json:"student_id,omitempty"`
	UniversityID *uuid.UUID `json:"university_id,omitempty"`
	DepartmentID *uuid.UUID `json:"department_id,omitempty"`
	Year         *int       `json:"year,omitempty"`
	Major        string     `json:"major,omitempty"`
}

func (s *AuthService) UpdateProfile(userID uuid.UUID, req UpdateProfileRequest) (*models.User, error) {
	var user models.User
	if err := database.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		return nil, ErrUserNotFound
	}

	// Update fields
	if req.FirstName != "" {
		user.FirstName = req.FirstName
	}
	if req.LastName != "" {
		user.LastName = req.LastName
	}
	if req.StudentID != "" {
		user.StudentID = req.StudentID
	}
	if req.UniversityID != nil {
		user.UniversityID = req.UniversityID
	}
	if req.DepartmentID != nil {
		user.DepartmentID = req.DepartmentID
	}
	if req.Year != nil {
		user.Year = *req.Year
	}
	if req.Major != "" {
		user.Major = req.Major
	}

	if err := database.DB.Save(&user).Error; err != nil {
		return nil, fmt.Errorf("failed to update profile: %w", err)
	}

	// Reload with relations
	return s.GetUserByID(userID)
}


