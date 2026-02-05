import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { requireAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

// GET /api/admin/posts - List all posts for admin
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const client = await clientPromise;
    const db = client.db("blogpostdb");

    const posts = await db
      .collection("posts")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ ok: true, data: posts });
  } catch (error) {
    console.error("Get posts error:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to fetch posts" },
      { status: 500 },
    );
  }
}
