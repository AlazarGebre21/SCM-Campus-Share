# Baseline 1 (BL1) Record

## Baseline Information

- **Baseline ID:** BL2
- **Baseline Name:** First Functional Baseline
- **Date Established:** [1/2/2026]
- **Status:** Active(Frozen)

## Configuration Items in this Baseline

# Configuration Item Register for Baseline 2

Campus Share Academic Resource Sharing Platform

Document Version: 2.0

Date: January 02, 2026

Prepared By: Afomia (CI & Documentation Specialist)

Status: Active

Approval: Alem (Project & Configuration Manager)

Reference: SCMP Version 1.0, Section 2

This register documents all Configuration Items at Baseline 2, providing a snapshot of the project's configuration state.

## Documentation Configuration Items

| ID      | Name                                          | Location                           | Short Description                                         | Version History                              | Status |
| ------- | --------------------------------------------- | ---------------------------------- | --------------------------------------------------------- | -------------------------------------------- | ------ |
| DOC-001 | Software Configuration Management Plan (SCMP) | /docs/SCMP.md                      | Foundational SCM procedures, tools, and responsibilities. | Version 1.0 established December 16, 2025    | Active |
| DOC-002 | Project README                                | /README.md                         | Project overview, installation, and usage guidelines.     | Version 1.0 established December 22, 2025    | Active |
| DOC-003 | API Integration Guide                         | /docs/API_INTEGRATION_GUIDE.md     | Guide for basic API integration.                          | Version 1.0 established December 22, 2025    | Active |
| DOC-004 | New Features API Integration Guide            | /docs/NEW_FEATURES_API_GUIDE.md    | Guide for advanced features like reports and forums.      | Version 1.0 established December 29, 2025    | Active |
| DOC-005 | Complete API Reference                        | /docs/COMPLETE_API_REFERENCE.md    | Summary of all API endpoints.                             | Version 1.0 established December 29, 2025    | Active |
| DOC-006 | Merge Request Description Template            | /docs/MERGE_REQUEST_DESCRIPTION.md | Template for merge requests.                              | Version 1.0 established December 22, 2025    | Active |
| DOC-007 | Project License                               | /LICENSE                           | GNU GPL-3.0 license.                                      | Version 1.0 established at project inception | Active |

## Source Code Configuration Items

| ID      | Name                                     | Location                                     | Short Description                              | Version History                                                      | Status |
| ------- | ---------------------------------------- | -------------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------- | ------ |
| SRC-001 | Main Application Entry Point             | /cmd/server/main.go                          | Orchestrates system startup and API routes.    | Version 1.0 established December 22, 2025; updated December 29, 2025 | Active |
| SRC-002 | Configuration Management Module          | /internal/config/config.go                   | Loads and validates app settings.              | Version 1.0 established December 22, 2025                            | Active |
| SRC-003 | Database Connection and Migration Module | /internal/database/database.go               | Manages PostgreSQL connections and migrations. | Version 1.0 established December 22, 2025; updated December 29, 2025 | Active |
| SRC-004 | User Model                               | /internal/models/user.go                     | Defines user accounts and profiles.            | Version 1.0 established December 22, 2025                            | Active |
| SRC-005 | University Model                         | /internal/models/university.go               | Represents educational institutions.           | Version 1.0 established December 22, 2025                            | Active |
| SRC-006 | Department Model                         | /internal/models/department.go               | Defines academic departments.                  | Version 1.0 established December 22, 2025                            | Active |
| SRC-007 | Course Model                             | /internal/models/course.go                   | Represents academic courses.                   | Version 1.0 established December 22, 2025                            | Active |
| SRC-008 | Resource Model                           | /internal/models/resource.go                 | Core entity for uploaded resources.            | Version 1.0 established December 22, 2025                            | Active |
| SRC-009 | Comment Model                            | /internal/models/comment.go                  | Supports nested comments.                      | Version 1.0 established December 22, 2025                            | Active |
| SRC-010 | Rating Model                             | /internal/models/rating.go                   | Handles resource ratings.                      | Version 1.0 established December 22, 2025                            | Active |
| SRC-011 | Bookmark Model                           | /internal/models/bookmark.go                 | Manages user bookmarks.                        | Version 1.0 established December 22, 2025                            | Active |
| SRC-012 | Report Model                             | /internal/models/report.go                   | Manages content reports.                       | Version 1.0 established December 22, 2025                            | Active |
| SRC-013 | Tag Model                                | /internal/models/tag.go                      | Tagging for resources.                         | Version 1.0 established December 22, 2025                            | Active |
| SRC-014 | Follow Model                             | /internal/models/follow.go                   | Tracks user follows.                           | Version 1.0 established December 29, 2025                            | Active |
| SRC-015 | Forum Topic Model                        | /internal/models/forum.go - ForumTopic       | Defines forum topics.                          | Version 1.0 established December 29, 2025                            | Active |
| SRC-016 | Forum Reply Model                        | /internal/models/forum.go - ForumReply       | Nested forum replies.                          | Version 1.0 established December 29, 2025                            | Active |
| SRC-017 | Forum Vote Model                         | /internal/models/forum.go - ForumVote        | Voting on forum content.                       | Version 1.0 established December 29, 2025                            | Active |
| SRC-018 | Authentication Handler                   | /internal/handlers/auth_handler.go           | Handles user auth and profiles.                | Version 1.0 established December 22-29, 2025                         | Active |
| SRC-019 | Resource Handler                         | /internal/handlers/resource_handler.go       | Manages resource operations.                   | Version 1.0 established December 22-29, 2025                         | Active |
| SRC-020 | Comment Handler                          | /internal/handlers/comment_handler.go        | Manages comments.                              | Version 1.0 established December 22-29, 2025                         | Active |
| SRC-021 | Rating Handler                           | /internal/handlers/rating_handler.go         | Processes ratings.                             | Version 1.0 established December 22-29, 2025                         | Active |
| SRC-022 | Bookmark Handler                         | /internal/handlers/bookmark_handler.go       | Manages bookmarks.                             | Version 1.0 established December 22-29, 2025                         | Active |
| SRC-023 | Report Handler                           | /internal/handlers/report_handler.go         | Handles reports.                               | Version 1.0 established December 22-29, 2025                         | Active |
| SRC-024 | Admin Handler                            | /internal/handlers/admin_handler.go          | Admin moderation tools.                        | Version 1.0 established December 22-29, 2025                         | Active |
| SRC-025 | Recommendation Handler                   | /internal/handlers/recommendation_handler.go | Provides recommendations.                      | Version 1.0 established December 22-29, 2025                         | Active |
| SRC-026 | Follow Handler                           | /internal/handlers/follow_handler.go         | Manages follows.                               | Version 1.0 established December 22-29, 2025                         | Active |
| SRC-027 | Forum Handler                            | /internal/handlers/forum_handler.go          | Handles forum interactions.                    | Version 1.0 established December 22-29, 2025                         | Active |
| SRC-028 | Authentication Service                   | /internal/services/auth_service.go           | Implements auth logic.                         | Version 1.0 established December 22-29, 2025                         | Active |
| SRC-029 | Resource Service                         | /internal/services/resource_service.go       | Resource business logic.                       | Version 1.0 established December 22-29, 2025                         | Active |
| SRC-030 | Comment Service                          | /internal/services/comment_service.go        | Comment business logic.                        | Version 1.0 established December 22-29, 2025                         | Active |
| SRC-031 | Rating Service                           | /internal/services/rating_service.go         | Rating calculations.                           | Version 1.0 established December 22-29, 2025                         | Active |
| SRC-032 | Bookmark Service                         | /internal/services/bookmark_service.go       | Bookmark operations.                           | Version 1.0 established December 22-29, 2025                         | Active |
| SRC-033 | Report Service                           | /internal/services/report_service.go         | Report processing.                             | Version 1.0 established December 22-29, 2025                         | Active |
| SRC-034 | Recommendation Service                   | /internal/services/recommendation_service.go | Recommendation algorithms.                     | Version 1.0 established December 22-29, 2025                         | Active |
| SRC-035 | Follow Service                           | /internal/services/follow_service.go         | Follow relationships.                          | Version 1.0 established December 22-29, 2025                         | Active |
| SRC-036 | Forum Service                            | /internal/services/forum_service.go          | Forum functionality.                           | Version 1.0 established December 22-29, 2025                         | Active |
| SRC-037 | Authentication Middleware                | /internal/middleware/auth.go                 | JWT validation.                                | Version 1.0 established December 22, 2025                            | Active |
| SRC-038 | CORS Middleware                          | /internal/middleware/cors.go                 | Handles CORS.                                  | Version 1.0 established December 22, 2025                            | Active |
| SRC-039 | Error Handler Middleware                 | /internal/middleware/error_handler.go        | Error handling.                                | Version 1.0 established December 22, 2025                            | Active |
| SRC-040 | Cloud Storage Integration Module         | /internal/storage/s3.go                      | Cloud file operations.                         | Version 1.0 established December 22, 2025                            | Active |
| SRC-041 | JWT Utility Package                      | /pkg/jwt/jwt.go                              | JWT token utilities.                           | Version 1.0 established December 22, 2025                            | Active |
| SRC-042 | HTML Entry Point                         | /index.html                                  | Main HTML template for React app.              | Version 1.1                                                          | Active |
| SRC-043 | React Root                               | /src/main.jsx                                | Renders React app and providers.               | Version 1.1                                                          | Active |
| SRC-044 | Main Router                              | /src/App.jsx                                 | Defines app routes.                            | Version 1.1                                                          | Active |
| SRC-045 | Axios Instance                           | /src/lib/axios.js                            | Configured HTTP client.                        | Version 1.1                                                          | Active |
| SRC-046 | Authentication Service                   | /src/services/auth.service.js                | Auth API services.                             | Version 1.1                                                          | Active |
| SRC-047 | Resource Service                         | /src/services/resource.service.js            | Resource API services.                         | Version 1.1                                                          | Active |
| SRC-048 | Social Service                           | /src/services/social.service.js              | Social feature API services.                   | Version 1.1                                                          | Active |
| SRC-049 | Admin Service                            | /src/services/admin.service.js               | Admin API services.                            | Version 1.1                                                          | Active |
| SRC-050 | Authentication Context                   | /src/features/auth/AuthContext.jsx           | Manages auth state.                            | Version 1.1                                                          | Active |
| SRC-051 | Protected Route Component                | /src/features/auth/ProtectedRoute.jsx        | Guards routes by auth.                         | Version 1.1                                                          | Active |
| SRC-052 | Application Layout                       | /src/layouts/AppLayout.jsx                   | Main app layout.                               | Version 1.1                                                          | Active |
| SRC-053 | Landing Page                             | /src/features/landing/LandingPage.jsx        | Public home page.                              | Version 1.1                                                          | Active |
| SRC-054 | Dashboard Page                           | /src/pages/Dashboard.jsx                     | User dashboard.                                | Version 1.1                                                          | Active |
| SRC-055 | Upload Resource Page                     | /src/pages/UploadResource.jsx                | Resource upload page.                          | Version 1.1                                                          | Active |
| SRC-056 | Resource Details Page                    | /src/pages/ResourceDetails.jsx               | Resource detail view.                          | Version 1.1                                                          | Active |
| SRC-057 | User Profile Page                        | /src/pages/Profile.jsx                       | Profile management.                            | Version 1.1                                                          | Active |
| SRC-058 | Admin Dashboard Page                     | /src/pages/admin/AdminDashboard.jsx          | Admin moderation dashboard.                    | Version 1.1                                                          | Active |
| SRC-059 | Star Rating Component                    | /src/components/StarRating.jsx               | Rating display/submit.                         | Version 1.1                                                          | Active |
| SRC-060 | Comment Section Component                | /src/features/social/CommentSection.jsx      | Comment display/add.                           | Version 1.1                                                          | Active |
| SRC-061 | Resource Card Component                  | /src/features/resources/ResourceCard.jsx     | Resource summary card.                         | Version 1.1                                                          | Active |
| SRC-062 | Logo Asset                               | /public/campus-share.svg                     | Platform logo image.                           | Version 1.1                                                          | Active |

## Configuration and Build Configuration Items

| ID      | Name                               | Location        | Short Description                    | Version History                           | Status |
| ------- | ---------------------------------- | --------------- | ------------------------------------ | ----------------------------------------- | ------ |
| CFG-001 | Go Module Definition               | /go.mod         | Declares backend dependencies.       | Version 1.0 established December 22, 2025 | Active |
| CFG-002 | Go Dependency Checksum File        | /go.sum         | Dependency integrity checksums.      | Auto-generated; initial December 22, 2025 | Active |
| CFG-003 | Git Ignore Configuration           | /.gitignore     | Excludes files from version control. | Version 1.0 established December 22, 2025 | Active |
| CFG-004 | Environment Configuration Template | /.env.example   | Template for env variables.          | Version 1.0 established December 22, 2025 | Active |
| CFG-005 | Project Manifest                   | /package.json   | Frontend dependencies and scripts.   | Version 1.1                               | Active |
| CFG-006 | Vite Configuration                 | /vite.config.js | Vite build config.                   | Version 1.1                               | Active |
| CFG-007 | Tailwind Entry CSS                 | /src/index.css  | Tailwind CSS imports.                | Version 1.1                               | Active |
| CFG-008 | Environment Configuration          | /.env           | Env-specific variables.              | Version 1.1                               | Active |

## Database Schema Configuration Items

| ID     | Name                                    | Location                      | Short Description             | Version History                                                      | Status |
| ------ | --------------------------------------- | ----------------------------- | ----------------------------- | -------------------------------------------------------------------- | ------ |
| DB-001 | Database Schema Definition (via Models) | /internal/models/ (all files) | GORM-defined database schema. | Version 1.0 established December 22, 2025; updated December 29, 2025 | Active |

## Software Configuration Management Artifacts

| ID      | Name                                        | Location                                | Short Description          | Version History                                | Status  |
| ------- | ------------------------------------------- | --------------------------------------- | -------------------------- | ---------------------------------------------- | ------- |
| SCM-001 | Configuration Item Register (This Document) | /docs/CI_IDENTIFICATION_AND_REGISTER.md | Authoritative CI catalog.  | Version 1.0 established December 29, 2025      | Active  |
| SCM-002 | Change Log                                  | /docs/CHANGE_LOG.md                     | Record of all changes.     | Maintained continuously from December 22, 2025 | Active  |
| SCM-003 | Baseline Records                            | /docs/baselines/ directory              | Baseline documentation.    | Created at baselines; BL1 December 22, 2025    | Active  |
| SCM-004 | Configuration Audit Reports                 | /docs/audits/ directory                 | Audit reports for configs. | Pending; scheduled January 2026                | Pending |

## Establishment Criteria Verified

- All required source code for basic functionality were created
- Every functionality is included
- CI register were updated to include all items(backend, frontend and others)
- Repository structure matches SCM project requirements

## Approvals

**Project & Configuration Manager:** **Approved**\*\*\***\*\_\_\_\*\***\*\*\*\*\*\*
_Alem Ayalew_
Date: December 29, 2025

**Configuration Auditor:** **\_**Approved**\*\*\*\***\_\_**\*\*\*\***
_Abrham Mulugeta_
Date: December 29, 2025

**CI & Documentation Specialist:** **\_\_\_**Approved**\*\***\_\_\_\_**\*\***
_Afomia Dugassa_
Date: December 29, 2025
