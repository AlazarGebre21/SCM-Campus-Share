# New Features API Integration Guide

This guide provides comprehensive documentation for all the new features added to the Campus Share backend API beyond basic CRUD operations.

## Table of Contents
1. [Report Content System](#report-content-system)
2. [Admin Moderation Dashboard](#admin-moderation-dashboard)
3. [Analytics & Statistics](#analytics--statistics)
4. [Resource Recommendations](#resource-recommendations)
5. [User Following System](#user-following-system)
6. [Discussion Forums](#discussion-forums)

---

## Report Content System

### Overview
Allow users to report inappropriate, copyrighted, spam, or other problematic content.

### Endpoints

#### 1. Report a Resource
```http
POST /api/v1/resources/:id/report
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "type": "inappropriate|copyright|spam|other",
  "reason": "Detailed explanation of why this resource should be reported"
}
```

**Response (201 Created):**
```json
{
  "report": {
    "id": "uuid",
    "resource_id": "uuid",
    "user_id": "uuid",
    "type": "inappropriate",
    "reason": "This content violates community guidelines",
    "status": "pending",
    "created_at": "2025-12-29T14:00:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid report type or missing reason
- `404 Not Found` - Resource not found
- `400 Bad Request` - "you have already reported this resource"

**Example:**
```javascript
const reportResource = async (resourceId, type, reason) => {
  const response = await fetch(`http://localhost:8080/api/v1/resources/${resourceId}/report`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ type, reason })
  });
  return response.json();
};

// Usage
await reportResource('resource-uuid', 'inappropriate', 'Contains offensive content');
```

---

## Admin Moderation Dashboard

### Overview
Admin-only endpoints for managing reports, users, and viewing platform analytics.

**Important:** All admin endpoints require:
1. Valid JWT token
2. User role must be `admin` or `moderator`

### Endpoints

#### 1. List All Reports
```http
GET /api/v1/admin/reports?page=1&page_size=20&status=pending&type=inappropriate
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page` (int) - Page number (default: 1)
- `page_size` (int) - Items per page (default: 20)
- `status` (string) - Filter by status: `pending`, `approved`, `rejected`
- `type` (string) - Filter by type: `inappropriate`, `copyright`, `spam`, `other`

**Response (200 OK):**
```json
{
  "reports": [
    {
      "id": "uuid",
      "resource_id": "uuid",
      "resource": {
        "id": "uuid",
        "title": "Resource Title",
        "user": {
          "id": "uuid",
          "first_name": "John",
          "last_name": "Doe"
        }
      },
      "user": {
        "id": "uuid",
        "first_name": "Jane",
        "last_name": "Smith"
      },
      "type": "inappropriate",
      "reason": "Report reason",
      "status": "pending",
      "created_at": "2025-12-29T14:00:00Z"
    }
  ],
  "total": 50,
  "page": 1,
  "page_size": 20
}
```

#### 2. Approve a Report
```http
POST /api/v1/admin/reports/:id/approve
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "admin_notes": "Optional notes about the approval decision"
}
```

**Response (200 OK):**
```json
{
  "report": {
    "id": "uuid",
    "status": "approved",
    "reviewed_by": "admin-uuid",
    "reviewed_at": "2025-12-29T15:00:00Z",
    "admin_notes": "Content violates guidelines",
    // ... other report fields
  }
}
```

**Note:** Approving a report automatically marks the resource as `is_approved: false`.

#### 3. Reject a Report
```http
POST /api/v1/admin/reports/:id/reject
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "admin_notes": "Report was unfounded"
}
```

**Response (200 OK):**
```json
{
  "report": {
    "id": "uuid",
    "status": "rejected",
    "reviewed_by": "admin-uuid",
    "reviewed_at": "2025-12-29T15:00:00Z",
    "admin_notes": "Report was unfounded"
  }
}
```

#### 4. Ban a User
```http
POST /api/v1/admin/users/:id/ban
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "message": "user banned successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "is_banned": true
  }
}
```

#### 5. Unban a User
```http
POST /api/v1/admin/users/:id/unban
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "message": "user unbanned successfully",
  "user": {
    "id": "uuid",
    "is_banned": false
  }
}
```

---

## Analytics & Statistics

### Overview
Platform-wide analytics and statistics for admins.

### Endpoints

#### 1. Get Platform Analytics
```http
GET /api/v1/admin/analytics
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "analytics": {
    "total_users": 1500,
    "active_users": 1200,
    "total_resources": 5000,
    "approved_resources": 4800,
    "total_downloads": 25000,
    "total_views": 100000,
    "pending_reports": 15,
    "total_comments": 3000,
    "total_ratings": 2000
  }
}
```

**Example Usage:**
```javascript
const getAnalytics = async () => {
  const response = await fetch('http://localhost:8080/api/v1/admin/analytics', {
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });
  return response.json();
};
```

#### 2. Get Popular Resources
```http
GET /api/v1/admin/analytics/popular?limit=10
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `limit` (int) - Number of resources to return (default: 10, max: 50)

**Response (200 OK):**
```json
{
  "resources": [
    {
      "id": "uuid",
      "title": "Popular Resource",
      "download_count": 500,
      "view_count": 2000,
      "user": {
        "first_name": "John",
        "last_name": "Doe"
      },
      "university": {
        "name": "Example University"
      }
    }
  ]
}
```

#### 3. Get Resource Statistics
```http
GET /api/v1/admin/analytics/resources/:id
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "stats": {
    "resource": {
      "id": "uuid",
      "title": "Resource Title",
      "download_count": 45,
      "view_count": 120
    },
    "comment_count": 12,
    "rating_count": 23,
    "average_rating": 4.5,
    "bookmark_count": 8,
    "report_count": 2
  }
}
```

---

## Resource Recommendations

### Overview
Help users discover relevant content through similarity matching and personalized recommendations.

### Endpoints

#### 1. Get Similar Resources
```http
GET /api/v1/resources/:id/similar?limit=5
Authorization: Bearer <token> (Optional)
```

**Query Parameters:**
- `limit` (int) - Number of recommendations (default: 5, max: 20)

**Response (200 OK):**
```json
{
  "resources": [
    {
      "id": "uuid",
      "title": "Similar Resource",
      "type": "notes",
      "course": {
        "name": "Calculus I",
        "code": "MATH101"
      },
      "download_count": 30,
      "view_count": 100
    }
  ]
}
```

**Algorithm:**
1. Same course (highest priority)
2. Same department
3. Same university
4. Fallback to popular resources

**Example:**
```javascript
const getSimilarResources = async (resourceId, limit = 5) => {
  const response = await fetch(
    `http://localhost:8080/api/v1/resources/${resourceId}/similar?limit=${limit}`
  );
  return response.json();
};
```

#### 2. Get Personalized Recommendations
```http
GET /api/v1/recommendations?limit=10
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (int) - Number of recommendations (default: 10, max: 50)

**Response (200 OK):**
```json
{
  "resources": [
    {
      "id": "uuid",
      "title": "Recommended Resource",
      "description": "Based on your department/university",
      "university": {
        "name": "Your University"
      },
      "department": {
        "name": "Your Department"
      }
    }
  ]
}
```

**Personalization Logic:**
- Based on user's department/university
- Excludes user's own resources
- Ordered by popularity (downloads, views)

**Example:**
```javascript
const getRecommendations = async (limit = 10) => {
  const response = await fetch(
    `http://localhost:8080/api/v1/recommendations?limit=${limit}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.json();
};
```

---

## User Following System

### Overview
Social networking features allowing users to follow each other and see activity feeds.

### Endpoints

#### 1. Follow a User
```http
POST /api/v1/follows/users/:id
Authorization: Bearer <token>
```

**Response (201 Created):**
```json
{
  "follow": {
    "id": "uuid",
    "follower_id": "current-user-uuid",
    "following_id": "target-user-uuid",
    "follower": {
      "id": "uuid",
      "first_name": "You",
      "last_name": "User"
    },
    "following": {
      "id": "uuid",
      "first_name": "John",
      "last_name": "Doe"
    },
    "created_at": "2025-12-29T14:00:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - "cannot follow yourself"
- `400 Bad Request` - "already following this user"
- `404 Not Found` - User not found

#### 2. Unfollow a User
```http
DELETE /api/v1/follows/users/:id
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "unfollowed successfully"
}
```

**Error Responses:**
- `400 Bad Request` - "not following this user"

#### 3. Get User's Followers
```http
GET /api/v1/follows/users/:id/followers?page=1&page_size=20
```

**Query Parameters:**
- `page` (int) - Page number
- `page_size` (int) - Items per page

**Response (200 OK):**
```json
{
  "followers": [
    {
      "id": "uuid",
      "first_name": "Follower",
      "last_name": "Name",
      "email": "follower@example.com"
    }
  ],
  "total": 50,
  "page": 1,
  "page_size": 20
}
```

#### 4. Get Users That a User is Following
```http
GET /api/v1/follows/users/:id/following?page=1&page_size=20
```

**Response:** Same format as followers endpoint

#### 5. Check Follow Status
```http
GET /api/v1/follows/users/:id/check
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "is_following": true
}
```

#### 6. Get Activity Feed
```http
GET /api/v1/follows/feed?page=1&page_size=20
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "resources": [
    {
      "id": "uuid",
      "title": "New Resource from Followed User",
      "user": {
        "id": "uuid",
        "first_name": "John",
        "last_name": "Doe"
      },
      "created_at": "2025-12-29T14:00:00Z"
    }
  ],
  "total": 30,
  "page": 1,
  "page_size": 20
}
```

**Note:** Returns resources from users you follow, ordered by creation date (newest first).

**Example Implementation:**
```javascript
class FollowAPI {
  async followUser(userId) {
    const response = await fetch(`http://localhost:8080/api/v1/follows/users/${userId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  }

  async unfollowUser(userId) {
    const response = await fetch(`http://localhost:8080/api/v1/follows/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  }

  async getFollowers(userId, page = 1, pageSize = 20) {
    const response = await fetch(
      `http://localhost:8080/api/v1/follows/users/${userId}/followers?page=${page}&page_size=${pageSize}`
    );
    return response.json();
  }

  async getFollowing(userId, page = 1, pageSize = 20) {
    const response = await fetch(
      `http://localhost:8080/api/v1/follows/users/${userId}/following?page=${page}&page_size=${pageSize}`
    );
    return response.json();
  }

  async checkFollowStatus(userId) {
    const response = await fetch(
      `http://localhost:8080/api/v1/follows/users/${userId}/check`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.json();
  }

  async getActivityFeed(page = 1, pageSize = 20) {
    const response = await fetch(
      `http://localhost:8080/api/v1/follows/feed?page=${page}&page_size=${pageSize}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.json();
  }
}
```

---

## Discussion Forums

### Overview
Course/university-specific discussion forums with nested replies and voting system.

### Endpoints

#### 1. List Forum Topics
```http
GET /api/v1/forum/topics?page=1&page_size=20&course_id=uuid&search=query&sort_by=newest
```

**Query Parameters:**
- `page` (int) - Page number (default: 1)
- `page_size` (int) - Items per page (default: 20)
- `course_id` (uuid) - Filter by course
- `university_id` (uuid) - Filter by university
- `department_id` (uuid) - Filter by department
- `search` (string) - Search in title/content
- `sort_by` (string) - Sort: `newest`, `popular`, `replies`, `pinned`

**Response (200 OK):**
```json
{
  "topics": [
    {
      "id": "uuid",
      "title": "How to solve this problem?",
      "content": "I'm stuck on problem 3...",
      "user": {
        "id": "uuid",
        "first_name": "John",
        "last_name": "Doe"
      },
      "course": {
        "id": "uuid",
        "name": "Calculus I",
        "code": "MATH101"
      },
      "view_count": 150,
      "reply_count": 12,
      "upvote_count": 8,
      "downvote_count": 1,
      "is_pinned": false,
      "is_locked": false,
      "created_at": "2025-12-29T14:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "page_size": 20
}
```

#### 2. Create Forum Topic
```http
POST /api/v1/forum/topics
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "How to solve this problem?",
  "content": "I'm stuck on problem 3 of assignment 2. Can anyone help?",
  "course_id": "uuid",
  "university_id": "uuid",
  "department_id": "uuid"
}
```

**Response (201 Created):**
```json
{
  "topic": {
    "id": "uuid",
    "title": "How to solve this problem?",
    "content": "I'm stuck on problem 3...",
    "user": {
      "id": "uuid",
      "first_name": "John",
      "last_name": "Doe"
    },
    "view_count": 0,
    "reply_count": 0,
    "upvote_count": 0,
    "downvote_count": 0,
    "created_at": "2025-12-29T14:00:00Z"
  }
}
```

#### 3. Get Single Topic
```http
GET /api/v1/forum/topics/:id
```

**Response (200 OK):**
```json
{
  "topic": {
    "id": "uuid",
    "title": "Topic Title",
    "content": "Topic content",
    "user": {
      "id": "uuid",
      "first_name": "John",
      "last_name": "Doe"
    },
    "course": {
      "id": "uuid",
      "name": "Calculus I"
    },
    "view_count": 151,
    "reply_count": 12,
    "replies": [
      {
        "id": "uuid",
        "content": "Here's how I solved it...",
        "user": {
          "id": "uuid",
          "first_name": "Jane",
          "last_name": "Smith"
        },
        "upvote_count": 5,
        "downvote_count": 0,
        "replies": [
          {
            "id": "uuid",
            "content": "Thanks for the help!",
            "user": {
              "id": "uuid",
              "first_name": "John",
              "last_name": "Doe"
            }
          }
        ],
        "created_at": "2025-12-29T15:00:00Z"
      }
    ],
    "created_at": "2025-12-29T14:00:00Z"
  }
}
```

**Note:** View count increments automatically when topic is viewed.

#### 4. Create Reply to Topic
```http
POST /api/v1/forum/topics/:id/replies
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "content": "Here's how I solved it...",
  "parent_id": "uuid" // Optional - for nested replies
}
```

**Response (201 Created):**
```json
{
  "reply": {
    "id": "uuid",
    "content": "Here's how I solved it...",
    "user": {
      "id": "uuid",
      "first_name": "Jane",
      "last_name": "Smith"
    },
    "topic_id": "uuid",
    "parent_id": null,
    "upvote_count": 0,
    "downvote_count": 0,
    "created_at": "2025-12-29T15:00:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Topic is locked
- `404 Not Found` - Topic not found

#### 5. List Replies for Topic
```http
GET /api/v1/forum/topics/:id/replies
```

**Response (200 OK):**
```json
{
  "replies": [
    {
      "id": "uuid",
      "content": "Reply content",
      "user": {
        "id": "uuid",
        "first_name": "Jane",
        "last_name": "Smith"
      },
      "upvote_count": 5,
      "downvote_count": 0,
      "replies": [
        {
          "id": "uuid",
          "content": "Nested reply",
          "user": {
            "id": "uuid",
            "first_name": "John",
            "last_name": "Doe"
          }
        }
      ],
      "created_at": "2025-12-29T15:00:00Z"
    }
  ]
}
```

**Note:** Returns top-level replies with nested replies included. Ordered by upvotes (most upvoted first).

#### 6. Vote on Topic
```http
POST /api/v1/forum/topics/:id/vote
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "is_upvote": true // true for upvote, false for downvote
}
```

**Response (200 OK):**
```json
{
  "message": "vote recorded successfully"
}
```

**Note:** 
- If user already voted, the vote is updated
- Changing from upvote to downvote (or vice versa) updates counts accordingly
- One vote per user per topic/reply

#### 7. Vote on Reply
```http
POST /api/v1/forum/replies/:id/vote
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "is_upvote": true
}
```

**Response (200 OK):**
```json
{
  "message": "vote recorded successfully"
}
```

### Forum Features

**Sorting Options:**
- `newest` - Most recently created (default)
- `popular` - Most upvotes
- `replies` - Most replies
- `pinned` - Pinned topics first, then by date

**Nested Replies:**
- Replies can have parent replies (nested structure)
- Supports unlimited nesting depth
- Display as threaded conversations

**Voting System:**
- Users can upvote or downvote topics and replies
- Vote counts are displayed
- Users can change their vote
- Replies are sorted by upvote count

**Example Implementation:**
```javascript
class ForumAPI {
  async listTopics(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(
      `http://localhost:8080/api/v1/forum/topics?${queryString}`
    );
    return response.json();
  }

  async createTopic(topicData) {
    const response = await fetch('http://localhost:8080/api/v1/forum/topics', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(topicData)
    });
    return response.json();
  }

  async getTopic(topicId) {
    const response = await fetch(
      `http://localhost:8080/api/v1/forum/topics/${topicId}`
    );
    return response.json();
  }

  async createReply(topicId, content, parentId = null) {
    const response = await fetch(
      `http://localhost:8080/api/v1/forum/topics/${topicId}/replies`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content, parent_id: parentId })
      }
    );
    return response.json();
  }

  async voteOnTopic(topicId, isUpvote) {
    const response = await fetch(
      `http://localhost:8080/api/v1/forum/topics/${topicId}/vote`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_upvote: isUpvote })
      }
    );
    return response.json();
  }

  async voteOnReply(replyId, isUpvote) {
    const response = await fetch(
      `http://localhost:8080/api/v1/forum/replies/${replyId}/vote`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_upvote: isUpvote })
      }
    );
    return response.json();
  }
}
```

---

## Complete API Client Example

```javascript
// Complete API client with all new features
class CampusShareAPI {
  constructor(baseURL = 'http://localhost:8080/api/v1', token = null) {
    this.baseURL = baseURL;
    this.token = token;
  }

  setToken(token) {
    this.token = token;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
        ...options.headers
      }
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  }

  // Reports
  async reportResource(resourceId, type, reason) {
    return this.request(`/resources/${resourceId}/report`, {
      method: 'POST',
      body: JSON.stringify({ type, reason })
    });
  }

  // Admin
  async getReports(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/admin/reports?${query}`);
  }

  async approveReport(reportId, adminNotes = '') {
    return this.request(`/admin/reports/${reportId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ admin_notes: adminNotes })
    });
  }

  async rejectReport(reportId, adminNotes = '') {
    return this.request(`/admin/reports/${reportId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ admin_notes: adminNotes })
    });
  }

  async banUser(userId) {
    return this.request(`/admin/users/${userId}/ban`, { method: 'POST' });
  }

  async getAnalytics() {
    return this.request('/admin/analytics');
  }

  async getPopularResources(limit = 10) {
    return this.request(`/admin/analytics/popular?limit=${limit}`);
  }

  async getResourceStats(resourceId) {
    return this.request(`/admin/analytics/resources/${resourceId}`);
  }

  // Recommendations
  async getSimilarResources(resourceId, limit = 5) {
    return this.request(`/resources/${resourceId}/similar?limit=${limit}`);
  }

  async getRecommendations(limit = 10) {
    return this.request(`/recommendations?limit=${limit}`);
  }

  // Following
  async followUser(userId) {
    return this.request(`/follows/users/${userId}`, { method: 'POST' });
  }

  async unfollowUser(userId) {
    return this.request(`/follows/users/${userId}`, { method: 'DELETE' });
  }

  async getFollowers(userId, page = 1, pageSize = 20) {
    return this.request(
      `/follows/users/${userId}/followers?page=${page}&page_size=${pageSize}`
    );
  }

  async getFollowing(userId, page = 1, pageSize = 20) {
    return this.request(
      `/follows/users/${userId}/following?page=${page}&page_size=${pageSize}`
    );
  }

  async checkFollowStatus(userId) {
    return this.request(`/follows/users/${userId}/check`);
  }

  async getActivityFeed(page = 1, pageSize = 20) {
    return this.request(`/follows/feed?page=${page}&page_size=${pageSize}`);
  }

  // Forum
  async listTopics(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/forum/topics?${query}`);
  }

  async createTopic(topicData) {
    return this.request('/forum/topics', {
      method: 'POST',
      body: JSON.stringify(topicData)
    });
  }

  async getTopic(topicId) {
    return this.request(`/forum/topics/${topicId}`);
  }

  async createReply(topicId, content, parentId = null) {
    return this.request(`/forum/topics/${topicId}/replies`, {
      method: 'POST',
      body: JSON.stringify({ content, parent_id: parentId })
    });
  }

  async listReplies(topicId) {
    return this.request(`/forum/topics/${topicId}/replies`);
  }

  async voteOnTopic(topicId, isUpvote) {
    return this.request(`/forum/topics/${topicId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ is_upvote: isUpvote })
    });
  }

  async voteOnReply(replyId, isUpvote) {
    return this.request(`/forum/replies/${replyId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ is_upvote: isUpvote })
    });
  }
}

// Usage
const api = new CampusShareAPI();
api.setToken(localStorage.getItem('authToken'));

// Example: Report a resource
await api.reportResource('resource-id', 'inappropriate', 'Reason here');

// Example: Follow a user
await api.followUser('user-id');

// Example: Get activity feed
const feed = await api.getActivityFeed();

// Example: Create forum topic
await api.createTopic({
  title: 'Help needed',
  content: 'I need help with...',
  course_id: 'course-uuid'
});

// Example: Vote on topic
await api.voteOnTopic('topic-id', true); // upvote
```

---

## Error Handling

All endpoints follow standard error response format:

```json
{
  "error": "Error message description"
}
```

### Common Error Scenarios

1. **Unauthorized (401)**
   - Missing or invalid token
   - Solution: Redirect to login

2. **Forbidden (403)**
   - Admin endpoints accessed by non-admin
   - Solution: Show "Admin access required" message

3. **Not Found (404)**
   - Resource/user/topic not found
   - Solution: Show appropriate error message

4. **Bad Request (400)**
   - Invalid input, validation errors
   - Solution: Display validation errors to user

---

## Best Practices

### 1. Error Handling
```javascript
try {
  const result = await api.followUser(userId);
  // Handle success
} catch (error) {
  if (error.message.includes('already following')) {
    // User already following
  } else if (error.message.includes('cannot follow yourself')) {
    // Cannot follow self
  } else {
    // Generic error
  }
}
```

### 2. Loading States
Always show loading indicators during API calls:
```javascript
const [loading, setLoading] = useState(false);

const loadTopics = async () => {
  setLoading(true);
  try {
    const data = await api.listTopics();
    setTopics(data.topics);
  } finally {
    setLoading(false);
  }
};
```

### 3. Pagination
Always implement pagination for list endpoints:
```javascript
const [page, setPage] = useState(1);
const [pageSize] = useState(20);

const loadMore = async () => {
  const data = await api.listTopics({ page: page + 1, page_size: pageSize });
  setTopics([...topics, ...data.topics]);
  setPage(page + 1);
};
```

### 4. Optimistic Updates
For better UX, update UI optimistically:
```javascript
// Optimistically update UI
setFollowing(true);

try {
  await api.followUser(userId);
} catch (error) {
  // Revert on error
  setFollowing(false);
  showError(error.message);
}
```

---

## Testing Examples

### Using cURL

**Report Resource:**
```bash
curl -X POST http://localhost:8080/api/v1/resources/{id}/report \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"inappropriate","reason":"Report reason"}'
```

**Follow User:**
```bash
curl -X POST http://localhost:8080/api/v1/follows/users/{id} \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Create Forum Topic:**
```bash
curl -X POST http://localhost:8080/api/v1/forum/topics \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Topic Title","content":"Topic content","course_id":"uuid"}'
```

**Get Activity Feed:**
```bash
curl -X GET http://localhost:8080/api/v1/follows/feed \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Summary

### New Endpoints Added

**Reports:** 1 endpoint
- `POST /api/v1/resources/:id/report`

**Admin:** 7 endpoints
- `GET /api/v1/admin/reports`
- `POST /api/v1/admin/reports/:id/approve`
- `POST /api/v1/admin/reports/:id/reject`
- `POST /api/v1/admin/users/:id/ban`
- `POST /api/v1/admin/users/:id/unban`
- `GET /api/v1/admin/analytics`
- `GET /api/v1/admin/analytics/popular`
- `GET /api/v1/admin/analytics/resources/:id`

**Recommendations:** 2 endpoints
- `GET /api/v1/resources/:id/similar`
- `GET /api/v1/recommendations`

**Following:** 6 endpoints
- `POST /api/v1/follows/users/:id`
- `DELETE /api/v1/follows/users/:id`
- `GET /api/v1/follows/users/:id/followers`
- `GET /api/v1/follows/users/:id/following`
- `GET /api/v1/follows/users/:id/check`
- `GET /api/v1/follows/feed`

**Forums:** 7 endpoints
- `GET /api/v1/forum/topics`
- `POST /api/v1/forum/topics`
- `GET /api/v1/forum/topics/:id`
- `GET /api/v1/forum/topics/:id/replies`
- `POST /api/v1/forum/topics/:id/replies`
- `POST /api/v1/forum/topics/:id/vote`
- `POST /api/v1/forum/replies/:id/vote`

**Total New Endpoints: 23**

---

**All features are production-ready and fully documented!** 🚀

For the original API documentation, see `API_INTEGRATION_GUIDE.md`.

