package services

import (
	"errors"
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/campus-share/backend/internal/database"
	"github.com/campus-share/backend/internal/models"
)

// RatingService handles rating-related operations
type RatingService struct{}

// NewRatingService creates a new rating service
func NewRatingService() *RatingService {
	return &RatingService{}
}

// CreateRatingRequest represents a request to create/update a rating
type CreateRatingRequest struct {
	Value int `json:"value" binding:"required,min=1,max=5"`
}

// CreateOrUpdateRating creates or updates a rating
func (s *RatingService) CreateOrUpdateRating(resourceID, userID uuid.UUID, req CreateRatingRequest) (*models.Rating, error) {
	// Verify resource exists
	var resource models.Resource
	if err := database.DB.Where("id = ?", resourceID).First(&resource).Error; err != nil {
		return nil, ErrResourceNotFound
	}

	// Check if rating already exists
	var rating models.Rating
	err := database.DB.Where("resource_id = ? AND user_id = ?", resourceID, userID).First(&rating).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		// Create new rating
		rating = models.Rating{
			ResourceID: resourceID,
			UserID:     userID,
			Value:      req.Value,
		}
		if err := database.DB.Create(&rating).Error; err != nil {
			return nil, fmt.Errorf("failed to create rating: %w", err)
		}
	} else if err != nil {
		return nil, fmt.Errorf("failed to check rating: %w", err)
	} else {
		// Update existing rating
		rating.Value = req.Value
		if err := database.DB.Save(&rating).Error; err != nil {
			return nil, fmt.Errorf("failed to update rating: %w", err)
		}
	}

	return &rating, nil
}

// GetResourceRating returns the average rating for a resource
func (s *RatingService) GetResourceRating(resourceID uuid.UUID) (float64, int, error) {
	var result struct {
		Average float64
		Count   int
	}

	if err := database.DB.Model(&models.Rating{}).
		Select("COALESCE(AVG(value), 0) as average, COUNT(*) as count").
		Where("resource_id = ?", resourceID).
		Scan(&result).Error; err != nil {
		return 0, 0, fmt.Errorf("failed to get rating: %w", err)
	}

	return result.Average, result.Count, nil
}

// GetUserRating returns the user's rating for a resource
func (s *RatingService) GetUserRating(resourceID, userID uuid.UUID) (*models.Rating, error) {
	var rating models.Rating
	if err := database.DB.Where("resource_id = ? AND user_id = ?", resourceID, userID).First(&rating).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil // No rating yet
		}
		return nil, fmt.Errorf("failed to get rating: %w", err)
	}

	return &rating, nil
}


