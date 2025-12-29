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
	ErrTopicNotFound = errors.New("topic not found")
	ErrReplyNotFound = errors.New("reply not found")
	ErrTopicLocked   = errors.New("topic is locked")
)

// ForumService handles forum-related operations
type ForumService struct{}

// NewForumService creates a new forum service
func NewForumService() *ForumService {
	return &ForumService{}
}

// CreateTopicRequest represents a request to create a forum topic
type CreateTopicRequest struct {
	Title        string     `json:"title" binding:"required"`
	Content      string     `json:"content" binding:"required"`
	CourseID     *uuid.UUID `json:"course_id,omitempty"`
	UniversityID *uuid.UUID `json:"university_id,omitempty"`
	DepartmentID *uuid.UUID `json:"department_id,omitempty"`
}

// CreateTopic creates a new forum topic
func (s *ForumService) CreateTopic(userID uuid.UUID, req CreateTopicRequest) (*models.ForumTopic, error) {
	topic := models.ForumTopic{
		Title:        req.Title,
		Content:      req.Content,
		UserID:       userID,
		CourseID:     req.CourseID,
		UniversityID: req.UniversityID,
		DepartmentID: req.DepartmentID,
		IsApproved:   true,
	}

	if err := database.DB.Create(&topic).Error; err != nil {
		return nil, fmt.Errorf("failed to create topic: %w", err)
	}

	return s.GetTopicByID(topic.ID)
}

// GetTopicByID retrieves a topic by ID
func (s *ForumService) GetTopicByID(topicID uuid.UUID) (*models.ForumTopic, error) {
	var topic models.ForumTopic
	if err := database.DB.
		Preload("User").
		Preload("Course").
		Preload("University").
		Preload("Department").
		Preload("Replies.User").
		Preload("Replies.Replies.User").
		Where("id = ?", topicID).
		First(&topic).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrTopicNotFound
		}
		return nil, fmt.Errorf("failed to get topic: %w", err)
	}

	// Increment view count
	database.DB.Model(&topic).UpdateColumn("view_count", gorm.Expr("view_count + 1"))

	return &topic, nil
}

// ListTopicsRequest represents a request to list topics
type ListTopicsRequest struct {
	Page         int       `form:"page"`
	PageSize     int       `form:"page_size"`
	CourseID     *uuid.UUID `form:"course_id"`
	UniversityID *uuid.UUID `form:"university_id"`
	DepartmentID *uuid.UUID `form:"department_id"`
	Search       string    `form:"search"`
	SortBy       string    `form:"sort_by"` // "newest", "popular", "replies"
}

// ListTopics lists forum topics with filtering
func (s *ForumService) ListTopics(req ListTopicsRequest) ([]models.ForumTopic, int64, error) {
	query := database.DB.Model(&models.ForumTopic{}).
		Where("is_approved = ?", true).
		Preload("User").
		Preload("Course").
		Preload("University").
		Preload("Department")

	// Apply filters
	if req.CourseID != nil {
		query = query.Where("course_id = ?", req.CourseID)
	}
	if req.UniversityID != nil {
		query = query.Where("university_id = ?", req.UniversityID)
	}
	if req.DepartmentID != nil {
		query = query.Where("department_id = ?", req.DepartmentID)
	}
	if req.Search != "" {
		query = query.Where("title ILIKE ? OR content ILIKE ?", "%"+req.Search+"%", "%"+req.Search+"%")
	}

	// Get total count
	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count topics: %w", err)
	}

	// Apply sorting
	switch req.SortBy {
	case "popular":
		query = query.Order("upvote_count DESC, reply_count DESC")
	case "replies":
		query = query.Order("reply_count DESC, created_at DESC")
	case "pinned":
		query = query.Order("is_pinned DESC, created_at DESC")
	default:
		query = query.Order("is_pinned DESC, created_at DESC")
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

	var topics []models.ForumTopic
	if err := query.Find(&topics).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to list topics: %w", err)
	}

	return topics, total, nil
}

// CreateReplyRequest represents a request to create a reply
type CreateReplyRequest struct {
	Content  string     `json:"content" binding:"required"`
	ParentID *uuid.UUID `json:"parent_id,omitempty"`
}

// CreateReply creates a reply to a topic
func (s *ForumService) CreateReply(topicID, userID uuid.UUID, req CreateReplyRequest) (*models.ForumReply, error) {
	// Verify topic exists and is not locked
	var topic models.ForumTopic
	if err := database.DB.Where("id = ?", topicID).First(&topic).Error; err != nil {
		return nil, ErrTopicNotFound
	}

	if topic.IsLocked {
		return nil, ErrTopicLocked
	}

	reply := models.ForumReply{
		TopicID:    topicID,
		UserID:     userID,
		Content:    req.Content,
		ParentID:   req.ParentID,
		IsApproved: true,
	}

	if err := database.DB.Create(&reply).Error; err != nil {
		return nil, fmt.Errorf("failed to create reply: %w", err)
	}

	// Increment reply count on topic
	database.DB.Model(&topic).UpdateColumn("reply_count", gorm.Expr("reply_count + 1"))

	return s.GetReplyByID(reply.ID)
}

// GetReplyByID retrieves a reply by ID
func (s *ForumService) GetReplyByID(replyID uuid.UUID) (*models.ForumReply, error) {
	var reply models.ForumReply
	if err := database.DB.
		Preload("User").
		Preload("Topic").
		Preload("Replies.User").
		Where("id = ?", replyID).
		First(&reply).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrReplyNotFound
		}
		return nil, fmt.Errorf("failed to get reply: %w", err)
	}

	return &reply, nil
}

// ListReplies lists replies for a topic
func (s *ForumService) ListReplies(topicID uuid.UUID) ([]models.ForumReply, error) {
	var replies []models.ForumReply
	if err := database.DB.
		Preload("User").
		Preload("Replies.User").
		Where("topic_id = ? AND parent_id IS NULL", topicID).
		Where("is_approved = ?", true).
		Order("upvote_count DESC, created_at ASC").
		Find(&replies).Error; err != nil {
		return nil, fmt.Errorf("failed to list replies: %w", err)
	}

	return replies, nil
}

// VoteRequest represents a vote request
type VoteRequest struct {
	IsUpvote bool `json:"is_upvote"`
}

// VoteOnTopic votes on a forum topic
func (s *ForumService) VoteOnTopic(topicID, userID uuid.UUID, req VoteRequest) error {
	// Verify topic exists
	var topic models.ForumTopic
	if err := database.DB.Where("id = ?", topicID).First(&topic).Error; err != nil {
		return ErrTopicNotFound
	}

	// Check if user already voted
	var existingVote models.ForumVote
	err := database.DB.Where("user_id = ? AND votable_type = ? AND votable_id = ?", userID, "topic", topicID).First(&existingVote).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		// Create new vote
		vote := models.ForumVote{
			UserID:      userID,
			IsUpvote:    req.IsUpvote,
			VotableType: "topic",
			VotableID:   topicID,
		}
		if err := database.DB.Create(&vote).Error; err != nil {
			return fmt.Errorf("failed to create vote: %w", err)
		}

		// Update topic vote count
		if req.IsUpvote {
			database.DB.Model(&topic).UpdateColumn("upvote_count", gorm.Expr("upvote_count + 1"))
		} else {
			database.DB.Model(&topic).UpdateColumn("downvote_count", gorm.Expr("downvote_count + 1"))
		}
	} else if err == nil {
		// Update existing vote if different
		if existingVote.IsUpvote != req.IsUpvote {
			existingVote.IsUpvote = req.IsUpvote
			database.DB.Save(&existingVote)

			// Update topic vote counts
			if req.IsUpvote {
				database.DB.Model(&topic).UpdateColumn("upvote_count", gorm.Expr("upvote_count + 1"))
				database.DB.Model(&topic).UpdateColumn("downvote_count", gorm.Expr("downvote_count - 1"))
			} else {
				database.DB.Model(&topic).UpdateColumn("downvote_count", gorm.Expr("downvote_count + 1"))
				database.DB.Model(&topic).UpdateColumn("upvote_count", gorm.Expr("upvote_count - 1"))
			}
		}
	} else {
		return fmt.Errorf("failed to check vote: %w", err)
	}

	return nil
}

// VoteOnReply votes on a forum reply
func (s *ForumService) VoteOnReply(replyID, userID uuid.UUID, req VoteRequest) error {
	// Verify reply exists
	var reply models.ForumReply
	if err := database.DB.Where("id = ?", replyID).First(&reply).Error; err != nil {
		return ErrReplyNotFound
	}

	// Check if user already voted
	var existingVote models.ForumVote
	err := database.DB.Where("user_id = ? AND votable_type = ? AND votable_id = ?", userID, "reply", replyID).First(&existingVote).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		// Create new vote
		vote := models.ForumVote{
			UserID:      userID,
			IsUpvote:    req.IsUpvote,
			VotableType: "reply",
			VotableID:   replyID,
		}
		if err := database.DB.Create(&vote).Error; err != nil {
			return fmt.Errorf("failed to create vote: %w", err)
		}

		// Update reply vote count
		if req.IsUpvote {
			database.DB.Model(&reply).UpdateColumn("upvote_count", gorm.Expr("upvote_count + 1"))
		} else {
			database.DB.Model(&reply).UpdateColumn("downvote_count", gorm.Expr("downvote_count + 1"))
		}
	} else if err == nil {
		// Update existing vote if different
		if existingVote.IsUpvote != req.IsUpvote {
			existingVote.IsUpvote = req.IsUpvote
			database.DB.Save(&existingVote)

			// Update reply vote counts
			if req.IsUpvote {
				database.DB.Model(&reply).UpdateColumn("upvote_count", gorm.Expr("upvote_count + 1"))
				database.DB.Model(&reply).UpdateColumn("downvote_count", gorm.Expr("downvote_count - 1"))
			} else {
				database.DB.Model(&reply).UpdateColumn("downvote_count", gorm.Expr("downvote_count + 1"))
				database.DB.Model(&reply).UpdateColumn("upvote_count", gorm.Expr("upvote_count - 1"))
			}
		}
	} else {
		return fmt.Errorf("failed to check vote: %w", err)
	}

	return nil
}

// GetUserVote gets a user's vote on a topic or reply
func (s *ForumService) GetUserVote(userID uuid.UUID, votableType string, votableID uuid.UUID) (*models.ForumVote, error) {
	var vote models.ForumVote
	if err := database.DB.Where("user_id = ? AND votable_type = ? AND votable_id = ?", userID, votableType, votableID).First(&vote).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil // No vote yet
		}
		return nil, fmt.Errorf("failed to get vote: %w", err)
	}

	return &vote, nil
}

