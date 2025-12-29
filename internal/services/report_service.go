package services

import (
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/campus-share/backend/internal/database"
	"github.com/campus-share/backend/internal/models"
)

var (
	ErrReportNotFound = errors.New("report not found")
)

// ReportService handles report-related operations
type ReportService struct{}

// NewReportService creates a new report service
func NewReportService() *ReportService {
	return &ReportService{}
}

// CreateReportRequest represents a request to create a report
type CreateReportRequest struct {
	Type   models.ReportType `json:"type" binding:"required"`
	Reason string            `json:"reason" binding:"required"`
}

// CreateReport creates a new report
func (s *ReportService) CreateReport(resourceID, userID uuid.UUID, req CreateReportRequest) (*models.Report, error) {
	// Verify resource exists
	var resource models.Resource
	if err := database.DB.Where("id = ?", resourceID).First(&resource).Error; err != nil {
		return nil, ErrResourceNotFound
	}

	// Check if user already reported this resource
	var existingReport models.Report
	if err := database.DB.Where("resource_id = ? AND user_id = ?", resourceID, userID).First(&existingReport).Error; err == nil {
		return nil, errors.New("you have already reported this resource")
	}

	report := models.Report{
		ResourceID: resourceID,
		UserID:      userID,
		Type:        req.Type,
		Reason:      req.Reason,
		Status:      models.ReportStatusPending,
	}

	if err := database.DB.Create(&report).Error; err != nil {
		return nil, fmt.Errorf("failed to create report: %w", err)
	}

	return s.GetReportByID(report.ID)
}

// GetReportByID retrieves a report by ID
func (s *ReportService) GetReportByID(reportID uuid.UUID) (*models.Report, error) {
	var report models.Report
	if err := database.DB.
		Preload("Resource.User").
		Preload("Resource.University").
		Preload("Resource.Course").
		Preload("User").
		Where("id = ?", reportID).
		First(&report).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrReportNotFound
		}
		return nil, fmt.Errorf("failed to get report: %w", err)
	}

	return &report, nil
}

// ListReportsRequest represents a request to list reports
type ListReportsRequest struct {
	Page     int                  `form:"page"`
	PageSize int                  `form:"page_size"`
	Status   models.ReportStatus  `form:"status"`
	Type     models.ReportType    `form:"type"`
}

// ListReports lists reports with filtering
func (s *ReportService) ListReports(req ListReportsRequest) ([]models.Report, int64, error) {
	query := database.DB.Model(&models.Report{}).
		Preload("Resource.User").
		Preload("Resource.University").
		Preload("Resource.Course").
		Preload("User")

	// Apply filters
	if req.Status != "" {
		query = query.Where("status = ?", req.Status)
	}

	if req.Type != "" {
		query = query.Where("type = ?", req.Type)
	}

	// Get total count
	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count reports: %w", err)
	}

	// Apply pagination
	if req.PageSize <= 0 {
		req.PageSize = 20
	}
	if req.Page <= 0 {
		req.Page = 1
	}
	offset := (req.Page - 1) * req.PageSize
	query = query.Offset(offset).Limit(req.PageSize)

	// Order by created date (newest first)
	query = query.Order("created_at DESC")

	var reports []models.Report
	if err := query.Find(&reports).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to list reports: %w", err)
	}

	return reports, total, nil
}

// ApproveReportRequest represents a request to approve a report
type ApproveReportRequest struct {
	AdminNotes string `json:"admin_notes,omitempty"`
}

// ApproveReport approves a report and optionally takes action
func (s *ReportService) ApproveReport(reportID, adminID uuid.UUID, req ApproveReportRequest) (*models.Report, error) {
	var report models.Report
	if err := database.DB.Where("id = ?", reportID).First(&report).Error; err != nil {
		return nil, ErrReportNotFound
	}

	now := time.Now()
	report.Status = models.ReportStatusApproved
	report.ReviewedBy = &adminID
	report.ReviewedAt = &now
	report.AdminNotes = req.AdminNotes

	// Optionally mark resource as not approved
	if err := database.DB.Model(&models.Resource{}).
		Where("id = ?", report.ResourceID).
		Update("is_approved", false).Error; err != nil {
		// Log error but continue
		fmt.Printf("Warning: failed to mark resource as not approved: %v\n", err)
	}

	if err := database.DB.Save(&report).Error; err != nil {
		return nil, fmt.Errorf("failed to approve report: %w", err)
	}

	return s.GetReportByID(reportID)
}

// RejectReportRequest represents a request to reject a report
type RejectReportRequest struct {
	AdminNotes string `json:"admin_notes,omitempty"`
}

// RejectReport rejects a report
func (s *ReportService) RejectReport(reportID, adminID uuid.UUID, req RejectReportRequest) (*models.Report, error) {
	var report models.Report
	if err := database.DB.Where("id = ?", reportID).First(&report).Error; err != nil {
		return nil, ErrReportNotFound
	}

	now := time.Now()
	report.Status = models.ReportStatusRejected
	report.ReviewedBy = &adminID
	report.ReviewedAt = &now
	report.AdminNotes = req.AdminNotes

	if err := database.DB.Save(&report).Error; err != nil {
		return nil, fmt.Errorf("failed to reject report: %w", err)
	}

	return s.GetReportByID(reportID)
}

