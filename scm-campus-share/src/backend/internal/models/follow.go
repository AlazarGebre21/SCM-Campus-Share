package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Follow represents a user following another user
type Follow struct {
	ID          uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	FollowerID uuid.UUID `gorm:"type:uuid;not null" json:"follower_id"` // User who is following
	Follower    User      `gorm:"foreignKey:FollowerID" json:"follower,omitempty"`
	FollowingID uuid.UUID `gorm:"type:uuid;not null" json:"following_id"` // User being followed
	Following   User      `gorm:"foreignKey:FollowingID" json:"following,omitempty"`
	
	CreatedAt time.Time `json:"created_at"`
}

// BeforeCreate hook to generate UUID
func (f *Follow) BeforeCreate(tx *gorm.DB) error {
	if f.ID == uuid.Nil {
		f.ID = uuid.New()
	}
	return nil
}

// TableName specifies the table name
func (Follow) TableName() string {
	return "follows"
}

