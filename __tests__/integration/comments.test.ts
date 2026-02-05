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

describe("Comments API Routes", () => {
  let authCookie: string | string[];
  let postId: string;

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

    // Create a test post
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

  describe("POST /api/posts/[id]/comments", () => {
    it("should add a comment when authenticated", async () => {
      const response = await request(baseUrl)
        .post(`/api/posts/${postId}/comments`)
        .set("Cookie", authCookie as any)
        .send({
          author: "Test Commenter",
          content: "This is a test comment",
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("ok", true);
      expect(response.body).toHaveProperty("comment");
      expect(response.body.comment).toHaveProperty("id");
      expect(response.body.comment.author).toBe("Test Commenter");
      expect(response.body.comment.content).toBe("This is a test comment");
    });

    it("should return 401 when not authenticated", async () => {
      const response = await request(baseUrl)
        .post(`/api/posts/${postId}/comments`)
        .send({
          author: "Test Commenter",
          content: "Test comment",
        });

      expect(response.status).toBe(401);
    });

    it("should return 400 when required fields are missing", async () => {
      const response = await request(baseUrl)
        .post(`/api/posts/${postId}/comments`)
        .set("Cookie", authCookie as any)
        .send({
          author: "Test Commenter",
          // missing content
        });

      expect(response.status).toBe(400);
    });

    it("should return 404 for non-existent post", async () => {
      const fakePostId = uuidv4();

      const response = await request(baseUrl)
        .post(`/api/posts/${fakePostId}/comments`)
        .set("Cookie", authCookie as any)
        .send({
          author: "Test Commenter",
          content: "Test comment",
        });

      expect(response.status).toBe(404);
    });

    it("should store comment in post document", async () => {
      const response = await request(baseUrl)
        .post(`/api/posts/${postId}/comments`)
        .set("Cookie", authCookie as any)
        .send({
          author: "Test Commenter",
          content: "Test comment",
        });

      expect(response.status).toBe(200);

      // Verify comment is in database
      const db = getTestDb();
      const post = await db.collection("posts").findOne({ _id: postId as any });

      expect(post?.comments).toBeDefined();
      expect(Array.isArray(post?.comments)).toBe(true);
      expect(post?.comments?.length).toBe(1);
      expect(post?.comments?.[0].author).toBe("Test Commenter");
      expect(post?.comments?.[0].content).toBe("Test comment");
    });
  });

  describe("DELETE /api/posts/[id]/comments", () => {
    let commentId: string;

    beforeEach(async () => {
      // Add a comment to the post
      const db = getTestDb();
      const posts = db.collection("posts");

      commentId = uuidv4();
      await posts.updateOne(
        { _id: postId as any },
        {
          $push: {
            comments: {
              id: commentId,
              author: "Test Commenter",
              content: "Test comment",
              createdAt: new Date().toISOString(),
            },
          } as any,
        },
      );
    });

    it("should delete a comment when authenticated", async () => {
      const response = await request(baseUrl)
        .delete(`/api/posts/${postId}/comments`)
        .set("Cookie", authCookie as any)
        .send({ commentId });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("ok", true);

      // Verify deletion
      const db = getTestDb();
      const post = await db.collection("posts").findOne({ _id: postId as any });

      expect(post?.comments).toBeDefined();
      expect(post?.comments?.length).toBe(0);
    });

    it("should return 401 when not authenticated", async () => {
      const response = await request(baseUrl)
        .delete(`/api/posts/${postId}/comments`)
        .send({ commentId });

      expect(response.status).toBe(401);
    });

    it("should return 400 when commentId is missing", async () => {
      const response = await request(baseUrl)
        .delete(`/api/posts/${postId}/comments`)
        .set("Cookie", authCookie as any)
        .send({});

      expect(response.status).toBe(400);
    });

    it("should return 404 for non-existent post", async () => {
      const fakePostId = uuidv4();

      const response = await request(baseUrl)
        .delete(`/api/posts/${fakePostId}/comments`)
        .set("Cookie", authCookie as any)
        .send({ commentId });

      expect(response.status).toBe(404);
    });
  });
});
