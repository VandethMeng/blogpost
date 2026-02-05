/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from "@jest/globals";
import request from "supertest";
import {
  setupTestDb,
  teardownTestDb,
  clearTestDb,
  getTestDb,
} from "../helpers/testDb";
import { v4 as uuidv4 } from "uuid";

const baseUrl = "http://localhost:3000";

describe("Posts API Routes", () => {
  let authCookie: string | string[];

  beforeAll(async () => {
    await setupTestDb();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  beforeEach(async () => {
    await clearTestDb();

    // Create and login a test user
    const signupRes = await request(baseUrl).post("/api/auth/signup").send({
      email: "test@example.com",
      password: "password123",
      name: "Test User",
    });

    authCookie = signupRes.headers["set-cookie"];
  });

  describe("GET /api/posts", () => {
    it("should return empty array when no posts exist", async () => {
      const response = await request(baseUrl).get("/api/posts");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("posts");
      expect(Array.isArray(response.body.posts)).toBe(true);
      expect(response.body.posts.length).toBe(0);
    });

    it("should return all posts sorted by createdAt descending", async () => {
      const db = getTestDb();
      const posts = db.collection("posts");

      // Create test posts
      await posts.insertMany([
        {
          _id: uuidv4() as any,
          title: "Post 1",
          content: "Content 1",
          author: "Author 1",
          createdAt: new Date("2024-01-01").toISOString(),
          comments: [],
        },
        {
          _id: uuidv4() as any,
          title: "Post 2",
          content: "Content 2",
          author: "Author 2",
          createdAt: new Date("2024-01-02").toISOString(),
          comments: [],
        },
      ] as any);

      const response = await request(baseUrl).get("/api/posts");

      expect(response.status).toBe(200);
      expect(response.body.posts.length).toBe(2);
      expect(response.body.posts[0].title).toBe("Post 2"); // Newer first
      expect(response.body.posts[1].title).toBe("Post 1");
    });

    it("should support pagination with skip and limit", async () => {
      const db = getTestDb();
      const posts = db.collection("posts");

      // Create 10 test posts
      const testPosts = Array.from({ length: 10 }, (_, i) => ({
        _id: uuidv4() as any,
        title: `Post ${i + 1}`,
        content: `Content ${i + 1}`,
        author: "Test Author",
        createdAt: new Date(
          `2024-01-${String(i + 1).padStart(2, "0")}`,
        ).toISOString(),
        comments: [],
      }));

      await posts.insertMany(testPosts as any);

      const response = await request(baseUrl).get("/api/posts?skip=5&limit=3");

      expect(response.status).toBe(200);
      expect(response.body.posts.length).toBe(3);
    });
  });

  describe("POST /api/posts", () => {
    it("should create a new post when authenticated", async () => {
      const response = await request(baseUrl)
        .post("/api/posts")
        .set("Cookie", authCookie as any)
        .send({
          title: "Test Post",
          content: "Test Content",
          author: "Test User",
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("ok", true);
      expect(response.body).toHaveProperty("postId");
    });

    it("should return 401 when not authenticated", async () => {
      const response = await request(baseUrl).post("/api/posts").send({
        title: "Test Post",
        content: "Test Content",
        author: "Test User",
      });

      expect(response.status).toBe(401);
    });

    it("should return 400 when required fields are missing", async () => {
      const response = await request(baseUrl)
        .post("/api/posts")
        .set("Cookie", authCookie as any)
        .send({
          title: "Test Post",
          // missing content and author
        });

      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/posts/[id]", () => {
    let postId: string;

    beforeEach(async () => {
      const db = getTestDb();
      const posts = db.collection("posts");

      postId = uuidv4();
      await posts.insertOne({
        _id: postId as any,
        title: "Test Post",
        content: "Test Content",
        author: "Test Author",
        createdAt: new Date().toISOString(),
        comments: [],
      } as any);
    });

    it("should return a single post by id", async () => {
      const response = await request(baseUrl).get(`/api/posts/${postId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("post");
      expect(response.body.post._id).toBe(postId);
      expect(response.body.post.title).toBe("Test Post");
    });

    it("should return 404 for non-existent post", async () => {
      const fakeId = uuidv4();
      const response = await request(baseUrl).get(`/api/posts/${fakeId}`);

      expect(response.status).toBe(404);
    });
  });

  describe("PUT /api/posts/[id]", () => {
    let postId: string;

    beforeEach(async () => {
      const db = getTestDb();
      const posts = db.collection("posts");

      postId = uuidv4();
      await posts.insertOne({
        _id: postId as any,
        title: "Original Title",
        content: "Original Content",
        author: "Test Author",
        createdAt: new Date().toISOString(),
        comments: [],
      } as any);
    });

    it("should update a post when authenticated", async () => {
      const response = await request(baseUrl)
        .put(`/api/posts/${postId}`)
        .set("Cookie", authCookie as any)
        .send({
          title: "Updated Title",
          content: "Updated Content",
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("ok", true);

      // Verify update
      const db = getTestDb();
      const updatedPost = await db
        .collection("posts")
        .findOne({ _id: postId as any });
      expect(updatedPost?.title).toBe("Updated Title");
      expect(updatedPost?.content).toBe("Updated Content");
    });

    it("should return 401 when not authenticated", async () => {
      const response = await request(baseUrl).put(`/api/posts/${postId}`).send({
        title: "Updated Title",
      });

      expect(response.status).toBe(401);
    });
  });

  describe("DELETE /api/posts/[id]", () => {
    let postId: string;

    beforeEach(async () => {
      const db = getTestDb();
      const posts = db.collection("posts");

      postId = uuidv4();
      await posts.insertOne({
        _id: postId as any,
        title: "Test Post",
        content: "Test Content",
        author: "Test Author",
        createdAt: new Date().toISOString(),
        comments: [],
      } as any);
    });

    it("should delete a post when authenticated", async () => {
      const response = await request(baseUrl)
        .delete(`/api/posts/${postId}`)
        .set("Cookie", authCookie as any);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("ok", true);

      // Verify deletion
      const db = getTestDb();
      const deletedPost = await db
        .collection("posts")
        .findOne({ _id: postId as any });
      expect(deletedPost).toBeNull();
    });

    it("should return 401 when not authenticated", async () => {
      const response = await request(baseUrl).delete(`/api/posts/${postId}`);

      expect(response.status).toBe(401);
    });
  });
});
