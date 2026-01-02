package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/campus-share/backend/internal/config"
	"github.com/campus-share/backend/internal/models"
	"github.com/campus-share/backend/internal/services"
	"github.com/campus-share/backend/internal/storage"
)

// ResourceHandler handles resource-related HTTP requests
type ResourceHandler struct {
	resourceService *services.ResourceService
	config          *config.Config
}

// NewResourceHandler creates a new resource handler
func NewResourceHandler(cfg *config.Config) (*ResourceHandler, error) {
	s3Storage, err := storage.NewS3Storage(&cfg.AWS)
	if err != nil {
		return nil, err
	}

	// If S3 is not configured, create a service with nil storage
	// This will cause errors when trying to upload, but allows server to start
	resourceService := services.NewResourceService(s3Storage)

	return &ResourceHandler{
		resourceService: resourceService,
		config:          cfg,
	}, nil
}

// CreateResource handles resource creation
func (h *ResourceHandler) CreateResource(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	userIDUUID, ok := userID.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}

	// Get file from form
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file is required"})
		return
	}

	var req services.CreateResourceRequest
	req.File = *file

	// Parse other fields from form
	req.Title = c.PostForm("title")
	req.Description = c.PostForm("description")
	req.Type = models.ResourceType(c.PostForm("type"))

	if c.PostForm("university_id") != "" {
		univID, err := uuid.Parse(c.PostForm("university_id"))
		if err == nil {
			req.UniversityID = &univID
		}
	}

	if c.PostForm("department_id") != "" {
		deptID, err := uuid.Parse(c.PostForm("department_id"))
		if err == nil {
			req.DepartmentID = &deptID
		}
	}

	if c.PostForm("course_id") != "" {
		courseID, err := uuid.Parse(c.PostForm("course_id"))
		if err == nil {
			req.CourseID = &courseID
		}
	}

	if c.PostForm("sharing_level") != "" {
		req.SharingLevel = models.SharingLevel(c.PostForm("sharing_level"))
	}

	resource, err := h.resourceService.CreateResource(
		userIDUUID,
		req,
		int64(h.config.Upload.MaxFileSizeMB),
		h.config.Upload.AllowedFileTypes,
	)
	if err != nil {
		if err == services.ErrFileTooLarge || err == services.ErrInvalidFileType {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"resource": resource})
}

// GetResource handles getting a single resource
func (h *ResourceHandler) GetResource(c *gin.Context) {
	resourceID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid resource id"})
		return
	}

	resource, err := h.resourceService.GetResourceByID(resourceID)
	if err != nil {
		if err == services.ErrResourceNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"resource": resource})
}

// ListResources handles listing resources with filters
func (h *ResourceHandler) ListResources(c *gin.Context) {
	var req services.ListResourcesRequest

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
	req.Search = c.Query("search")
	req.Type = c.Query("type")
	req.Tag = c.Query("tag")
	req.SortBy = c.Query("sort_by")

	if univID := c.Query("university_id"); univID != "" {
		if id, err := uuid.Parse(univID); err == nil {
			req.UniversityID = &id
		}
	}
	if deptID := c.Query("department_id"); deptID != "" {
		if id, err := uuid.Parse(deptID); err == nil {
			req.DepartmentID = &id
		}
	}
	if courseID := c.Query("course_id"); courseID != "" {
		if id, err := uuid.Parse(courseID); err == nil {
			req.CourseID = &id
		}
	}

	var userID *uuid.UUID
	if uid, exists := c.Get("user_id"); exists {
		if uidUUID, ok := uid.(uuid.UUID); ok {
			userID = &uidUUID
		}
	}

	resources, total, err := h.resourceService.ListResources(req, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"resources": resources,
		"total":     total,
		"page":      req.Page,
		"page_size": req.PageSize,
	})
}

// UpdateResource handles updating a resource
func (h *ResourceHandler) UpdateResource(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	userIDUUID, ok := userID.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}

	resourceID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid resource id"})
		return
	}

	var req services.UpdateResourceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	resource, err := h.resourceService.UpdateResource(resourceID, userIDUUID, req)
	if err != nil {
		if err == services.ErrResourceNotFound || err == services.ErrUnauthorized {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"resource": resource})
}

// DeleteResource handles deleting a resource
func (h *ResourceHandler) DeleteResource(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	userIDUUID, ok := userID.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}

	role, _ := c.Get("user_role")
	isAdmin := role == "admin" || role == "moderator"

	resourceID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid resource id"})
		return
	}

	if err := h.resourceService.DeleteResource(resourceID, userIDUUID, isAdmin); err != nil {
		if err == services.ErrResourceNotFound || err == services.ErrUnauthorized {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "resource deleted successfully"})
}

// DownloadResource handles resource download
func (h *ResourceHandler) DownloadResource(c *gin.Context) {
	resourceID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid resource id"})
		return
	}

	url, err := h.resourceService.DownloadResource(resourceID)
	if err != nil {
		if err == services.ErrResourceNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"download_url": url})
}

