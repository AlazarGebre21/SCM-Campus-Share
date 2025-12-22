# Campus Academic Resource Sharing Platform - Backend API

An open-source backend API for a campus academic resource sharing platform built with Go. This platform enables university students to share, search, and download academic resources across campuses.

## Features

- 🔐 **User Authentication**: JWT-based authentication with OAuth support (Google)
- 📚 **Resource Management**: Upload, download, search, and categorize academic resources
- 🏫 **Multi-University Support**: Cross-university resource sharing with access controls
- 💬 **Community Features**: Comments, ratings, bookmarks, and tagging
- 🛡️ **Admin Panel**: Content moderation and analytics dashboard
- ☁️ **Cloud Storage**: S3-compatible storage integration for scalable file handling

## Tech Stack

- **Language**: Go 1.21+
- **Framework**: Gin Web Framework
- **Database**: PostgreSQL
- **ORM**: GORM
- **Authentication**: JWT (JSON Web Tokens)
- **Storage**: AWS S3 / MinIO (S3-compatible)
- **Documentation**: OpenAPI/Swagger

## Project Structure

```
backend/
├── cmd/
│   └── server/
│       └── main.go          # Application entry point
├── internal/
│   ├── config/              # Configuration management
│   ├── database/            # Database connection and migrations
│   ├── models/              # Data models
│   ├── handlers/            # HTTP request handlers
│   ├── middleware/          # HTTP middleware (auth, CORS, etc.)
│   ├── services/            # Business logic
│   ├── storage/             # Cloud storage integration
│   └── utils/               # Utility functions
├── pkg/
│   └── jwt/                 # JWT utilities
├── migrations/              # Database migration files
├── docs/                    # API documentation
├── .env.example             # Environment variables template
├── go.mod                   # Go module dependencies
└── README.md                # This file
```

## Prerequisites

- Go 1.21 or higher
- PostgreSQL 12 or higher
- AWS S3 account (or MinIO for local development)
- Git

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/campus-share/backend.git
   cd backend
   ```

2. **Install dependencies**
   ```bash
   go mod download
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run database migrations**
   ```bash
   go run cmd/server/main.go migrate
   ```

5. **Start the server**
   ```bash
   go run cmd/server/main.go
   ```

The API will be available at `http://localhost:8080`

## Environment Variables

See `.env.example` for all required environment variables. Key variables include:

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT token signing
- `AWS_ACCESS_KEY_ID`: AWS S3 access key
- `AWS_SECRET_ACCESS_KEY`: AWS S3 secret key
- `AWS_REGION`: AWS region
- `S3_BUCKET_NAME`: S3 bucket name for file storage
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/google` - Google OAuth login
- `GET /api/v1/auth/me` - Get current user profile
- `PUT /api/v1/auth/profile` - Update user profile

### Resources
- `GET /api/v1/resources` - List/search resources
- `POST /api/v1/resources` - Upload new resource
- `GET /api/v1/resources/:id` - Get resource details
- `PUT /api/v1/resources/:id` - Update resource
- `DELETE /api/v1/resources/:id` - Delete resource
- `GET /api/v1/resources/:id/download` - Download resource

### Comments
- `GET /api/v1/resources/:id/comments` - Get resource comments
- `POST /api/v1/resources/:id/comments` - Add comment
- `PUT /api/v1/comments/:id` - Update comment
- `DELETE /api/v1/comments/:id` - Delete comment

### Ratings
- `POST /api/v1/resources/:id/rating` - Rate resource
- `GET /api/v1/resources/:id/rating` - Get resource rating

### Bookmarks
- `GET /api/v1/bookmarks` - Get user bookmarks
- `POST /api/v1/bookmarks` - Add bookmark
- `DELETE /api/v1/bookmarks/:id` - Remove bookmark

### Admin
- `GET /api/v1/admin/analytics` - Get platform analytics
- `GET /api/v1/admin/reports` - Get reported content
- `POST /api/v1/admin/reports/:id/approve` - Approve report
- `POST /api/v1/admin/reports/:id/reject` - Reject report
- `POST /api/v1/admin/users/:id/ban` - Ban user

For detailed API documentation, see `docs/api.md` or visit `/swagger/index.html` when the server is running.

## Development

### Running Tests
```bash
go test ./...
```

### Code Formatting
```bash
go fmt ./...
```

### Building
```bash
go build -o bin/server cmd/server/main.go
```

## Contributing

Please read [CONTRIBUTING.md](../CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](../LICENSE) file for details.

## Support

For support, email support@campus-share.com or open an issue in the repository.


