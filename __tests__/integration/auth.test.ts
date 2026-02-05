import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from "@jest/globals";
import request from "supertest";
import { setupTestDb, teardownTestDb, clearTestDb } from "../helpers/testDb";

const baseUrl = "http://localhost:3000";

describe("Auth API Routes", () => {
  beforeAll(async () => {
    await setupTestDb();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  beforeEach(async () => {
    await clearTestDb();
  });

  describe("POST /api/auth/signup", () => {
    it("should create a new user successfully", async () => {
      const response = await request(baseUrl).post("/api/auth/signup").send({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("ok", true);
      expect(response.body).toHaveProperty("user");
      expect(response.body.user).toHaveProperty("email", "test@example.com");
      expect(response.body.user).toHaveProperty("name", "Test User");
      expect(response.body.user).not.toHaveProperty("password");
    });

    it("should return 409 if email already exists", async () => {
      // Create first user
      await request(baseUrl).post("/api/auth/signup").send({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      });

      // Try to create duplicate
      const response = await request(baseUrl).post("/api/auth/signup").send({
        email: "test@example.com",
        password: "password456",
        name: "Another User",
      });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty("ok", false);
    });

    it("should return 400 if required fields are missing", async () => {
      const response = await request(baseUrl).post("/api/auth/signup").send({
        email: "test@example.com",
        // missing password and name
      });

      expect(response.status).toBe(400);
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      // Create a test user
      await request(baseUrl).post("/api/auth/signup").send({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      });
    });

    it("should login successfully with correct credentials", async () => {
      const response = await request(baseUrl).post("/api/auth/login").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("ok", true);
      expect(response.body).toHaveProperty("user");
      expect(response.body.user).toHaveProperty("email", "test@example.com");
    });

    it("should return 401 with incorrect password", async () => {
      const response = await request(baseUrl).post("/api/auth/login").send({
        email: "test@example.com",
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("ok", false);
    });

    it("should return 401 for non-existent user", async () => {
      const response = await request(baseUrl).post("/api/auth/login").send({
        email: "nonexistent@example.com",
        password: "password123",
      });

      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/auth/me", () => {
    it("should return user info when authenticated", async () => {
      // Signup and get cookie
      const signupRes = await request(baseUrl).post("/api/auth/signup").send({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      });

      const cookies = signupRes.headers["set-cookie"];

      const response = await request(baseUrl)
        .get("/api/auth/me")
        .set("Cookie", cookies);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("user");
      expect(response.body.user).toHaveProperty("email", "test@example.com");
    });

    it("should return 401 when not authenticated", async () => {
      const response = await request(baseUrl).get("/api/auth/me");

      expect(response.status).toBe(401);
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should logout successfully", async () => {
      // Signup first
      const signupRes = await request(baseUrl).post("/api/auth/signup").send({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      });

      const cookies = signupRes.headers["set-cookie"];

      const response = await request(baseUrl)
        .post("/api/auth/logout")
        .set("Cookie", cookies);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("ok", true);
    });
  });
});
