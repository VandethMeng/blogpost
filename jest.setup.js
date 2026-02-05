import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";
import crypto from "crypto";

// Polyfill for Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Setup crypto for Node.js (Web Crypto API)
if (!global.crypto) {
  global.crypto = crypto.webcrypto;
}

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: "/",
    query: {},
    asPath: "/",
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock jose library to avoid ESM issues
jest.mock("jose", () => ({
  jwtVerify: jest.fn().mockResolvedValue({
    payload: { userId: "test-user-id", email: "test@example.com" },
  }),
  SignJWT: jest.fn().mockImplementation(() => ({
    setProtectedHeader: jest.fn().mockReturnThis(),
    setExpirationTime: jest.fn().mockReturnThis(),
    sign: jest.fn().mockResolvedValue("mock-jwt-token"),
  })),
}));
