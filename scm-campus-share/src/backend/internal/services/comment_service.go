package services

import (
	"errors"
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/campus-share/backend/internal/database"
	"github.com/campus-share/backend/internal/models"
)

var (
	ErrCommentNotFound = errors.New("comment not found")
)

// CommentService handles comment-related operations
type CommentService struct{}

// NewCommentService creates a new comment service
func NewCommentService() *CommentService {
	return &CommentService{}
}

// CreateCommentRequest represents a request to create a comment
type CreateCommentRequest struct {
	Content  string     `json:"content" binding:"required"`
	ParentID *uuid.UUID `json:"parent_id,omitempty"`
}

// CreateComment creates a new comment
func (s *CommentService) CreateComment(resourceID, userID uuid.UUID, req CreateCommentRequest) (*models.Comment, error) {
	// Verify resource exists
	var resource models.Resource
	if err := database.DB.Where("id = ?", resourceID).First(&resource).Error; err != nil {
		return nil, ErrResourceNotFound
	}

	comment := models.Comment{
		ResourceID: resourceID,
		UserID:     userID,
		Content:    req.Content,
		ParentID:   req.ParentID,
	}

	if err := database.DB.Create(&comment).Error; err != nil {
		return nil, fmt.Errorf("failed to create comment: %w", err)
	}

	return s.GetCommentByID(comment.ID)
}

// GetCommentByID retrieves a comment by ID
func (s *CommentService) GetCommentByID(commentID uuid.UUID) (*models.Comment, error) {
	var comment models.Comment
	if err := database.DB.
		Preload("User").
		Preload("Replies.User").
		Where("id = ?", commentID).
		First(&comment).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrCommentNotFound
		}
		return nil, fmt.Errorf("failed to get comment: %w", err)
	}

	return &comment, nil
}

// ListComments lists comments for a resource
func (s *CommentService) ListComments(resourceID uuid.UUID) ([]models.Comment, error) {
	var comments []models.Comment
	if err := database.DB.
		Preload("User").
		Preload("Replies.User").
		Where("resource_id = ? AND parent_id IS NULL", resourceID).
		Order("created_at DESC").
		Find(&comments).Error; err != nil {
		return nil, fmt.Errorf("failed to list comments: %w", err)
	}

	return comments, nil
}

// UpdateCommentRequest represents a request to update a comment
type UpdateCommentRequest struct {
	Content string `json:"content" binding:"required"`
}

// UpdateComment updates a comment
func (s *CommentService) UpdateComment(commentID, userID uuid.UUID, req UpdateCommentRequest) (*models.Comment, error) {
	var comment models.Comment
	if err := database.DB.Where("id = ?", commentID).First(&comment).Error; err != nil {
		return nil, ErrCommentNotFound
	}

	// Check ownership
	if comment.UserID != userID {
		return nil, ErrUnauthorized
	}

	comment.Content = req.Content
	if err := database.DB.Save(&comment).Error; err != nil {
		return nil, fmt.Errorf("failed to update comment: %w", err)
	}

	return s.GetCommentByID(commentID)
}

// DeleteComment deletes a comment
func (s *CommentService) DeleteComment(commentID, userID uuid.UUID, isAdmin bool) error {
	var comment models.Comment
	if err := database.DB.Where("id = ?", commentID).First(&comment).Error; err != nil {
		return ErrCommentNotFound
	}

	// Check ownership or admin
	if comment.UserID != userID && !isAdmin {
		return ErrUnauthorized
	}

	if err := database.DB.Delete(&comment).Error; err != nil {
		return fmt.Errorf("failed to delete comment: %w", err)
	}

	return nil
}


