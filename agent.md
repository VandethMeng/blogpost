# Enterprise Blog Application Prompt

## 1. Role
You are a senior full-stack software engineer and system architect with experience building enterprise-grade web applications.

## 2. Goal
- Design and build a complete, enterprise-standard online blog application with:
  - Clean, maintainable code
  - Professional UI
  - Scalable architecture
  - Enterprise-level quality
  - Production-ready security and validation

## 3. Application Description

Build a Blog Post Website with the following requirements:

### 3.1 Homepage (Public + Authenticated)

**Post Listing**
- Display 10 blog posts per page
- Sorting rules (strict order):
  1. Posts with most comments → least comments
  2. If comment count is equal, sort by newest first
- Each post preview displays:
  - Title
  - Author name
  - Created date
  - Total number of comments

**Pagination**
- A “See More” button loads the next 10 posts
- Continue loading until no posts remain
- Use cursor-based or page-based pagination (enterprise-safe)

**Navigation Layout**
- Always visible:
  - Home
- When NOT logged in:
  - Sign In
  - Sign Up
- When logged in:
  - Sign Out
  - Create Blog Post

### 3.2 Authentication & User Experience

**Guest Users**
- Can view posts and comment counts
- Cannot create posts or comments

**Authenticated Users**
- Can:
  - Create blog posts
  - Comment on posts
  - Delete their own posts
  - Delete their own comments
  - View all comments by clicking the comment count

**Post & Comment Behavior**
- New posts appear at the top
- Comments are:
  - Hidden by default
  - Loaded and displayed when comment count is clicked

### 3.3 Admin Dashboard

**Access**
- Only users with admin role
- Protected by server-side authorization

**Admin Capabilities**
- View all users
- View all blog posts
- View all comments
- Delete any post
- Delete any comment
- Moderate inappropriate content

**Admin Dashboard Pages**
- `/admin`
- `/admin/posts`
- `/admin/comments`
- `/admin/users`

### 3.4 Roles & Permissions

**User**
- Create posts
- Comment on posts
- Delete own posts
- Delete own comments
- Cannot modify or delete others’ content

**Admin**
- Full moderation access
- Can delete any post or comment
- Can manage users

### 3.5 All API Endpoints (Enterprise-Grade)

**Authentication**
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/session
```

**Users**
```
GET    /api/users/me
GET    /api/admin/users        (admin only)
```

**Posts**
```
GET    /api/posts
       ?page=1&limit=10
       (sorted by commentCount DESC, createdAt DESC)

GET    /api/posts/:postId
POST   /api/posts              (authenticated)
PUT    /api/posts/:postId      (owner only)
DELETE /api/posts/:postId      (owner or admin)
```

**Comments**
```
GET    /api/posts/:postId/comments
POST   /api/posts/:postId/comments    (authenticated)
DELETE /api/comments/:commentId       (owner or admin)
```

**Admin APIs**
```
GET    /api/admin/posts
GET    /api/admin/comments
DELETE /api/admin/posts/:postId
DELETE /api/admin/comments/:commentId
```

## 4. Authentication & Authorization
- Users must be logged in to:
  - Create blog posts
  - Comment on posts
- Guests can only view posts and comments
- After successful login:
  - Show “Create Blog Post” button
  - Enable comment input on posts

## 5. Posts & Comments
- New blog posts must appear at the top
- Users can:
  - Create posts
  - Comment on posts
  - View all comments by clicking the comment count
- Comments are hidden by default and expand on click

## 6. Users & Roles

**User**
- Can create, edit, and delete their own posts
- Can delete their own comments

**Admin**
- Can delete any post or comment
- Users cannot modify or delete content created by others

## 7. Tech Stack
- **Frontend:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS (separate, reusable style files)
- **Backend:** Next.js API Routes
- **Database:** MongoDB Atlas
- **Authentication:** NextAuth
- **Hosting & Deployment:** Vercel + GitHub

## 8. Non-Functional Requirements
- Enterprise-level security
- Input validation (server & client)
- Proper error handling
- Role-based access control
- Clean architecture and scalability
- No hard-coded secrets
- Environment variables used correctly

## 9. Deliverables
- Complete project folder structure
- Full frontend code
  - Strict TypeScript typing
  - No TypeScript or IDE errors
- Full backend API implementation
- MongoDB schema and indexes
- Authentication & authorization flow explanation
- Step-by-step deployment guide (GitHub → Vercel → MongoDB Atlas)

## 10. Rules (Strict)
- Use clean, production-ready code
- Follow industry best practices
- No pseudo-code
- Clearly identify file paths
- Use professional Tailwind CSS styling
- Separate concerns (components, services, models, utils)
- If any requirement is unclear, ask before proceeding

