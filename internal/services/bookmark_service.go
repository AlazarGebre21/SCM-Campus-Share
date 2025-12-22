package services

import (
	"errors"
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/campus-share/backend/internal/database"
	"github.com/campus-share/backend/internal/models"
)

// BookmarkService handles bookmark-related operations
type BookmarkService struct{}

// NewBookmarkService creates a new bookmark service
func NewBookmarkService() *BookmarkService {
	return &BookmarkService{}
}

// CreateBookmark creates a bookmark
func (s *BookmarkService) CreateBookmark(resourceID, userID uuid.UUID) (*models.Bookmark, error) {
	// Verify resource exists
	var resource models.Resource
	if err := database.DB.Where("id = ?", resourceID).First(&resource).Error; err != nil {
		return nil, ErrResourceNotFound
	}

	// Check if bookmark already exists
	var existingBookmark models.Bookmark
	if err := database.DB.Where("resource_id = ? AND user_id = ?", resourceID, userID).First(&existingBookmark).Error; err == nil {
		return &existingBookmark, nil // Already bookmarked
	}

	bookmark := models.Bookmark{
		ResourceID: resourceID,
		UserID:     userID,
	}

	if err := database.DB.Create(&bookmark).Error; err != nil {
		return nil, fmt.Errorf("failed to create bookmark: %w", err)
	}

	return s.GetBookmarkByID(bookmark.ID)
}

// GetBookmarkByID retrieves a bookmark by ID
func (s *BookmarkService) GetBookmarkByID(bookmarkID uuid.UUID) (*models.Bookmark, error) {
	var bookmark models.Bookmark
	if err := database.DB.
		Preload("Resource.User").
		Preload("Resource.University").
		Preload("Resource.Department").
		Preload("Resource.Course").
		Where("id = ?", bookmarkID).
		First(&bookmark).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("bookmark not found")
		}
		return nil, fmt.Errorf("failed to get bookmark: %w", err)
	}

	return &bookmark, nil
}

// ListBookmarks lists bookmarks for a user
func (s *BookmarkService) ListBookmarks(userID uuid.UUID, page, pageSize int) ([]models.Bookmark, int64, error) {
	if pageSize <= 0 {
		pageSize = 20
	}
	if page <= 0 {
		page = 1
	}

	query := database.DB.Model(&models.Bookmark{}).
		Where("user_id = ?", userID).
		Preload("Resource.User").
		Preload("Resource.University").
		Preload("Resource.Department").
		Preload("Resource.Course").
		Preload("Resource.Tags.Tag")

	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count bookmarks: %w", err)
	}

	var bookmarks []models.Bookmark
	offset := (page - 1) * pageSize
	if err := query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&bookmarks).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to list bookmarks: %w", err)
	}

	return bookmarks, total, nil
}

// DeleteBookmark deletes a bookmark
func (s *BookmarkService) DeleteBookmark(bookmarkID, userID uuid.UUID) error {
	var bookmark models.Bookmark
	if err := database.DB.Where("id = ?", bookmarkID).First(&bookmark).Error; err != nil {
		return errors.New("bookmark not found")
	}

	// Check ownership
	if bookmark.UserID != userID {
		return ErrUnauthorized
	}

	if err := database.DB.Delete(&bookmark).Error; err != nil {
		return fmt.Errorf("failed to delete bookmark: %w", err)
	}

	return nil
}

// IsBookmarked checks if a resource is bookmarked by a user
func (s *BookmarkService) IsBookmarked(resourceID, userID uuid.UUID) (bool, error) {
	var count int64
	if err := database.DB.Model(&models.Bookmark{}).
		Where("resource_id = ? AND user_id = ?", resourceID, userID).
		Count(&count).Error; err != nil {
		return false, fmt.Errorf("failed to check bookmark: %w", err)
	}

	return count > 0, nil
}


