package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// UserRole represents the role of a user
type UserRole string

const (
	RoleStudent UserRole = "student"
	RoleAdmin   UserRole = "admin"
	RoleModerator UserRole = "moderator"
)

// User represents a user in the system
type User struct {
	ID           uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Email        string    `gorm:"uniqueIndex;not null" json:"email"`
	StudentID    string    `gorm:"uniqueIndex" json:"student_id,omitempty"`
	PasswordHash string    `gorm:"not null" json:"-"`
	FirstName    string    `gorm:"not null" json:"first_name"`
	LastName     string    `gorm:"not null" json:"last_name"`
	Role         UserRole  `gorm:"type:varchar(20);default:'student'" json:"role"`
	IsActive     bool      `gorm:"default:true" json:"is_active"`
	IsBanned     bool      `gorm:"default:false" json:"is_banned"`
	
	// Profile information
	UniversityID *uuid.UUID `gorm:"type:uuid" json:"university_id,omitempty"`
	University   *University `gorm:"foreignKey:UniversityID" json:"university,omitempty"`
	DepartmentID *uuid.UUID `gorm:"type:uuid" json:"department_id,omitempty"`
	Department   *Department `gorm:"foreignKey:DepartmentID" json:"department,omitempty"`
	Year         int         `gorm:"default:1" json:"year,omitempty"`
	Major        string      `json:"major,omitempty"`
	
	// OAuth
	GoogleID string `gorm:"uniqueIndex" json:"-"`
	
	// Timestamps
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Resources []Resource `gorm:"foreignKey:UserID" json:"-"`
	Comments  []Comment  `gorm:"foreignKey:UserID" json:"-"`
	Ratings   []Rating   `gorm:"foreignKey:UserID" json:"-"`
	Bookmarks []Bookmark `gorm:"foreignKey:UserID" json:"-"`
}

// BeforeCreate hook to generate UUID
func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return nil
}

// TableName specifies the table name
func (User) TableName() string {
	return "users"
}


