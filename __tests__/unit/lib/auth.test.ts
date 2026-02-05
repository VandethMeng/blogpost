import { describe, it, expect } from "@jest/globals";
import { hashPassword, verifyPassword } from "@/lib/auth";

describe("auth utilities", () => {
  describe("hashPassword", () => {
    it("should hash a password", async () => {
      const password = "testPassword123";
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBe(64); // SHA-256 produces 64 character hex string
    });

    it("should produce different hashes for different passwords", async () => {
      const password1 = "password1";
      const password2 = "password2";

      const hash1 = await hashPassword(password1);
      const hash2 = await hashPassword(password2);

      expect(hash1).not.toBe(hash2);
    });

    it("should produce consistent hashes for the same password", async () => {
      const password = "testPassword123";

      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).toBe(hash2);
    });
  });

  describe("verifyPassword", () => {
    it("should return true for matching password", async () => {
      const password = "testPassword123";
      const hash = await hashPassword(password);

      const result = await verifyPassword(password, hash);

      expect(result).toBe(true);
    });

    it("should return false for non-matching password", async () => {
      const password = "testPassword123";
      const wrongPassword = "wrongPassword";
      const hash = await hashPassword(password);

      const result = await verifyPassword(wrongPassword, hash);

      expect(result).toBe(false);
    });

    it("should be case sensitive", async () => {
      const password = "TestPassword";
      const hash = await hashPassword(password);

      const result = await verifyPassword("testpassword", hash);

      expect(result).toBe(false);
    });
  });
});
