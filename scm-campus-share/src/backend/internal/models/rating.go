package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Rating represents a user's rating of a resource
type Rating struct {
	ID         uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	ResourceID uuid.UUID `gorm:"type:uuid;not null" json:"resource_id"`
	Resource   Resource  `gorm:"foreignKey:ResourceID" json:"-"`
	UserID     uuid.UUID `gorm:"type:uuid;not null" json:"user_id"`
	User       User      `gorm:"foreignKey:UserID" json:"-"`
	
	// Rating value: 1 (downvote) or 2 (upvote), or use 1-5 scale
	Value int `gorm:"not null;check:value >= 1 AND value <= 5" json:"value"`
	
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	// Unique constraint: one rating per user per resource
	// This is enforced at the application level or via unique index
}

// BeforeCreate hook to generate UUID
func (r *Rating) BeforeCreate(tx *gorm.DB) error {
	if r.ID == uuid.Nil {
		r.ID = uuid.New()
	}
	return nil
}

// TableName specifies the table name
func (Rating) TableName() string {
	return "ratings"
}


