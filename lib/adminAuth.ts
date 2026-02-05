import { getSession } from "./auth";
import { NextResponse } from "next/server";

/**
 * Middleware to check if the current user is an admin
 * Returns the session if user is admin, otherwise returns an error response
 */
export async function requireAdmin() {
  const session = await getSession();

  if (!session) {
    return {
      error: NextResponse.json(
        { ok: false, message: "Authentication required" },
        { status: 401 },
      ),
      session: null,
    };
  }

  if (session.role !== "admin") {
    return {
      error: NextResponse.json(
        { ok: false, message: "Admin access required" },
        { status: 403 },
      ),
      session: null,
    };
  }

  return { error: null, session };
}
