import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { setSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, message: "Missing email or password" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("blogpostdb");

    // Find user
    const user = await db.collection("users").findOne({ email });

    if (!user) {
      return NextResponse.json(
        { ok: false, message: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Compare password
    const hashedPassword = await hashPassword(password);
    if (user.password !== hashedPassword) {
      return NextResponse.json(
        { ok: false, message: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Set session
    await setSession({
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
      role: user.role,
      blocked: user.blocked || false,
    });

    return NextResponse.json({
      ok: true,
      data: {
        userId: user._id.toString(),
        email: user.email,
        username: user.username,
        role: user.role,
        blocked: user.blocked || false,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { ok: false, message: "Login failed" },
      { status: 500 },
    );
  }
}
