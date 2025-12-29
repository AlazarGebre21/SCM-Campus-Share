# Complete API Reference - Campus Share Backend

This document provides a complete reference of all API endpoints available in the Campus Share backend.

## Quick Links
- [Core API Guide](./API_INTEGRATION_GUIDE.md) - Basic CRUD operations
- [New Features Guide](./NEW_FEATURES_API_GUIDE.md) - Advanced features
- [Social Features Guide](./SOCIAL_FEATURES.md) - User following and forums

---

## API Endpoints Summary

### Authentication (4 endpoints)
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user profile
- `PUT /api/v1/auth/profile` - Update user profile

### Resources (6 endpoints)
- `GET /api/v1/resources` - List/search resources
- `POST /api/v1/resources` - Upload resource
- `GET /api/v1/resources/:id` - Get resource details
- `PUT /api/v1/resources/:id` - Update resource
- `DELETE /api/v1/resources/:id` - Delete resource
- `GET /api/v1/resources/:id/download` - Get download URL
- `GET /api/v1/resources/:id/similar` - Get similar resources ⭐ NEW
- `POST /api/v1/resources/:id/report` - Report resource ⭐ NEW

### Comments (4 endpoints)
- `GET /api/v1/resources/:id/comments` - Get resource comments
- `POST /api/v1/resources/:id/comments` - Add comment
- `PUT /api/v1/comments/:id` - Update comment
- `DELETE /api/v1/comments/:id` - Delete comment

### Ratings (2 endpoints)
- `GET /api/v1/resources/:id/rating` - Get resource rating
- `POST /api/v1/resources/:id/rating` - Rate resource

### Bookmarks (3 endpoints)
- `GET /api/v1/bookmarks` - Get user bookmarks
- `POST /api/v1/bookmarks` - Add bookmark
- `DELETE /api/v1/bookmarks/:id` - Remove bookmark

### Recommendations (2 endpoints) ⭐ NEW
- `GET /api/v1/resources/:id/similar` - Get similar resources
- `GET /api/v1/recommendations` - Get personalized recommendations

### User Following (6 endpoints) ⭐ NEW
- `POST /api/v1/follows/users/:id` - Follow user
- `DELETE /api/v1/follows/users/:id` - Unfollow user
- `GET /api/v1/follows/users/:id/followers` - Get followers
- `GET /api/v1/follows/users/:id/following` - Get following
- `GET /api/v1/follows/users/:id/check` - Check follow status
- `GET /api/v1/follows/feed` - Get activity feed

### Discussion Forums (7 endpoints) ⭐ NEW
- `GET /api/v1/forum/topics` - List topics
- `POST /api/v1/forum/topics` - Create topic
- `GET /api/v1/forum/topics/:id` - Get topic
- `GET /api/v1/forum/topics/:id/replies` - List replies
- `POST /api/v1/forum/topics/:id/replies` - Create reply
- `POST /api/v1/forum/topics/:id/vote` - Vote on topic
- `POST /api/v1/forum/replies/:id/vote` - Vote on reply

### Admin Moderation (8 endpoints) ⭐ NEW
- `GET /api/v1/admin/reports` - List reports
- `POST /api/v1/admin/reports/:id/approve` - Approve report
- `POST /api/v1/admin/reports/:id/reject` - Reject report
- `POST /api/v1/admin/users/:id/ban` - Ban user
- `POST /api/v1/admin/users/:id/unban` - Unban user
- `GET /api/v1/admin/analytics` - Get platform analytics
- `GET /api/v1/admin/analytics/popular` - Get popular resources
- `GET /api/v1/admin/analytics/resources/:id` - Get resource stats

**Total Endpoints: 42**

---

## Feature Categories

### 🔐 Core Features (Basic CRUD)
- User authentication and profiles
- Resource management (upload, download, search)
- Comments and ratings
- Bookmarks

**Documentation:** [API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md)

### ⭐ Advanced Features
- Content reporting system
- Admin moderation tools
- Platform analytics
- Resource recommendations
- User following and social features
- Discussion forums with voting

**Documentation:** [NEW_FEATURES_API_GUIDE.md](./NEW_FEATURES_API_GUIDE.md)

### 👥 Social Features
- User following/unfollowing
- Activity feeds
- Discussion forums
- Upvoting/downvoting

**Documentation:** [SOCIAL_FEATURES.md](./SOCIAL_FEATURES.md)

---

## Authentication

All endpoints (except registration, login, and public resource listing) require authentication:

```http
Authorization: Bearer <jwt_token>
```

### Getting a Token

1. **Register:**
```http
POST /api/v1/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe"
}
```

2. **Login:**
```http
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

Both return a token in the response:
```json
{
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Admin Access

Admin endpoints require:
1. Valid JWT token
2. User role must be `admin` or `moderator`

To grant admin access, update the user's role in the database:
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

---

## Rate Limiting

Default rate limits:
- 100 requests per 15 minutes per IP
- Configurable via environment variables

---

## Pagination

Most list endpoints support pagination:

**Query Parameters:**
- `page` (int) - Page number (default: 1)
- `page_size` (int) - Items per page (default: 20)

**Response Format:**
```json
{
  "items": [...],
  "total": 150,
  "page": 1,
  "page_size": 20
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message description"
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Success |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error |

---

## Complete Example: Building a Feature

### Example: User Profile Page with Following

```javascript
import { CampusShareAPI } from './api';

const api = new CampusShareAPI('http://localhost:8080/api/v1');
api.setToken(localStorage.getItem('authToken'));

// Get user profile
const profile = await api.getProfile(userId);

// Check if current user is following this user
const followStatus = await api.checkFollowStatus(userId);

// Get user's followers and following
const [followers, following] = await Promise.all([
  api.getFollowers(userId),
  api.getFollowing(userId)
]);

// Get user's resources
const resources = await api.getResources({ user_id: userId });

// Display profile with follow button
```

### Example: Discussion Forum Page

```javascript
// Load topics for a course
const topics = await api.listTopics({
  course_id: courseId,
  sort_by: 'popular',
  page: 1,
  page_size: 20
});

// When user clicks a topic
const topic = await api.getTopic(topicId);

// Display topic with replies
// User can reply
await api.createReply(topicId, 'My reply content');

// User can vote
await api.voteOnTopic(topicId, true); // upvote
```

### Example: Admin Dashboard

```javascript
// Load pending reports
const reports = await api.getReports({
  status: 'pending',
  page: 1,
  page_size: 20
});

// Approve a report
await api.approveReport(reportId, 'Content violates guidelines');

// Get platform analytics
const analytics = await api.getAnalytics();
// Display: total users, resources, downloads, etc.

// Get popular resources
const popular = await api.getPopularResources(10);
```

---

## Testing Checklist

### Core Features
- [ ] User registration and login
- [ ] Resource upload and download
- [ ] Search and filter resources
- [ ] Add comments and ratings
- [ ] Bookmark resources

### New Features
- [ ] Report a resource
- [ ] Follow/unfollow users
- [ ] View activity feed
- [ ] Create forum topic
- [ ] Reply to topic
- [ ] Vote on topics/replies
- [ ] Get recommendations
- [ ] Admin: View reports
- [ ] Admin: Approve/reject reports
- [ ] Admin: View analytics

---

## Support & Resources

- **Main API Guide:** [API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md)
- **New Features Guide:** [NEW_FEATURES_API_GUIDE.md](./NEW_FEATURES_API_GUIDE.md)
- **Social Features Guide:** [SOCIAL_FEATURES.md](./SOCIAL_FEATURES.md)
- **Backend README:** [README.md](./README.md)

---

**Last Updated:** December 29, 2025

