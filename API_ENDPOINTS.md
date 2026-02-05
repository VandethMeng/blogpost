# Blog Post API Endpoints

## Base URL
```
http://localhost:3000/api
```

## Endpoints

### Posts

#### GET /posts
Fetch all posts (sorted by createdAt descending)

**Response:**
```json
{
  "ok": true,
  "data": [
    {
      "_id": "uuid",
      "title": "Post Title",
      "content": "Post content",
      "author": "Author Name",
      "createdAt": "2026-02-04T12:00:00.000Z",
      "comments": []
    }
  ]
}
```

---

#### POST /posts
Create a new post

**Request Body:**
```json
{
  "title": "Post Title",
  "content": "Post content",
  "author": "Author Name"
}
```

**Validation:** All fields (title, author, content) are required

**Response:**
```json
{
  "ok": true,
  "data": {
    "_id": "uuid",
    "title": "Post Title",
    "content": "Post content",
    "author": "Author Name",
    "createdAt": "2026-02-04T12:00:00.000Z",
    "comments": []
  }
}
```

---

#### GET /posts/[id]
Fetch a single post with all its comments

**Response:**
```json
{
  "ok": true,
  "data": {
    "_id": "uuid",
    "title": "Post Title",
    "content": "Post content",
    "author": "Author Name",
    "createdAt": "2026-02-04T12:00:00.000Z",
    "comments": [
      {
        "id": "uuid",
        "author": "Commenter Name",
        "content": "Comment text",
        "createdAt": "2026-02-04T13:00:00.000Z"
      }
    ]
  }
}
```

---

#### PATCH /posts/[id]
Update a post

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated content",
  "author": "Author Name"
}
```

**Validation:** All fields (title, author, content) are required

**Response:**
```json
{
  "ok": true
}
```

---

#### DELETE /posts/[id]
Delete a post

**Response:**
```json
{
  "ok": true
}
```

---

### Comments

#### POST /posts/[id]/comments
Add a comment to a post

**Request Body:**
```json
{
  "author": "Commenter Name",
  "content": "Comment text"
}
```

**Validation:** Both author and content are required

**Response:**
```json
{
  "ok": true,
  "data": {
    "id": "uuid",
    "author": "Commenter Name",
    "content": "Comment text",
    "createdAt": "2026-02-04T13:00:00.000Z"
  }
}
```

---

#### DELETE /posts/[id]/comments
Delete a comment from a post

**Request Body:**
```json
{
  "commentId": "comment-uuid"
}
```

**Validation:** commentId is required

**Response:**
```json
{
  "ok": true
}
```

---

## Error Responses

### 400 Bad Request
Missing or invalid required fields

```json
{
  "ok": false,
  "message": "Missing required fields"
}
```

### 404 Not Found
Post or resource not found

```json
{
  "ok": false,
  "message": "Post not found"
}
```

### 500 Internal Server Error
Database or server error

```json
{
  "ok": false,
  "message": "Failed to update"
}
```

---

## Notes

- All timestamps use ISO 8601 format (`YYYY-MM-DDTHH:mm:ss.sssZ`)
- All POST/PATCH requests require `Content-Type: application/json` header
- Comments are embedded in posts, not separate database documents
- Comment IDs and Post IDs are UUIDs (v4)
