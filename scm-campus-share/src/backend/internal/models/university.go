package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// University represents a university
type University struct {
	ID          uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Name        string    `gorm:"uniqueIndex;not null" json:"name"`
	Code        string    `gorm:"uniqueIndex;not null" json:"code"`
	Country     string    `json:"country"`
	City        string    `json:"city"`
	Website     string    `json:"website,omitempty"`
	Description string    `gorm:"type:text" json:"description,omitempty"`
	
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Departments []Department `gorm:"foreignKey:UniversityID" json:"departments,omitempty"`
	Users       []User       `gorm:"foreignKey:UniversityID" json:"-"`
}

// BeforeCreate hook to generate UUID
func (u *University) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return nil
}

// TableName specifies the table name
func (University) TableName() string {
	return "universities"
}


