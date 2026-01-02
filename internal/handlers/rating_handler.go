package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/campus-share/backend/internal/models"
	"github.com/campus-share/backend/internal/services"
)

// RatingHandler handles rating-related HTTP requests
type RatingHandler struct {
	ratingService *services.RatingService
}

// NewRatingHandler creates a new rating handler
func NewRatingHandler() *RatingHandler {
	return &RatingHandler{
		ratingService: services.NewRatingService(),
	}
}

// CreateRating handles rating creation/update
func (h *RatingHandler) CreateRating(c *gin.Context) {
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

	var req services.CreateRatingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	rating, err := h.ratingService.CreateOrUpdateRating(resourceID, userIDUUID, req)
	if err != nil {
		if err == services.ErrResourceNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"rating": rating})
}

// GetRating handles getting rating for a resource
func (h *RatingHandler) GetRating(c *gin.Context) {
	resourceID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid resource id"})
		return
	}

	average, count, err := h.ratingService.GetResourceRating(resourceID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var userRating *models.Rating
	if uid, exists := c.Get("user_id"); exists {
		if uidUUID, ok := uid.(uuid.UUID); ok {
			rating, _ := h.ratingService.GetUserRating(resourceID, uidUUID)
			userRating = rating
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"average":     average,
		"count":       count,
		"user_rating": userRating,
	})
}

