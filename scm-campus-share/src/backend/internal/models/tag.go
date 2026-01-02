package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Tag represents a tag for categorizing resources
type Tag struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Name      string    `gorm:"uniqueIndex;not null" json:"name"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// Relationships
	Resources []ResourceTag `gorm:"foreignKey:TagID" json:"-"`
}

// BeforeCreate hook to generate UUID
func (t *Tag) BeforeCreate(tx *gorm.DB) error {
	if t.ID == uuid.Nil {
		t.ID = uuid.New()
	}
	return nil
}

// TableName specifies the table name
func (Tag) TableName() string {
	return "tags"
}

// ResourceTag represents the many-to-many relationship between resources and tags
type ResourceTag struct {
	ID         uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	ResourceID uuid.UUID `gorm:"type:uuid;not null" json:"resource_id"`
	Resource   Resource  `gorm:"foreignKey:ResourceID" json:"-"`
	TagID      uuid.UUID `gorm:"type:uuid;not null" json:"tag_id"`
	Tag        Tag       `gorm:"foreignKey:TagID" json:"tag,omitempty"`
	
	CreatedAt time.Time `json:"created_at"`
}

// BeforeCreate hook to generate UUID
func (rt *ResourceTag) BeforeCreate(tx *gorm.DB) error {
	if rt.ID == uuid.Nil {
		rt.ID = uuid.New()
	}
	return nil
}

// TableName specifies the table name
func (ResourceTag) TableName() string {
	return "resource_tags"
}


