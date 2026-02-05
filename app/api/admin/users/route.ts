import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { requireAdmin } from "@/lib/adminAuth";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";

// GET /api/admin/users - List all users
export async function GET() {
  const { error, session } = await requireAdmin();
  if (error) return error;

  try {
    const client = await clientPromise;
    const db = client.db("blogpostdb");

    const users = await db
      .collection("users")
      .find({}, { projection: { password: 0 } }) // Exclude password
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ ok: true, data: users });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to fetch users" },
      { status: 500 },
    );
  }
}

// POST /api/admin/users - Create new user (admin only)
export async function POST(request: Request) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const { email, username, password, role = "user" } = body;

    // Validation
    if (!email || !username || !password) {
      return NextResponse.json(
        { ok: false, message: "Email, username, and password are required" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { ok: false, message: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    if (!["user", "admin"].includes(role)) {
      return NextResponse.json(
        { ok: false, message: "Role must be 'user' or 'admin'" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("blogpostdb");

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return NextResponse.json(
        {
          ok: false,
          message: "User with this email or username already exists",
        },
        { status: 409 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = {
      _id: uuidv4(),
      email,
      username,
      password: hashedPassword,
      role,
      blocked: false,
      createdAt: new Date().toISOString(),
    };

    await db.collection("users").insertOne(newUser);

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(
      { ok: true, data: userWithoutPassword },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to create user" },
      { status: 500 },
    );
  }
}
