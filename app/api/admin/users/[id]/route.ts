import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { requireAdmin } from "@/lib/adminAuth";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// PATCH /api/admin/users/[id] - Update user (block/unblock or edit profile)
export async function PATCH(req: Request, { params }: RouteContext) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const { blocked, email, username, password, role } = body;

  try {
    const client = await clientPromise;
    const db = client.db("blogpostdb");

    // Prevent admin from modifying themselves in certain ways
    if (id === session?.userId) {
      if (blocked !== undefined) {
        return NextResponse.json(
          { ok: false, message: "Cannot block yourself" },
          { status: 400 },
        );
      }
      if (role && role !== "admin") {
        return NextResponse.json(
          { ok: false, message: "Cannot change your own admin role" },
          { status: 400 },
        );
      }
    }

    // Build update object
    const updateFields: Record<string, any> = {}; // eslint-disable-line

    // Block/unblock operation
    if (blocked !== undefined) {
      if (typeof blocked !== "boolean") {
        return NextResponse.json(
          { ok: false, message: "blocked must be a boolean" },
          { status: 400 },
        );
      }
      updateFields.blocked = blocked;
    }

    // Edit profile operation
    if (email !== undefined) {
      // Check if email already exists (excluding current user)
      const existingEmail = await db.collection("users").findOne({
        email,
        _id: { $ne: id as any }, // eslint-disable-line
      });
      if (existingEmail) {
        return NextResponse.json(
          { ok: false, message: "Email already in use" },
          { status: 409 },
        );
      }
      updateFields.email = email;
    }

    if (username !== undefined) {
      // Check if username already exists (excluding current user)
      const existingUsername = await db.collection("users").findOne({
        username,
        _id: { $ne: id as any }, // eslint-disable-line
      });
      if (existingUsername) {
        return NextResponse.json(
          { ok: false, message: "Username already in use" },
          { status: 409 },
        );
      }
      updateFields.username = username;
    }

    if (password !== undefined && password.length > 0) {
      if (password.length < 6) {
        return NextResponse.json(
          { ok: false, message: "Password must be at least 6 characters" },
          { status: 400 },
        );
      }
      updateFields.password = await bcrypt.hash(password, 10);
    }

    if (role !== undefined) {
      if (!["user", "admin"].includes(role)) {
        return NextResponse.json(
          { ok: false, message: "Role must be 'user' or 'admin'" },
          { status: 400 },
        );
      }
      updateFields.role = role;
    }

    // Check if there's anything to update
    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json(
        { ok: false, message: "No fields to update" },
        { status: 400 },
      );
    }

    const result = await db.collection("users").updateOne(
      { _id: id as any }, // eslint-disable-line
      { $set: updateFields },
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { ok: false, message: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to update user" },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/users/[id] - Delete user (optional, for full admin control)
export async function DELETE(req: Request, { params }: RouteContext) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    const client = await clientPromise;
    const db = client.db("blogpostdb");

    // Prevent admin from deleting themselves
    if (id === session?.userId) {
      return NextResponse.json(
        { ok: false, message: "Cannot delete yourself" },
        { status: 400 },
      );
    }

    const result = await db.collection("users").deleteOne({ _id: id as any }); // eslint-disable-line

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { ok: false, message: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to delete user" },
      { status: 500 },
    );
  }
}
