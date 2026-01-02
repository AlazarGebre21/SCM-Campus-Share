package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ForumTopic represents a discussion topic/thread
type ForumTopic struct {
	ID          uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Title       string    `gorm:"not null" json:"title"`
	Content     string    `gorm:"type:text;not null" json:"content"`
	
	// Topic categorization
	CourseID     *uuid.UUID `gorm:"type:uuid" json:"course_id,omitempty"`
	Course       *Course    `gorm:"foreignKey:CourseID" json:"course,omitempty"`
	UniversityID *uuid.UUID `gorm:"type:uuid" json:"university_id,omitempty"`
	University   *University `gorm:"foreignKey:UniversityID" json:"university,omitempty"`
	DepartmentID *uuid.UUID `gorm:"type:uuid" json:"department_id,omitempty"`
	Department   *Department `gorm:"foreignKey:DepartmentID" json:"department,omitempty"`
	
	// Author
	UserID uuid.UUID `gorm:"type:uuid;not null" json:"user_id"`
	User   User      `gorm:"foreignKey:UserID" json:"user,omitempty"`
	
	// Statistics
	ViewCount    int `gorm:"default:0" json:"view_count"`
	ReplyCount   int `gorm:"default:0" json:"reply_count"`
	UpvoteCount  int `gorm:"default:0" json:"upvote_count"`
	DownvoteCount int `gorm:"default:0" json:"downvote_count"`
	
	// Moderation
	IsPinned   bool `gorm:"default:false" json:"is_pinned"`
	IsLocked   bool `gorm:"default:false" json:"is_locked"`
	IsApproved bool `gorm:"default:true" json:"is_approved"`
	
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Replies []ForumReply `gorm:"foreignKey:TopicID" json:"replies,omitempty"`
}

// BeforeCreate hook to generate UUID
func (ft *ForumTopic) BeforeCreate(tx *gorm.DB) error {
	if ft.ID == uuid.Nil {
		ft.ID = uuid.New()
	}
	return nil
}

// TableName specifies the table name
func (ForumTopic) TableName() string {
	return "forum_topics"
}

// ForumReply represents a reply to a forum topic
type ForumReply struct {
	ID      uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Content string    `gorm:"type:text;not null" json:"content"`
	
	// Topic this reply belongs to
	TopicID uuid.UUID `gorm:"type:uuid;not null" json:"topic_id"`
	Topic   ForumTopic `gorm:"foreignKey:TopicID" json:"topic,omitempty"`
	
	// Author
	UserID uuid.UUID `gorm:"type:uuid;not null" json:"user_id"`
	User   User      `gorm:"foreignKey:UserID" json:"user,omitempty"`
	
	// Parent reply for nested replies
	ParentID *uuid.UUID `gorm:"type:uuid" json:"parent_id,omitempty"`
	Parent   *ForumReply `gorm:"foreignKey:ParentID" json:"-"`
	
	// Statistics
	UpvoteCount   int `gorm:"default:0" json:"upvote_count"`
	DownvoteCount int `gorm:"default:0" json:"downvote_count"`
	
	// Moderation
	IsApproved bool `gorm:"default:true" json:"is_approved"`
	
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Replies []ForumReply `gorm:"foreignKey:ParentID" json:"replies,omitempty"`
}

// BeforeCreate hook to generate UUID
func (fr *ForumReply) BeforeCreate(tx *gorm.DB) error {
	if fr.ID == uuid.Nil {
		fr.ID = uuid.New()
	}
	return nil
}

// TableName specifies the table name
func (ForumReply) TableName() string {
	return "forum_replies"
}

// ForumVote represents a vote (upvote/downvote) on a topic or reply
type ForumVote struct {
	ID     uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID uuid.UUID `gorm:"type:uuid;not null" json:"user_id"`
	User   User      `gorm:"foreignKey:UserID" json:"-"`
	
	// Vote type: true = upvote, false = downvote
	IsUpvote bool `gorm:"not null" json:"is_upvote"`
	
	// Polymorphic association - can vote on topic or reply
	VotableType string    `gorm:"type:varchar(20);not null" json:"votable_type"` // "topic" or "reply"
	VotableID   uuid.UUID `gorm:"type:uuid;not null" json:"votable_id"`
	
	CreatedAt time.Time `json:"created_at"`
}

// BeforeCreate hook to generate UUID
func (fv *ForumVote) BeforeCreate(tx *gorm.DB) error {
	if fv.ID == uuid.Nil {
		fv.ID = uuid.New()
	}
	return nil
}

// TableName specifies the table name
func (ForumVote) TableName() string {
	return "forum_votes"
}

