package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ReportStatus represents the status of a report
type ReportStatus string

const (
	ReportStatusPending  ReportStatus = "pending"
	ReportStatusApproved ReportStatus = "approved"
	ReportStatusRejected ReportStatus = "rejected"
)

// ReportType represents the type of report
type ReportType string

const (
	ReportTypeInappropriate ReportType = "inappropriate"
	ReportTypeCopyright     ReportType = "copyright"
	ReportTypeSpam          ReportType = "spam"
	ReportTypeOther         ReportType = "other"
)

// Report represents a report of inappropriate content
type Report struct {
	ID         uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	ResourceID uuid.UUID `gorm:"type:uuid;not null" json:"resource_id"`
	Resource   Resource  `gorm:"foreignKey:ResourceID" json:"resource,omitempty"`
	UserID     uuid.UUID `gorm:"type:uuid;not null" json:"user_id"` // Reporter
	User       User      `gorm:"foreignKey:UserID" json:"user,omitempty"`
	
	Type        ReportType   `gorm:"type:varchar(20);not null" json:"type"`
	Reason      string       `gorm:"type:text;not null" json:"reason"`
	Status      ReportStatus `gorm:"type:varchar(20);default:'pending'" json:"status"`
	
	// Admin who handled the report
	ReviewedBy  *uuid.UUID `gorm:"type:uuid" json:"reviewed_by,omitempty"`
	ReviewedAt  *time.Time `json:"reviewed_at,omitempty"`
	AdminNotes  string     `gorm:"type:text" json:"admin_notes,omitempty"`
	
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// BeforeCreate hook to generate UUID
func (r *Report) BeforeCreate(tx *gorm.DB) error {
	if r.ID == uuid.Nil {
		r.ID = uuid.New()
	}
	return nil
}

// TableName specifies the table name
func (Report) TableName() string {
	return "reports"
}


