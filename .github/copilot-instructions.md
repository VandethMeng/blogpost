# Copilot Instructions for Blog Post Application

## Project Overview

Enterprise-grade blog application built with **Next.js 16**, **MongoDB**, **TypeScript**, and **Tailwind CSS**. Supports public post browsing, authenticated post/comment creation, and admin moderation.

## Architecture & Data Model

### Core Concepts

- **Posts**: Stored in MongoDB with `_id` (UUID), title, content, author, createdAt, and nested comments array
- **Comments**: Embedded within posts (not separate collection) - each with id, author, content, createdAt
- **Server/Client Split**: Server-side data fetching in `page.tsx` using `force-dynamic` to prevent caching; client-side state management in `BlogClientWrapper` for interactivity

### Key Type Definitions (types/post.d.ts)

```typescript
type Post = {
  _id: string;
  title;
  content;
  author;
  createdAt;
  comments?: Comment[];
};
type Comment = { id; author; content; createdAt };
```

## Critical Development Patterns

### 1. MongoDB Connection (lib/mongodb.ts)

- **Pattern**: Reusable singleton with development-mode caching to global object
- **Important**: Must check `process.env.MONGODB_URI` at module load time
- **Usage**: `const client = await clientPromise; const db = client.db("blogpostdb")`
- **Database**: `blogpostdb` with collections: `posts`, `users`, `comments`

### 2. API Route Dynamic Behavior

- **CRITICAL**: Add `export const dynamic = "force-dynamic"` to all data-mutating routes and GET endpoints that need fresh data
- **Reason**: Prevents Next.js caching stale post/comment data
- **Examples**: `app/api/posts/route.ts`, `app/api/posts/[id]/route.ts`

### 3. Server-Side Data Fetching

- **Pattern**: Fetch posts in `page.tsx` server component with `cache: "no-store"` to bypass Next.js cache
- **Timestamp trick**: Add `?t=${Date.now()}` query param to force browser refresh
- **Pass to client**: Initial data flows via `initialPosts` prop to `BlogClientWrapper`

### 4. Client Components

- **Mark with "use client"**: Required for interactive features (state, event handlers)
- **Key files**: `BlogClientWrapper` (state mgmt), `PostItem` (post display + edit/delete), `CommentForm`, `CommentItem`
- **State pattern**: Parents manage posts array; children receive `refreshPosts` callback to trigger data refetch

## API Endpoints

### Posts

- `GET /api/posts` - List all posts (sorted by createdAt descending)
- `POST /api/posts` - Create new post `{ title, author, content }`
- `GET /api/posts/[id]` - Get single post with comments
- `PUT/DELETE /api/posts/[id]` - Update/delete post

### Comments

- `POST /api/posts/[id]/comments` - Add comment `{ author, content }`
- `DELETE /api/posts/[id]/comments` - Delete comment by id

## Authentication & Authorization

**Current State**: Author is a simple string; no auth middleware yet.

**When Implementing Auth**:

- Add `users` collection with `{ _id, email, password, role }` (role: "user" | "admin")
- Create `app/middleware.ts` to protect admin routes (`/admin/*`)
- Store user ID in session/token; fetch user role server-side before operations
- Add `userId` field to posts/comments to track ownership
- Implement authorization checks:
  - **Delete own post**: Check `post.userId === currentUserId`
  - **Delete any post (admin)**: Check `currentUser.role === "admin"`
  - Similar pattern for comments

**Admin Dashboard** (when ready):

- `/admin` - Users list with role management
- `/admin/posts` - All posts with delete/moderation
- `/admin/comments` - All comments with delete capability
- Use same MongoDB data; add role-based API checks

## Post Sorting & Pagination

**Current Implementation**:

- Posts sorted by `createdAt` descending (newest first)
- No pagination yet—loads all posts

**Future Enhancement Pattern**:

- **Sorting rules** (from agent.md):
  1. Most comments → fewest comments (descending)
  2. Equal comments? Sort by createdAt descending (newest first)
- **Pagination**: "See More" button loading 10 posts per batch
  - Use cursor-based (by `_id`) or page-based (`skip`/`limit`)
  - Update `GET /api/posts` to accept `?skip=0&limit=10` params
  - Client-side: append new posts to array, show "See More" if more exist
  - Example: `const posts = await db.collection("posts").find({}).sort({ commentCount: -1, createdAt: -1 }).skip(skip).limit(limit).toArray()`

## Key Conventions

- **UUID for IDs**: Use `uuid` package (`import { v4 as uuidv4 } from "uuid"`)
- **Timestamps**: ISO strings (`new Date().toISOString()`)
- **Error handling**: Return `{ ok: false, message?: string }` with HTTP 500 for failures
- **Styling**: Tailwind with utility classes (bg-_, text-_, px-_, py-_, rounded, shadow, etc.)
- **TypeScript**: Always type function parameters and return values; use `Post` and `Comment` types

## Build & Execution

```bash
npm run dev       # Start dev server on :3000
npm run build     # Production build
npm run lint      # Run ESLint
npm start         # Run production build
```

**Development Tips**:

- Set `MONGODB_URI` env var (MongoDB connection string)
- Set `NEXT_PUBLIC_BASE_URL` for API calls (defaults to http://localhost:3000)
- Hot reload works for `.tsx`, `.ts`, CSS changes
- Check browser console and terminal for fetch/MongoDB errors

## Deployment

**Environment Variables** (set in `.env.local` locally, or platform dashboard for production):

```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/blogpostdb
NEXT_PUBLIC_BASE_URL=https://yourdomain.com  # Required for server-side fetch in page.tsx
```

**Vercel Deployment** (recommended):

1. Push code to GitHub
2. Connect repo in Vercel dashboard
3. Add `MONGODB_URI` in project Settings → Environment Variables
4. Deploy automatically on push to `main`
5. Preview URLs auto-generated for PRs

**Local Testing Before Deploy**:

```bash
npm run build    # Test production build locally
npm start        # Run production server on :3000
```

**MongoDB Atlas Setup** (if using cloud):

- Create cluster at mongodb.com
- Generate connection string with IP whitelist (or allow 0.0.0.0 for development)
- Use connection string as `MONGODB_URI`
- Database name must be `blogpostdb`

**Production Checks**:

- Ensure `force-dynamic` exports are present on all data-mutating routes
- Verify MongoDB indexes on `createdAt` and `author` for query performance
- Set secure environment variables (never commit secrets)
- Monitor logs via Vercel or MongoDB Atlas dashboards

## When Adding Features

1. **New API endpoint**: Create in `app/api/`, add `force-dynamic` export, connect to MongoDB via `clientPromise`
2. **New component**: Use "use client" if interactive; import types from `@/types`
3. **Database queries**: Always use `db.collection<Type>().find()` with TypeScript generics
4. **Frontend state**: Manage in parent component (e.g., `BlogClientWrapper`), pass callbacks to children
5. **Error handling**: Catch and log exceptions; return JSON error responses with 5xx status codes

## Important Files Reference

| File                                   | Purpose                                     |
| -------------------------------------- | ------------------------------------------- |
| `lib/mongodb.ts`                       | MongoDB singleton connection                |
| `types/post.d.ts`                      | Post/Comment type definitions               |
| `app/page.tsx`                         | Server-side homepage; fetches initial posts |
| `app/components/BlogClientWrapper.tsx` | Main client state manager                   |
| `app/api/posts/route.ts`               | GET/POST posts endpoints                    |
| `app/layout.tsx`                       | Root layout; metadata & fonts               |
| `globals.css`                          | Tailwind directives                         |

## Known Constraints

- Comments stored as array inside posts (not normalized) - efficient for read-heavy workloads
- No explicit user/auth tables yet (author is just a string)
- Client components must be wrapped carefully to avoid hydration mismatches
