package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Department represents a department within a university
type Department struct {
	ID           uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UniversityID uuid.UUID `gorm:"type:uuid;not null" json:"university_id"`
	University   University `gorm:"foreignKey:UniversityID" json:"university,omitempty"`
	Name         string    `gorm:"not null" json:"name"`
	Code         string    `gorm:"not null" json:"code"`
	Description  string    `gorm:"type:text" json:"description,omitempty"`
	
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Courses []Course `gorm:"foreignKey:DepartmentID" json:"courses,omitempty"`
	Users   []User   `gorm:"foreignKey:DepartmentID" json:"-"`
}

// BeforeCreate hook to generate UUID
func (d *Department) BeforeCreate(tx *gorm.DB) error {
	if d.ID == uuid.Nil {
		d.ID = uuid.New()
	}
	return nil
}

// TableName specifies the table name
func (Department) TableName() string {
	return "departments"
}


