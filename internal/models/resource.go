package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ResourceType represents the type of resource
type ResourceType string

const (
	ResourceTypeNotes      ResourceType = "notes"
	ResourceTypeSlides     ResourceType = "slides"
	ResourceTypeTextbook   ResourceType = "textbook"
	ResourceTypeAssignment ResourceType = "assignment"
	ResourceTypeExam       ResourceType = "exam"
	ResourceTypeVideo      ResourceType = "video"
	ResourceTypeOther      ResourceType = "other"
)

// SharingLevel represents the sharing level of a resource
type SharingLevel string

const (
	SharingLevelPublic      SharingLevel = "public"       // Available to all universities
	SharingLevelUniversity  SharingLevel = "university"   // Only for same university
	SharingLevelCourse      SharingLevel = "course"       // Only for same course
)

// Resource represents an academic resource
type Resource struct {
	ID          uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID      uuid.UUID `gorm:"type:uuid;not null" json:"user_id"`
	User        User      `gorm:"foreignKey:UserID" json:"user,omitempty"`
	
	Title       string        `gorm:"not null" json:"title"`
	Description string        `gorm:"type:text" json:"description,omitempty"`
	Type        ResourceType  `gorm:"type:varchar(20);not null" json:"type"`
	
	// File information
	FileName    string `gorm:"not null" json:"file_name"`
	FileSize    int64  `gorm:"not null" json:"file_size"` // in bytes
	FileType    string `gorm:"not null" json:"file_type"` // MIME type
	S3Key       string `gorm:"not null" json:"-"`         // S3 object key
	S3URL       string `json:"s3_url,omitempty"`          // Pre-signed URL for download
	
	// Categorization
	UniversityID *uuid.UUID `gorm:"type:uuid" json:"university_id,omitempty"`
	University   *University `gorm:"foreignKey:UniversityID" json:"university,omitempty"`
	DepartmentID *uuid.UUID `gorm:"type:uuid" json:"department_id,omitempty"`
	Department   *Department `gorm:"foreignKey:DepartmentID" json:"department,omitempty"`
	CourseID     *uuid.UUID `gorm:"type:uuid" json:"course_id,omitempty"`
	Course       *Course    `gorm:"foreignKey:CourseID" json:"course,omitempty"`
	
	// Sharing and access
	SharingLevel SharingLevel `gorm:"type:varchar(20);default:'public'" json:"sharing_level"`
	IsApproved   bool         `gorm:"default:true" json:"is_approved"`
	
	// Statistics
	DownloadCount int `gorm:"default:0" json:"download_count"`
	ViewCount     int `gorm:"default:0" json:"view_count"`
	
	// Timestamps
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Comments []Comment `gorm:"foreignKey:ResourceID" json:"comments,omitempty"`
	Ratings  []Rating  `gorm:"foreignKey:ResourceID" json:"ratings,omitempty"`
	Tags     []ResourceTag `gorm:"foreignKey:ResourceID" json:"tags,omitempty"`
}

// BeforeCreate hook to generate UUID
func (r *Resource) BeforeCreate(tx *gorm.DB) error {
	if r.ID == uuid.Nil {
		r.ID = uuid.New()
	}
	return nil
}

// TableName specifies the table name
func (Resource) TableName() string {
	return "resources"
}


