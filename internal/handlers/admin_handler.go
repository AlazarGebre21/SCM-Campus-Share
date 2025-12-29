package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/campus-share/backend/internal/database"
	"github.com/campus-share/backend/internal/models"
	"github.com/campus-share/backend/internal/services"
)

// AdminHandler handles admin-related HTTP requests
type AdminHandler struct {
	reportService *services.ReportService
}

// NewAdminHandler creates a new admin handler
func NewAdminHandler() *AdminHandler {
	return &AdminHandler{
		reportService: services.NewReportService(),
	}
}

// ListReports handles listing all reports (admin only)
func (h *AdminHandler) ListReports(c *gin.Context) {
	var req services.ListReportsRequest

	// Parse query parameters
	if page := c.Query("page"); page != "" {
		if p, err := strconv.Atoi(page); err == nil {
			req.Page = p
		}
	}
	if pageSize := c.Query("page_size"); pageSize != "" {
		if ps, err := strconv.Atoi(pageSize); err == nil {
			req.PageSize = ps
		}
	}
	if status := c.Query("status"); status != "" {
		req.Status = models.ReportStatus(status)
	}
	if reportType := c.Query("type"); reportType != "" {
		req.Type = models.ReportType(reportType)
	}

	reports, total, err := h.reportService.ListReports(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"reports": reports,
		"total":   total,
		"page":    req.Page,
		"page_size": req.PageSize,
	})
}

// ApproveReport handles approving a report
func (h *AdminHandler) ApproveReport(c *gin.Context) {
	adminID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	adminIDUUID, ok := adminID.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}

	reportID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid report id"})
		return
	}

	var req services.ApproveReportRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	report, err := h.reportService.ApproveReport(reportID, adminIDUUID, req)
	if err != nil {
		if err == services.ErrReportNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"report": report})
}

// RejectReport handles rejecting a report
func (h *AdminHandler) RejectReport(c *gin.Context) {
	adminID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	adminIDUUID, ok := adminID.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}

	reportID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid report id"})
		return
	}

	var req services.RejectReportRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	report, err := h.reportService.RejectReport(reportID, adminIDUUID, req)
	if err != nil {
		if err == services.ErrReportNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"report": report})
}

// BanUser handles banning a user
func (h *AdminHandler) BanUser(c *gin.Context) {
	userID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}

	var user models.User
	if err := database.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	user.IsBanned = true
	if err := database.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to ban user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "user banned successfully",
		"user":    user,
	})
}

// UnbanUser handles unbanning a user
func (h *AdminHandler) UnbanUser(c *gin.Context) {
	userID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}

	var user models.User
	if err := database.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	user.IsBanned = false
	if err := database.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to unban user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "user unbanned successfully",
		"user":    user,
	})
}

// GetAnalytics handles getting platform analytics
func (h *AdminHandler) GetAnalytics(c *gin.Context) {
	var stats struct {
		TotalUsers        int64 `json:"total_users"`
		ActiveUsers       int64 `json:"active_users"`
		TotalResources    int64 `json:"total_resources"`
		ApprovedResources int64 `json:"approved_resources"`
		TotalDownloads    int64 `json:"total_downloads"`
		TotalViews        int64 `json:"total_views"`
		PendingReports    int64 `json:"pending_reports"`
		TotalComments     int64 `json:"total_comments"`
		TotalRatings      int64 `json:"total_ratings"`
	}

	// Get user statistics
	database.DB.Model(&models.User{}).Count(&stats.TotalUsers)
	database.DB.Model(&models.User{}).Where("is_active = ? AND is_banned = ?", true, false).Count(&stats.ActiveUsers)

	// Get resource statistics
	database.DB.Model(&models.Resource{}).Count(&stats.TotalResources)
	database.DB.Model(&models.Resource{}).Where("is_approved = ?", true).Count(&stats.ApprovedResources)
	database.DB.Model(&models.Resource{}).Select("COALESCE(SUM(download_count), 0)").Scan(&stats.TotalDownloads)
	database.DB.Model(&models.Resource{}).Select("COALESCE(SUM(view_count), 0)").Scan(&stats.TotalViews)

	// Get report statistics
	database.DB.Model(&models.Report{}).Where("status = ?", models.ReportStatusPending).Count(&stats.PendingReports)

	// Get engagement statistics
	database.DB.Model(&models.Comment{}).Count(&stats.TotalComments)
	database.DB.Model(&models.Rating{}).Count(&stats.TotalRatings)

	c.JSON(http.StatusOK, gin.H{"analytics": stats})
}

// GetPopularResources handles getting popular resources
func (h *AdminHandler) GetPopularResources(c *gin.Context) {
	limit := 10
	if l := c.Query("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 && parsed <= 50 {
			limit = parsed
		}
	}

	var resources []models.Resource
	database.DB.
		Preload("User").
		Preload("University").
		Preload("Course").
		Where("is_approved = ?", true).
		Order("download_count DESC, view_count DESC").
		Limit(limit).
		Find(&resources)

	c.JSON(http.StatusOK, gin.H{"resources": resources})
}

// GetResourceStats handles getting statistics for a specific resource
func (h *AdminHandler) GetResourceStats(c *gin.Context) {
	resourceID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid resource id"})
		return
	}

	var resource models.Resource
	if err := database.DB.Where("id = ?", resourceID).First(&resource).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "resource not found"})
		return
	}

	var stats struct {
		Resource        models.Resource `json:"resource"`
		CommentCount    int64           `json:"comment_count"`
		RatingCount     int64           `json:"rating_count"`
		AverageRating   float64         `json:"average_rating"`
		BookmarkCount   int64           `json:"bookmark_count"`
		ReportCount     int64           `json:"report_count"`
	}

	stats.Resource = resource

	database.DB.Model(&models.Comment{}).Where("resource_id = ?", resourceID).Count(&stats.CommentCount)
	database.DB.Model(&models.Rating{}).Where("resource_id = ?", resourceID).Count(&stats.RatingCount)
	database.DB.Model(&models.Bookmark{}).Where("resource_id = ?", resourceID).Count(&stats.BookmarkCount)
	database.DB.Model(&models.Report{}).Where("resource_id = ?", resourceID).Count(&stats.ReportCount)

	// Get average rating
	database.DB.Model(&models.Rating{}).
		Where("resource_id = ?", resourceID).
		Select("COALESCE(AVG(value), 0)").
		Scan(&stats.AverageRating)

	c.JSON(http.StatusOK, gin.H{"stats": stats})
}

