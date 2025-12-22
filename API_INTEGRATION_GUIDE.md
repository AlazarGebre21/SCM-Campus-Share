# API Integration Guide for Frontend Team

This guide provides comprehensive documentation for integrating the frontend application with the Campus Share backend API.

## Table of Contents
1. [Base URL & Environment](#base-url--environment)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
4. [Request/Response Formats](#requestresponse-formats)
5. [Error Handling](#error-handling)
6. [Example Integration](#example-integration)
7. [Testing the API](#testing-the-api)

---

## Base URL & Environment

### Development
```
Base URL: http://localhost:8080/api/v1
```

### Production
```
Base URL: https://api.campus-share.com/api/v1
```

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "ok"
}
```

---

## Authentication

The API uses **JWT (JSON Web Tokens)** for authentication. Most endpoints require authentication except for registration, login, and public resource listing.

### Authentication Flow

1. **Register/Login** → Get JWT token
2. **Store token** → Save in localStorage or secure storage
3. **Include in requests** → Add to `Authorization` header

### Token Storage
```javascript
// After successful login/register
localStorage.setItem('authToken', response.data.token);
localStorage.setItem('user', JSON.stringify(response.data.user));
```

### Making Authenticated Requests
```javascript
const token = localStorage.getItem('authToken');

fetch('http://localhost:8080/api/v1/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### Token Expiration
- Tokens expire after 24 hours (configurable)
- Handle 401 responses by redirecting to login
- Refresh token by logging in again

---

## API Endpoints

### Authentication Endpoints

#### 1. Register User
```http
POST /api/v1/auth/register
```

**Request Body:**
```json
{
  "email": "student@university.edu",
  "password": "securepassword123",
  "first_name": "John",
  "last_name": "Doe",
  "student_id": "STU12345" // Optional
}
```

**Response (201 Created):**
```json
{
  "user": {
    "id": "uuid",
    "email": "student@university.edu",
    "first_name": "John",
    "last_name": "Doe",
    "role": "student",
    "created_at": "2025-12-22T10:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400 Bad Request` - Invalid input
- `409 Conflict` - User already exists

---

#### 2. Login
```http
POST /api/v1/auth/login
```

**Request Body:**
```json
{
  "email": "student@university.edu",
  "password": "securepassword123"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "uuid",
    "email": "student@university.edu",
    "first_name": "John",
    "last_name": "Doe",
    "role": "student"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400 Bad Request` - Missing email/password
- `401 Unauthorized` - Invalid credentials

---

#### 3. Get Current User Profile
```http
GET /api/v1/auth/me
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "uuid",
    "email": "student@university.edu",
    "first_name": "John",
    "last_name": "Doe",
    "student_id": "STU12345",
    "university_id": "uuid",
    "department_id": "uuid",
    "year": 3,
    "major": "Computer Science",
    "role": "student",
    "created_at": "2025-12-22T10:00:00Z"
  }
}
```

---

#### 4. Update Profile
```http
PUT /api/v1/auth/profile
Authorization: Bearer <token>
```

**Request Body (all fields optional):**
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "student_id": "STU67890",
  "university_id": "uuid",
  "department_id": "uuid",
  "year": 4,
  "major": "Software Engineering"
}
```

**Response (200 OK):**
```json
{
  "user": {
    // Updated user object
  }
}
```

---

### Resource Endpoints

#### 1. List/Search Resources
```http
GET /api/v1/resources?page=1&page_size=20&search=calculus&type=notes&university_id=uuid&course_id=uuid&tag=midterm&sort_by=newest
Authorization: Bearer <token> (Optional)
```

**Query Parameters:**
- `page` (int) - Page number (default: 1)
- `page_size` (int) - Items per page (default: 20)
- `search` (string) - Search in title/description
- `type` (string) - Filter by type: `notes`, `slides`, `textbook`, `assignment`, `exam`, `video`, `other`
- `university_id` (uuid) - Filter by university
- `department_id` (uuid) - Filter by department
- `course_id` (uuid) - Filter by course
- `tag` (string) - Filter by tag name
- `sort_by` (string) - Sort: `newest`, `popular`, `rating`

**Response (200 OK):**
```json
{
  "resources": [
    {
      "id": "uuid",
      "title": "Calculus I Lecture Notes",
      "description": "Complete notes for Calculus I",
      "type": "notes",
      "file_name": "calculus_notes.pdf",
      "file_size": 2048576,
      "file_type": "application/pdf",
      "s3_url": "https://presigned-url...",
      "sharing_level": "public",
      "download_count": 45,
      "view_count": 120,
      "user": {
        "id": "uuid",
        "first_name": "John",
        "last_name": "Doe"
      },
      "university": {
        "id": "uuid",
        "name": "Example University"
      },
      "course": {
        "id": "uuid",
        "name": "Calculus I",
        "code": "MATH101"
      },
      "tags": [
        {
          "tag": {
            "id": "uuid",
            "name": "midterm"
          }
        }
      ],
      "created_at": "2025-12-22T10:00:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "page_size": 20
}
```

---

#### 2. Get Single Resource
```http
GET /api/v1/resources/:id
Authorization: Bearer <token> (Optional)
```

**Response (200 OK):**
```json
{
  "resource": {
    // Same structure as list response
  }
}
```

---

#### 3. Upload Resource
```http
POST /api/v1/resources
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
```
file: <File>
title: "Calculus I Lecture Notes"
description: "Complete notes for Calculus I"
type: "notes"
university_id: "uuid" (optional)
department_id: "uuid" (optional)
course_id: "uuid" (optional)
sharing_level: "public" | "university" | "course" (default: "public")
tags: "midterm,exam,calculus" (comma-separated, optional)
```

**Response (201 Created):**
```json
{
  "resource": {
    // Created resource object
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid file type or file too large
- `401 Unauthorized` - Not authenticated

**File Requirements:**
- Max size: 100MB (configurable)
- Allowed types: pdf, doc, docx, ppt, pptx, xls, xlsx, jpg, jpeg, png, gif, mp4, avi

---

#### 4. Update Resource
```http
PUT /api/v1/resources/:id
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "type": "slides",
  "sharing_level": "university",
  "tags": ["new", "tags"]
}
```

**Response (200 OK):**
```json
{
  "resource": {
    // Updated resource object
  }
}
```

**Note:** Only the resource owner can update it.

---

#### 5. Delete Resource
```http
DELETE /api/v1/resources/:id
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "resource deleted successfully"
}
```

**Note:** Only the resource owner or admin can delete it.

---

#### 6. Download Resource
```http
GET /api/v1/resources/:id/download
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "download_url": "https://presigned-s3-url...?expires=..."
}
```

**Note:** 
- The URL is a presigned S3 URL valid for 1 hour
- Redirect user to this URL or use it directly in an `<a>` tag
- This increments the download count

---

### Comment Endpoints

#### 1. Get Resource Comments
```http
GET /api/v1/resources/:id/comments
```

**Response (200 OK):**
```json
{
  "comments": [
    {
      "id": "uuid",
      "content": "Great notes!",
      "user": {
        "id": "uuid",
        "first_name": "Jane",
        "last_name": "Smith"
      },
      "replies": [
        {
          "id": "uuid",
          "content": "Thanks!",
          "user": {
            "id": "uuid",
            "first_name": "John",
            "last_name": "Doe"
          },
          "created_at": "2025-12-22T11:00:00Z"
        }
      ],
      "created_at": "2025-12-22T10:00:00Z"
    }
  ]
}
```

---

#### 2. Create Comment
```http
POST /api/v1/resources/:id/comments
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "content": "Great notes! Very helpful.",
  "parent_id": "uuid" // Optional - for nested replies
}
```

**Response (201 Created):**
```json
{
  "comment": {
    // Comment object
  }
}
```

---

#### 3. Update Comment
```http
PUT /api/v1/comments/:id
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "content": "Updated comment text"
}
```

**Response (200 OK):**
```json
{
  "comment": {
    // Updated comment object
  }
}
```

---

#### 4. Delete Comment
```http
DELETE /api/v1/comments/:id
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "comment deleted successfully"
}
```

---

### Rating Endpoints

#### 1. Get Resource Rating
```http
GET /api/v1/resources/:id/rating
Authorization: Bearer <token> (Optional)
```

**Response (200 OK):**
```json
{
  "average": 4.5,
  "count": 23,
  "user_rating": {
    "id": "uuid",
    "value": 5,
    "created_at": "2025-12-22T10:00:00Z"
  } // null if user hasn't rated
}
```

---

#### 2. Rate Resource
```http
POST /api/v1/resources/:id/rating
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "value": 5 // 1-5 scale
}
```

**Response (200 OK):**
```json
{
  "rating": {
    "id": "uuid",
    "value": 5,
    "created_at": "2025-12-22T10:00:00Z"
  }
}
```

**Note:** If user already rated, this updates the existing rating.

---

### Bookmark Endpoints

#### 1. Get User Bookmarks
```http
GET /api/v1/bookmarks?page=1&page_size=20
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "bookmarks": [
    {
      "id": "uuid",
      "resource": {
        // Full resource object
      },
      "created_at": "2025-12-22T10:00:00Z"
    }
  ],
  "total": 15,
  "page": 1,
  "page_size": 20
}
```

---

#### 2. Create Bookmark
```http
POST /api/v1/bookmarks
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "resource_id": "uuid"
}
```

**Response (201 Created):**
```json
{
  "bookmark": {
    "id": "uuid",
    "resource_id": "uuid",
    "created_at": "2025-12-22T10:00:00Z"
  }
}
```

**Note:** If bookmark already exists, returns existing bookmark (idempotent).

---

#### 3. Delete Bookmark
```http
DELETE /api/v1/bookmarks/:id
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "bookmark deleted successfully"
}
```

---

## Request/Response Formats

### Content Types
- **JSON requests:** `Content-Type: application/json`
- **File uploads:** `Content-Type: multipart/form-data`
- **All responses:** `Content-Type: application/json`

### Date Format
All dates are in ISO 8601 format: `2025-12-22T10:00:00Z`

### UUID Format
All IDs are UUIDs: `550e8400-e29b-41d4-a716-446655440000`

---

## Error Handling

### Standard Error Response Format
```json
{
  "error": "Error message description"
}
```

### HTTP Status Codes

| Code | Meaning | When It Occurs |
|------|---------|----------------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST (creation) |
| 400 | Bad Request | Invalid input, missing required fields |
| 401 | Unauthorized | Missing/invalid token, invalid credentials |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists (e.g., duplicate email) |
| 500 | Internal Server Error | Server error |

### Common Error Scenarios

#### 1. Authentication Required
```json
{
  "error": "Authorization header required"
}
```
**Action:** Redirect to login page

#### 2. Invalid/Expired Token
```json
{
  "error": "Invalid or expired token"
}
```
**Action:** Clear stored token, redirect to login

#### 3. Validation Error
```json
{
  "error": "Key: 'RegisterRequest.Email' Error:Field validation for 'Email' failed on the 'email' tag"
}
```
**Action:** Display validation message to user

#### 4. Resource Not Found
```json
{
  "error": "resource not found"
}
```
**Action:** Show 404 page or error message

---

## Example Integration

### React/JavaScript Example

```javascript
// api.js - API client setup
const API_BASE_URL = 'http://localhost:8080/api/v1';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth methods
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Store token
    if (response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  }

  async getProfile() {
    return this.request('/auth/me');
  }

  // Resource methods
  async getResources(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/resources?${queryString}`);
  }

  async getResource(id) {
    return this.request(`/resources/${id}`);
  }

  async uploadResource(formData) {
    const token = localStorage.getItem('authToken');
    return fetch(`${this.baseURL}/resources`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type for FormData - browser will set it with boundary
      },
      body: formData,
    }).then(res => res.json());
  }

  async deleteResource(id) {
    return this.request(`/resources/${id}`, {
      method: 'DELETE',
    });
  }

  // Comment methods
  async getComments(resourceId) {
    return this.request(`/resources/${resourceId}/comments`);
  }

  async createComment(resourceId, content, parentId = null) {
    return this.request(`/resources/${resourceId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, parent_id: parentId }),
    });
  }

  // Rating methods
  async getRating(resourceId) {
    return this.request(`/resources/${resourceId}/rating`);
  }

  async rateResource(resourceId, value) {
    return this.request(`/resources/${resourceId}/rating`, {
      method: 'POST',
      body: JSON.stringify({ value }),
    });
  }

  // Bookmark methods
  async getBookmarks(page = 1, pageSize = 20) {
    return this.request(`/bookmarks?page=${page}&page_size=${pageSize}`);
  }

  async createBookmark(resourceId) {
    return this.request('/bookmarks', {
      method: 'POST',
      body: JSON.stringify({ resource_id: resourceId }),
    });
  }

  async deleteBookmark(bookmarkId) {
    return this.request(`/bookmarks/${bookmarkId}`, {
      method: 'DELETE',
    });
  }
}

export default new ApiClient();
```

### Usage Example

```javascript
// Login component
import api from './api';

async function handleLogin(email, password) {
  try {
    const response = await api.login(email, password);
    console.log('Logged in:', response.user);
    // Redirect to dashboard
  } catch (error) {
    console.error('Login failed:', error.message);
    // Show error to user
  }
}

// Resource upload component
async function handleUpload(file, title, description) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', title);
  formData.append('description', description);
  formData.append('type', 'notes');
  formData.append('sharing_level', 'public');

  try {
    const response = await api.uploadResource(formData);
    console.log('Uploaded:', response.resource);
  } catch (error) {
    console.error('Upload failed:', error.message);
  }
}

// Resource list component
async function loadResources() {
  try {
    const response = await api.getResources({
      page: 1,
      page_size: 20,
      search: 'calculus',
      sort_by: 'newest'
    });
    
    console.log('Resources:', response.resources);
    console.log('Total:', response.total);
  } catch (error) {
    console.error('Failed to load resources:', error);
  }
}
```

---

## Testing the API

### Using cURL

#### Register
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "first_name": "Test",
    "last_name": "User"
  }'
```

#### Login
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### Get Resources (with token)
```bash
curl -X GET http://localhost:8080/api/v1/resources \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Postman

1. **Create Environment Variables:**
   - `base_url`: `http://localhost:8080/api/v1`
   - `token`: (set after login)

2. **Register/Login:**
   - Method: POST
   - URL: `{{base_url}}/auth/register`
   - Body: JSON with user data
   - Save token from response to `token` variable

3. **Authenticated Requests:**
   - Add header: `Authorization: Bearer {{token}}`

### Using Browser DevTools

```javascript
// In browser console
const token = 'YOUR_TOKEN_HERE';

fetch('http://localhost:8080/api/v1/resources', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(res => res.json())
.then(data => console.log(data));
```

---

## Important Notes

1. **CORS:** The API is configured to accept requests from `http://localhost:3000` and `http://localhost:5173` by default. Update CORS settings in production.

2. **File Uploads:** Use `FormData` for file uploads, not JSON. The file field must be named `file`.

3. **Pagination:** Always implement pagination for resource lists. Default page size is 20.

4. **Error Handling:** Always handle network errors and API errors gracefully. Show user-friendly messages.

5. **Token Management:** 
   - Store tokens securely
   - Handle token expiration (401 responses)
   - Clear tokens on logout

6. **Loading States:** Show loading indicators during API calls.

7. **Optimistic Updates:** Consider optimistic UI updates for better UX (e.g., like/bookmark buttons).

---

## Support

For questions or issues:
- Check the backend README.md
- Review error messages in API responses
- Contact the backend team

---

**Last Updated:** December 22, 2025

