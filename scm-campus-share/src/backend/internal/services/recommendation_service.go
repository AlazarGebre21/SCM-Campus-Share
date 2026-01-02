package services

import (
	"fmt"

	"github.com/google/uuid"
	"github.com/campus-share/backend/internal/database"
	"github.com/campus-share/backend/internal/models"
)

// RecommendationService handles resource recommendations
type RecommendationService struct{}

// NewRecommendationService creates a new recommendation service
func NewRecommendationService() *RecommendationService {
	return &RecommendationService{}
}

// GetSimilarResources returns resources similar to the given resource
func (s *RecommendationService) GetSimilarResources(resourceID uuid.UUID, limit int) ([]models.Resource, error) {
	// Get the target resource
	var targetResource models.Resource
	if err := database.DB.Where("id = ?", resourceID).First(&targetResource).Error; err != nil {
		return nil, fmt.Errorf("resource not found: %w", err)
	}

	if limit <= 0 {
		limit = 5
	}
	if limit > 20 {
		limit = 20
	}

	var resources []models.Resource
	query := database.DB.Model(&models.Resource{}).
		Preload("User").
		Preload("University").
		Preload("Course").
		Preload("Tags.Tag").
		Where("id != ? AND is_approved = ?", resourceID, true)

	// Find similar resources by:
	// 1. Same course (highest priority)
	if targetResource.CourseID != nil {
		query = query.Where("course_id = ?", targetResource.CourseID)
	} else if targetResource.DepartmentID != nil {
		// 2. Same department
		query = query.Where("department_id = ?", targetResource.DepartmentID)
	} else if targetResource.UniversityID != nil {
		// 3. Same university
		query = query.Where("university_id = ?", targetResource.UniversityID)
	}

	// Order by popularity and recency
	query = query.Order("download_count DESC, view_count DESC, created_at DESC").
		Limit(limit)

	if err := query.Find(&resources).Error; err != nil {
		return nil, fmt.Errorf("failed to get similar resources: %w", err)
	}

	// If we don't have enough results, fill with popular resources
	if len(resources) < limit {
		var additionalResources []models.Resource
		excludeIDs := []uuid.UUID{resourceID}
		for _, r := range resources {
			excludeIDs = append(excludeIDs, r.ID)
		}

		database.DB.Model(&models.Resource{}).
			Preload("User").
			Preload("University").
			Preload("Course").
			Preload("Tags.Tag").
			Where("id NOT IN ? AND is_approved = ?", excludeIDs, true).
			Order("download_count DESC, view_count DESC").
			Limit(limit - len(resources)).
			Find(&additionalResources)

		resources = append(resources, additionalResources...)
	}

	return resources, nil
}

// GetRecommendedForUser returns resources recommended for a user
func (s *RecommendationService) GetRecommendedForUser(userID uuid.UUID, limit int) ([]models.Resource, error) {
	if limit <= 0 {
		limit = 10
	}
	if limit > 50 {
		limit = 50
	}

	// Get user's profile
	var user models.User
	if err := database.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}

	var resources []models.Resource
	query := database.DB.Model(&models.Resource{}).
		Preload("User").
		Preload("University").
		Preload("Course").
		Preload("Tags.Tag").
		Where("is_approved = ? AND user_id != ?", true, userID)

	// Recommend based on user's university/department
	if user.DepartmentID != nil {
		query = query.Where("department_id = ?", user.DepartmentID)
	} else if user.UniversityID != nil {
		query = query.Where("university_id = ?", user.UniversityID)
	}

	// Order by popularity
	query = query.Order("download_count DESC, view_count DESC, created_at DESC").
		Limit(limit)

	if err := query.Find(&resources).Error; err != nil {
		return nil, fmt.Errorf("failed to get recommendations: %w", err)
	}

	return resources, nil
}

