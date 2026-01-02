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
	ErrCannotFollowSelf = errors.New("cannot follow yourself")
	ErrAlreadyFollowing = errors.New("already following this user")
	ErrNotFollowing     = errors.New("not following this user")
)

// FollowService handles user following operations
type FollowService struct{}

// NewFollowService creates a new follow service
func NewFollowService() *FollowService {
	return &FollowService{}
}

// FollowUser creates a follow relationship
func (s *FollowService) FollowUser(followerID, followingID uuid.UUID) (*models.Follow, error) {
	// Check if trying to follow self
	if followerID == followingID {
		return nil, ErrCannotFollowSelf
	}

	// Verify following user exists
	var followingUser models.User
	if err := database.DB.Where("id = ?", followingID).First(&followingUser).Error; err != nil {
		return nil, ErrUserNotFound
	}

	// Check if already following
	var existingFollow models.Follow
	if err := database.DB.Where("follower_id = ? AND following_id = ?", followerID, followingID).First(&existingFollow).Error; err == nil {
		return nil, ErrAlreadyFollowing
	}

	follow := models.Follow{
		FollowerID:  followerID,
		FollowingID: followingID,
	}

	if err := database.DB.Create(&follow).Error; err != nil {
		return nil, fmt.Errorf("failed to follow user: %w", err)
	}

	return s.GetFollowByID(follow.ID)
}

// UnfollowUser removes a follow relationship
func (s *FollowService) UnfollowUser(followerID, followingID uuid.UUID) error {
	var follow models.Follow
	if err := database.DB.Where("follower_id = ? AND following_id = ?", followerID, followingID).First(&follow).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrNotFollowing
		}
		return fmt.Errorf("failed to check follow: %w", err)
	}

	if err := database.DB.Delete(&follow).Error; err != nil {
		return fmt.Errorf("failed to unfollow user: %w", err)
	}

	return nil
}

// GetFollowByID retrieves a follow by ID
func (s *FollowService) GetFollowByID(followID uuid.UUID) (*models.Follow, error) {
	var follow models.Follow
	if err := database.DB.
		Preload("Follower").
		Preload("Following").
		Where("id = ?", followID).
		First(&follow).Error; err != nil {
		return nil, fmt.Errorf("follow not found: %w", err)
	}

	return &follow, nil
}

// GetFollowers gets users who follow a specific user
func (s *FollowService) GetFollowers(userID uuid.UUID, page, pageSize int) ([]models.User, int64, error) {
	if pageSize <= 0 {
		pageSize = 20
	}
	if page <= 0 {
		page = 1
	}

	query := database.DB.Model(&models.Follow{}).
		Where("following_id = ?", userID).
		Preload("Follower")

	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count followers: %w", err)
	}

	var follows []models.Follow
	offset := (page - 1) * pageSize
	if err := query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&follows).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to get followers: %w", err)
	}

	followers := make([]models.User, len(follows))
	for i, follow := range follows {
		followers[i] = follow.Follower
	}

	return followers, total, nil
}

// GetFollowing gets users that a specific user is following
func (s *FollowService) GetFollowing(userID uuid.UUID, page, pageSize int) ([]models.User, int64, error) {
	if pageSize <= 0 {
		pageSize = 20
	}
	if page <= 0 {
		page = 1
	}

	query := database.DB.Model(&models.Follow{}).
		Where("follower_id = ?", userID).
		Preload("Following")

	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count following: %w", err)
	}

	var follows []models.Follow
	offset := (page - 1) * pageSize
	if err := query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&follows).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to get following: %w", err)
	}

	following := make([]models.User, len(follows))
	for i, follow := range follows {
		following[i] = follow.Following
	}

	return following, total, nil
}

// IsFollowing checks if one user is following another
func (s *FollowService) IsFollowing(followerID, followingID uuid.UUID) (bool, error) {
	var count int64
	if err := database.DB.Model(&models.Follow{}).
		Where("follower_id = ? AND following_id = ?", followerID, followingID).
		Count(&count).Error; err != nil {
		return false, fmt.Errorf("failed to check follow: %w", err)
	}

	return count > 0, nil
}

// GetActivityFeed gets resources from users that the current user follows
func (s *FollowService) GetActivityFeed(userID uuid.UUID, page, pageSize int) ([]models.Resource, int64, error) {
	if pageSize <= 0 {
		pageSize = 20
	}
	if page <= 0 {
		page = 1
	}

	// Get list of user IDs that the current user follows
	var follows []models.Follow
	if err := database.DB.Where("follower_id = ?", userID).Find(&follows).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to get following list: %w", err)
	}

	if len(follows) == 0 {
		return []models.Resource{}, 0, nil
	}

	followingIDs := make([]uuid.UUID, len(follows))
	for i, follow := range follows {
		followingIDs[i] = follow.FollowingID
	}

	query := database.DB.Model(&models.Resource{}).
		Where("user_id IN ? AND is_approved = ?", followingIDs, true).
		Preload("User").
		Preload("University").
		Preload("Course").
		Preload("Tags.Tag")

	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count resources: %w", err)
	}

	var resources []models.Resource
	offset := (page - 1) * pageSize
	if err := query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&resources).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to get activity feed: %w", err)
	}

	return resources, total, nil
}

