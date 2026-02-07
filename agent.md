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
- Protected by server-side authorization (`requireAdmin` middleware)

**Admin Capabilities**

- View all users with their details (username, email, role, blocked status)
- View all blog posts with author information
- View all comments with post context
- Delete any post
- Delete any comment
- **Block/Unblock users** (blocked users cannot create posts or comments)
- Delete users (with cascading deletion of their content)
- Moderate inappropriate content

**Admin Dashboard Pages**

- `/admin` - Dashboard with user/post/comment stats
- `/admin/posts` - Post management with delete capability
- `/admin/comments` - Comment management with delete capability
- `/admin/users` - User management with block/unblock and delete capabilities

### 3.4 Roles & Permissions

**User** (role: "user")

- Create posts (if not blocked)
- Comment on posts (if not blocked)
- Edit own posts
- Delete own posts
- Delete own comments
- Cannot modify or delete others' content

**Admin** (role: "admin")

- Full moderation access
- Can delete any post or comment
- Can manage users (block/unblock/delete)
- Cannot be blocked
- Access to `/admin/*` pages

**Blocked Users**

- Can view posts and comments
- **Cannot create posts** (API returns 403)
- **Cannot add comments** (API returns 403)
- Can still delete their own existing content

### 3.5 All API Endpoints (Enterprise-Grade)

**Authentication**

```
POST   /api/auth/signup         - Create new user account
POST   /api/auth/login          - Login and receive JWT token (httpOnly cookie)
POST   /api/auth/logout         - Clear session token
GET    /api/auth/me             - Get current user session
```

**Posts**

```
GET    /api/posts               - List all posts (sorted by createdAt DESC)
                                  Returns posts with embedded comments
GET    /api/posts/[id]          - Get single post with all comments
POST   /api/posts               - Create new post (authenticated, not blocked)
PUT    /api/posts/[id]          - Update post (owner only)
DELETE /api/posts/[id]          - Delete post (owner or admin)
```

**Comments** (embedded in posts)

```
POST   /api/posts/[id]/comments    - Add comment to post (authenticated, not blocked)
DELETE /api/posts/[id]/comments    - Delete comment by id (owner or admin)
                                     Query param: ?commentId=xxx
```

**Admin APIs** (require admin role via requireAdmin middleware)

```
GET    /api/admin/users              - List all users
PUT    /api/admin/users/[id]         - Block/unblock user
                                       Body: { "blocked": true/false }
DELETE /api/admin/users/[id]         - Delete user account

GET    /api/admin/posts              - List all posts with author info
DELETE /api/admin/posts/[id]         - Delete any post (admin only)

GET    /api/admin/comments           - List all comments with post context
DELETE /api/admin/comments/[id]      - Delete any comment (admin only)
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

- **Frontend:** Next.js 16 (App Router) + TypeScript (strict mode)
- **Styling:** Tailwind CSS with utility classes
  - JWT tokens in httpOnly cookies
  - Password hashing with bcrypt
  - Server-side session validation
  - Admin route protection with `requireAdmin` middleware
- Input validation (server & client)
- Proper error handling with JSON responses
- Role-based access control (user/admin)
- User blocking system to prevent spam/abuse
- Clean architecture and scalability
  - Reusable auth utilities (`lib/auth.ts`, `lib/adminAuth.ts`)
  - Type-safe with TypeScript interfaces
  - MongoDB singleton connection with dev caching
- No hard-coded secrets
- Environment variables used correctly:
  - `MONGODB_URI` - MongoDB connection string
  - `JWT_SECRET` - JWT signing secret
  - `NEXT_PUBLIC_BASE_URL` - Base URL for API callsitHub

  - `/app` - Next.js App Router pages and API routes
  - `/app/components` - React client components
  - `/app/api/auth` - Authentication endpoints
  - `/app/api/posts` - Post CRUD operations
  - `/app/api/admin` - Admin-only endpoints
  - `/lib` - Utility functions (MongoDB, auth, adminAuth)
  - `/types` - TypeScript type definitions (post.d.ts, user.d.ts)

- Full frontend code
  - Strict TypeScript typing with no errors
  - Client components with "use client" directive
  - Server components for data fetching
  - Icon buttons with Heroicons
- Full backend API implementation
  - JWT authentication with jose
  - MongoDB queries with UUID strings as \_id
  - Role-based authorization middleware
  - User blocking system
- MongoDB schema
  - Users: `{ _id: string, email, username, password, role, blocked?, createdAt }`
  - Posts: `{ _id: string, title, content, author, createdAt, comments: Comment[] }`
  - Comments embedded: `{ id: string, author, content, createdAt }`
- Authentication & authorization flow
  - Signup → hash password → create user → return JWT
  - Login → verify password → return JWT in httpOnly cookie
  - Protected routes check session and role
- Admin dashboard with user blockutilities, types)
- Server components for data fetching with `cache: "no-store"`
- Client components for interactivity with "use client"
- All data-mutating API routes must export `export const dynamic = "force-dynamic"`
- MongoDB connection via singleton pattern (`lib/mongodb.ts`)
- UUID strings for \_id fields (not MongoDB ObjectId)
- Comments embedded in posts array (not separate collection)
- Type assertions with `as any` for MongoDB UUID queries (with eslint-disable)
- Password hashing with bcrypt (10 rounds)
- JWT tokens with 30-day expiration in httpOnly cookies
- Admin routes must use `requireAdmin` middleware
- Blocked users return 403 on post/comment creation
- If any requirement is unclear, ask before proceeding

## 11. Key Implementation Notes

### Data Model

- **Posts**: Stored with embedded comments array
- **Users**: Separate collection with role and blocked fields
- **IDs**: Use UUID v4 strings, not MongoDB ObjectId
- **Timestamps**: ISO strings via `new Date().toISOString()`

### Authentication Flow

1. User signs up → password hashed with bcrypt → stored in MongoDB
2. User logs in → password verified → JWT token created with jose
3. Token stored in httpOnly cookie (secure, 30-day expiration)
4. Protected routes call `getSession()` to verify token
5. Admin routes additionally check `role === "admin"`

### Component Architecture

- `page.tsx` - Server component, fetches initial data from database
- `BlogClientWrapper` - Client wrapper managing posts state
- `PostItem` - Displays post with edit/delete buttons (owner/admin only)
- `CommentForm` - Add comment form (only when logged in and comments visible)
- `CommentItem` - Display comment with delete button (owner/admin only)
- `PostForm` - Create/edit post form (only when logged in and not blocked)
- `UserNav` - Navigation showing username, admin button, logout
- `AuthForm` - Reusable login/signup form

### Deployment Checklist

1. Set environment variables in Vercel:
   - `MONGODB_URI` (MongoDB Atlas connection string)
   - `JWT_SECRET` (random 32+ character string)
   - `NEXT_PUBLIC_BASE_URL` (e.g., https://yourdomain.vercel.app)
2. Connect GitHub repository to Vercel
3. Deploy automatically on push to main branch
4. Create admin user manually in MongoDB:
   ```javascript
   db.users.updateOne(
     { email: "youremail@example.com" },
     { $set: { role: "admin" } },
   );
   ```
5. Test admin dashboard access and functionality

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
