import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { v4 as uuidv4 } from "uuid";
import { setSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Simple hash function (for production, use bcrypt)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function POST(req: Request) {
  try {
    const { email, username, password } = await req.json();

    if (!email || !username || !password) {
      return NextResponse.json(
        { ok: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { ok: false, message: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("blogpostdb");

    // Check if user exists
    const existingUser = await db
      .collection("users")
      .findOne({ $or: [{ email }, { username }] });

    if (existingUser) {
      return NextResponse.json(
        { ok: false, message: "Email or username already exists" },
        { status: 409 },
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = {
      _id: uuidv4(),
      email,
      username,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      role: "user",
      blocked: false,
    };

    await db.collection<typeof newUser>("users").insertOne(newUser);

    // Set session
    await setSession({
      userId: newUser._id,
      email: newUser.email,
      username: newUser.username,
      role: newUser.role,
      blocked: newUser.blocked,
    });

    return NextResponse.json({
      ok: true,
      data: {
        userId: newUser._id,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role,
        blocked: newUser.blocked,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { ok: false, message: "Signup failed" },
      { status: 500 },
    );
  }
}
