package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/campus-share/backend/internal/services"
)

// RecommendationHandler handles recommendation-related HTTP requests
type RecommendationHandler struct {
	recommendationService *services.RecommendationService
}

// NewRecommendationHandler creates a new recommendation handler
func NewRecommendationHandler() *RecommendationHandler {
	return &RecommendationHandler{
		recommendationService: services.NewRecommendationService(),
	}
}

// GetSimilarResources handles getting similar resources
func (h *RecommendationHandler) GetSimilarResources(c *gin.Context) {
	resourceID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid resource id"})
		return
	}

	limit := 5
	if l := c.Query("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 && parsed <= 20 {
			limit = parsed
		}
	}

	resources, err := h.recommendationService.GetSimilarResources(resourceID, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"resources": resources})
}

// GetRecommendedForUser handles getting recommendations for current user
func (h *RecommendationHandler) GetRecommendedForUser(c *gin.Context) {
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

	limit := 10
	if l := c.Query("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 && parsed <= 50 {
			limit = parsed
		}
	}

	resources, err := h.recommendationService.GetRecommendedForUser(userIDUUID, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"resources": resources})
}

