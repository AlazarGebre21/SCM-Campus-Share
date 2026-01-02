package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Comment represents a comment on a resource
type Comment struct {
	ID         uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	ResourceID uuid.UUID `gorm:"type:uuid;not null" json:"resource_id"`
	Resource   Resource  `gorm:"foreignKey:ResourceID" json:"-"`
	UserID     uuid.UUID `gorm:"type:uuid;not null" json:"user_id"`
	User       User      `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Content    string    `gorm:"type:text;not null" json:"content"`
	
	// Parent comment for nested comments
	ParentID *uuid.UUID `gorm:"type:uuid" json:"parent_id,omitempty"`
	Parent   *Comment   `gorm:"foreignKey:ParentID" json:"-"`
	
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Replies []Comment `gorm:"foreignKey:ParentID" json:"replies,omitempty"`
}

// BeforeCreate hook to generate UUID
func (c *Comment) BeforeCreate(tx *gorm.DB) error {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	return nil
}

// TableName specifies the table name
func (Comment) TableName() string {
	return "comments"
}


