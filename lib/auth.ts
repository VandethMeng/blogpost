import { jwtVerify, SignJWT, JWTPayload } from "jose";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production",
);

const SESSION_COOKIE_NAME = "auth-token";

export interface SessionPayload extends JWTPayload {
  userId: string;
  email: string;
  username: string;
  role: string;
  blocked?: boolean;
}

export async function createToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(secret);
}

export async function verifyToken(token: string) {
  try {
    const verified = await jwtVerify(token, secret);
    return verified.payload;
  } catch {
    return null;
  }
}

export async function getSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) return null;

    const session = await verifyToken(token);
    return session;
  } catch {
    return null;
  }
}

export async function setSession(payload: SessionPayload) {
  const token = await createToken(payload);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: "/",
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

// Password hashing utilities
export async function hashPassword(password: string): Promise<string> {
  // Check if we're in Node.js environment (for testing)
  if (typeof globalThis.crypto === "undefined" || !globalThis.crypto.subtle) {
    // Fallback to Node.js crypto module
    const nodeCrypto = await import("crypto");
    return nodeCrypto.createHash("sha256").update(password).digest("hex");
  }

  // Use Web Crypto API (browser/Edge runtime)
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  const hashedInput = await hashPassword(password);
  return hashedInput === hash;
}
