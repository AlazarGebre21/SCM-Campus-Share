package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Course represents a course
type Course struct {
	ID           uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UniversityID uuid.UUID `gorm:"type:uuid;not null" json:"university_id"`
	University   University `gorm:"foreignKey:UniversityID" json:"university,omitempty"`
	DepartmentID uuid.UUID `gorm:"type:uuid;not null" json:"department_id"`
	Department   Department `gorm:"foreignKey:DepartmentID" json:"department,omitempty"`
	Name         string    `gorm:"not null" json:"name"`
	Code         string    `gorm:"not null" json:"code"`
	Description  string    `gorm:"type:text" json:"description,omitempty"`
	Credits      int       `json:"credits,omitempty"`
	
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Resources []Resource `gorm:"foreignKey:CourseID" json:"-"`
}

// BeforeCreate hook to generate UUID
func (c *Course) BeforeCreate(tx *gorm.DB) error {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	return nil
}

// TableName specifies the table name
func (Course) TableName() string {
	return "courses"
}


