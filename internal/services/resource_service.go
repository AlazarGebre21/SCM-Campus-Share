package services

import (
	"errors"
	"fmt"
	"mime/multipart"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/campus-share/backend/internal/database"
	"github.com/campus-share/backend/internal/models"
	"github.com/campus-share/backend/internal/storage"
)

var (
	ErrResourceNotFound = errors.New("resource not found")
	ErrUnauthorized     = errors.New("unauthorized")
	ErrFileTooLarge     = errors.New("file too large")
	ErrInvalidFileType  = errors.New("invalid file type")
)

// ResourceService handles resource-related operations
type ResourceService struct {
	storage *storage.S3Storage
}

// NewResourceService creates a new resource service
func NewResourceService(s3Storage *storage.S3Storage) *ResourceService {
	return &ResourceService{
		storage: s3Storage,
	}
}

// CreateResourceRequest represents a request to create a resource
type CreateResourceRequest struct {
	Title        string                 `json:"title" binding:"required"`
	Description  string                 `json:"description"`
	Type         models.ResourceType    `json:"type" binding:"required"`
	UniversityID *uuid.UUID             `json:"university_id,omitempty"`
	DepartmentID *uuid.UUID             `json:"department_id,omitempty"`
	CourseID     *uuid.UUID             `json:"course_id,omitempty"`
	SharingLevel models.SharingLevel    `json:"sharing_level"`
	Tags         []string               `json:"tags,omitempty"`
	File         multipart.FileHeader   `json:"-"`
}

// CreateResource creates a new resource
func (s *ResourceService) CreateResource(userID uuid.UUID, req CreateResourceRequest, maxFileSize int64, allowedTypes []string) (*models.Resource, error) {
	// Validate file
	if req.File.Size == 0 {
		return nil, errors.New("file is required")
	}

	if req.File.Size > maxFileSize*1024*1024 { // Convert MB to bytes
		return nil, ErrFileTooLarge
	}

	// Validate file type
	fileType := req.File.Header.Get("Content-Type")
	allowed := false
	for _, allowedType := range allowedTypes {
		if fileType == fmt.Sprintf("application/%s", allowedType) || 
		   fileType == fmt.Sprintf("image/%s", allowedType) ||
		   fileType == fmt.Sprintf("video/%s", allowedType) {
			allowed = true
			break
		}
	}
	if !allowed {
		return nil, ErrInvalidFileType
	}

	// Generate resource ID
	resourceID := uuid.New()

	// Generate S3 key
	s3Key := storage.GenerateKey(userID.String(), resourceID.String(), req.File.Filename)

	// Open file
	file, err := req.File.Open()
	if err != nil {
		return nil, fmt.Errorf("failed to open file: %w", err)
	}
	defer file.Close()

	// Upload to S3
	if err := s.storage.UploadFile(s3Key, file, fileType, req.File.Size); err != nil {
		return nil, fmt.Errorf("failed to upload file: %w", err)
	}

	// Create resource record
	resource := models.Resource{
		ID:           resourceID,
		UserID:       userID,
		Title:        req.Title,
		Description:  req.Description,
		Type:         req.Type,
		FileName:     req.File.Filename,
		FileSize:     req.File.Size,
		FileType:     fileType,
		S3Key:        s3Key,
		UniversityID: req.UniversityID,
		DepartmentID: req.DepartmentID,
		CourseID:     req.CourseID,
		SharingLevel: req.SharingLevel,
		IsApproved:   true, // Auto-approve for now, can be changed to require moderation
	}

	if resource.SharingLevel == "" {
		resource.SharingLevel = models.SharingLevelPublic
	}

	if err := database.DB.Create(&resource).Error; err != nil {
		// Clean up uploaded file if database insert fails
		_ = s.storage.DeleteFile(s3Key)
		return nil, fmt.Errorf("failed to create resource: %w", err)
	}

	// Add tags
	if len(req.Tags) > 0 {
		if err := s.addTagsToResource(resourceID, req.Tags); err != nil {
			// Log error but don't fail the request
			fmt.Printf("Warning: failed to add tags: %v\n", err)
		}
	}

	// Load relations
	return s.GetResourceByID(resourceID)
}

// GetResourceByID retrieves a resource by ID
func (s *ResourceService) GetResourceByID(resourceID uuid.UUID) (*models.Resource, error) {
	var resource models.Resource
	if err := database.DB.
		Preload("User").
		Preload("University").
		Preload("Department").
		Preload("Course").
		Preload("Tags.Tag").
		Where("id = ?", resourceID).
		First(&resource).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrResourceNotFound
		}
		return nil, fmt.Errorf("failed to get resource: %w", err)
	}

	// Increment view count
	database.DB.Model(&resource).UpdateColumn("view_count", gorm.Expr("view_count + 1"))

	// Generate presigned URL
	url, err := s.storage.GetPresignedURL(resource.S3Key, 15*time.Minute)
	if err == nil {
		resource.S3URL = url
	}

	return &resource, nil
}

// ListResourcesRequest represents a request to list resources
type ListResourcesRequest struct {
	Page         int       `form:"page"`
	PageSize     int       `form:"page_size"`
	Search       string    `form:"search"`
	Type         string    `form:"type"`
	UniversityID *uuid.UUID `form:"university_id"`
	DepartmentID *uuid.UUID `form:"department_id"`
	CourseID     *uuid.UUID `form:"course_id"`
	Tag          string    `form:"tag"`
	SortBy       string    `form:"sort_by"` // "newest", "popular", "rating"
}

// ListResources lists resources with filtering and pagination
func (s *ResourceService) ListResources(req ListResourcesRequest, userID *uuid.UUID) ([]models.Resource, int64, error) {
	query := database.DB.Model(&models.Resource{}).
		Where("is_approved = ?", true).
		Preload("User").
		Preload("University").
		Preload("Department").
		Preload("Course").
		Preload("Tags.Tag")

	// Apply filters
	if req.Search != "" {
		query = query.Where("title ILIKE ? OR description ILIKE ?", "%"+req.Search+"%", "%"+req.Search+"%")
	}

	if req.Type != "" {
		query = query.Where("type = ?", req.Type)
	}

	if req.UniversityID != nil {
		query = query.Where("university_id = ?", req.UniversityID)
	}

	if req.DepartmentID != nil {
		query = query.Where("department_id = ?", req.DepartmentID)
	}

	if req.CourseID != nil {
		query = query.Where("course_id = ?", req.CourseID)
	}

	if req.Tag != "" {
		query = query.Joins("JOIN resource_tags ON resources.id = resource_tags.resource_id").
			Joins("JOIN tags ON resource_tags.tag_id = tags.id").
			Where("tags.name = ?", req.Tag)
	}

	// Apply sharing level filter
	if userID != nil {
		// Get user's university
		var user models.User
		if err := database.DB.Where("id = ?", userID).First(&user).Error; err == nil {
			if user.UniversityID != nil {
				query = query.Where("sharing_level = ? OR (sharing_level = ? AND university_id = ?)",
					models.SharingLevelPublic, models.SharingLevelUniversity, user.UniversityID)
			} else {
				query = query.Where("sharing_level = ?", models.SharingLevelPublic)
			}
		} else {
			query = query.Where("sharing_level = ?", models.SharingLevelPublic)
		}
	} else {
		query = query.Where("sharing_level = ?", models.SharingLevelPublic)
	}

	// Get total count
	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count resources: %w", err)
	}

	// Apply sorting
	switch req.SortBy {
	case "popular":
		query = query.Order("download_count DESC, view_count DESC")
	case "rating":
		// This would require a join with ratings table and average calculation
		query = query.Order("created_at DESC")
	default:
		query = query.Order("created_at DESC")
	}

	// Apply pagination
	if req.PageSize <= 0 {
		req.PageSize = 20
	}
	if req.Page <= 0 {
		req.Page = 1
	}
	offset := (req.Page - 1) * req.PageSize
	query = query.Offset(offset).Limit(req.PageSize)

	var resources []models.Resource
	if err := query.Find(&resources).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to list resources: %w", err)
	}

	// Generate presigned URLs
	for i := range resources {
		url, err := s.storage.GetPresignedURL(resources[i].S3Key, 15*time.Minute)
		if err == nil {
			resources[i].S3URL = url
		}
	}

	return resources, total, nil
}

// UpdateResourceRequest represents a request to update a resource
type UpdateResourceRequest struct {
	Title        string              `json:"title,omitempty"`
	Description  string              `json:"description,omitempty"`
	Type         *models.ResourceType `json:"type,omitempty"`
	SharingLevel *models.SharingLevel `json:"sharing_level,omitempty"`
	Tags         []string            `json:"tags,omitempty"`
}

// UpdateResource updates a resource
func (s *ResourceService) UpdateResource(resourceID, userID uuid.UUID, req UpdateResourceRequest) (*models.Resource, error) {
	var resource models.Resource
	if err := database.DB.Where("id = ?", resourceID).First(&resource).Error; err != nil {
		return nil, ErrResourceNotFound
	}

	// Check ownership
	if resource.UserID != userID {
		return nil, ErrUnauthorized
	}

	// Update fields
	if req.Title != "" {
		resource.Title = req.Title
	}
	if req.Description != "" {
		resource.Description = req.Description
	}
	if req.Type != nil {
		resource.Type = *req.Type
	}
	if req.SharingLevel != nil {
		resource.SharingLevel = *req.SharingLevel
	}

	if err := database.DB.Save(&resource).Error; err != nil {
		return nil, fmt.Errorf("failed to update resource: %w", err)
	}

	// Update tags if provided
	if req.Tags != nil {
		// Delete existing tags
		database.DB.Where("resource_id = ?", resourceID).Delete(&models.ResourceTag{})
		// Add new tags
		if err := s.addTagsToResource(resourceID, req.Tags); err != nil {
			return nil, fmt.Errorf("failed to update tags: %w", err)
		}
	}

	return s.GetResourceByID(resourceID)
}

// DeleteResource deletes a resource
func (s *ResourceService) DeleteResource(resourceID, userID uuid.UUID, isAdmin bool) error {
	var resource models.Resource
	if err := database.DB.Where("id = ?", resourceID).First(&resource).Error; err != nil {
		return ErrResourceNotFound
	}

	// Check ownership or admin
	if resource.UserID != userID && !isAdmin {
		return ErrUnauthorized
	}

	// Delete from S3
	if err := s.storage.DeleteFile(resource.S3Key); err != nil {
		// Log error but continue with database deletion
		fmt.Printf("Warning: failed to delete file from S3: %v\n", err)
	}

	// Delete from database
	if err := database.DB.Delete(&resource).Error; err != nil {
		return fmt.Errorf("failed to delete resource: %w", err)
	}

	return nil
}

// DownloadResource increments download count and returns presigned URL
func (s *ResourceService) DownloadResource(resourceID uuid.UUID) (string, error) {
	var resource models.Resource
	if err := database.DB.Where("id = ?", resourceID).First(&resource).Error; err != nil {
		return "", ErrResourceNotFound
	}

	// Increment download count
	database.DB.Model(&resource).UpdateColumn("download_count", gorm.Expr("download_count + 1"))

	// Generate presigned URL (valid for 1 hour)
	url, err := s.storage.GetPresignedURL(resource.S3Key, 1*time.Hour)
	if err != nil {
		return "", fmt.Errorf("failed to generate download URL: %w", err)
	}

	return url, nil
}

// addTagsToResource adds tags to a resource
func (s *ResourceService) addTagsToResource(resourceID uuid.UUID, tagNames []string) error {
	for _, tagName := range tagNames {
		if tagName == "" {
			continue
		}

		// Find or create tag
		var tag models.Tag
		if err := database.DB.Where("name = ?", tagName).First(&tag).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				tag = models.Tag{Name: tagName}
				if err := database.DB.Create(&tag).Error; err != nil {
					return fmt.Errorf("failed to create tag: %w", err)
				}
			} else {
				return fmt.Errorf("failed to find tag: %w", err)
			}
		}

		// Check if resource-tag relationship already exists
		var resourceTag models.ResourceTag
		if err := database.DB.Where("resource_id = ? AND tag_id = ?", resourceID, tag.ID).First(&resourceTag).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				resourceTag = models.ResourceTag{
					ResourceID: resourceID,
					TagID:      tag.ID,
				}
				if err := database.DB.Create(&resourceTag).Error; err != nil {
					return fmt.Errorf("failed to create resource tag: %w", err)
				}
			} else {
				return fmt.Errorf("failed to check resource tag: %w", err)
			}
		}
	}

	return nil
}


