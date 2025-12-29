package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/campus-share/backend/internal/services"
)

// ForumHandler handles forum-related HTTP requests
type ForumHandler struct {
	forumService *services.ForumService
}

// NewForumHandler creates a new forum handler
func NewForumHandler() *ForumHandler {
	return &ForumHandler{
		forumService: services.NewForumService(),
	}
}

// CreateTopic handles creating a forum topic
func (h *ForumHandler) CreateTopic(c *gin.Context) {
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

	var req services.CreateTopicRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	topic, err := h.forumService.CreateTopic(userIDUUID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"topic": topic})
}

// GetTopic handles getting a single topic
func (h *ForumHandler) GetTopic(c *gin.Context) {
	topicID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid topic id"})
		return
	}

	topic, err := h.forumService.GetTopicByID(topicID)
	if err != nil {
		if err == services.ErrTopicNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"topic": topic})
}

// ListTopics handles listing forum topics
func (h *ForumHandler) ListTopics(c *gin.Context) {
	var req services.ListTopicsRequest

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
	req.SortBy = c.Query("sort_by")

	if courseID := c.Query("course_id"); courseID != "" {
		if id, err := uuid.Parse(courseID); err == nil {
			req.CourseID = &id
		}
	}
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

	topics, total, err := h.forumService.ListTopics(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"topics":   topics,
		"total":    total,
		"page":     req.Page,
		"page_size": req.PageSize,
	})
}

// CreateReply handles creating a reply to a topic
func (h *ForumHandler) CreateReply(c *gin.Context) {
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

	topicID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid topic id"})
		return
	}

	var req services.CreateReplyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	reply, err := h.forumService.CreateReply(topicID, userIDUUID, req)
	if err != nil {
		if err == services.ErrTopicNotFound || err == services.ErrTopicLocked {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"reply": reply})
}

// ListReplies handles listing replies for a topic
func (h *ForumHandler) ListReplies(c *gin.Context) {
	topicID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid topic id"})
		return
	}

	replies, err := h.forumService.ListReplies(topicID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"replies": replies})
}

// VoteOnTopic handles voting on a topic
func (h *ForumHandler) VoteOnTopic(c *gin.Context) {
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

	topicID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid topic id"})
		return
	}

	var req services.VoteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.forumService.VoteOnTopic(topicID, userIDUUID, req); err != nil {
		if err == services.ErrTopicNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "vote recorded successfully"})
}

// VoteOnReply handles voting on a reply
func (h *ForumHandler) VoteOnReply(c *gin.Context) {
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

	replyID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid reply id"})
		return
	}

	var req services.VoteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.forumService.VoteOnReply(replyID, userIDUUID, req); err != nil {
		if err == services.ErrReplyNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "vote recorded successfully"})
}

