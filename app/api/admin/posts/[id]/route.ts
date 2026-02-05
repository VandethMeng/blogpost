import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { requireAdmin } from "@/lib/adminAuth";
import { Post } from "@/types/post";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// DELETE /api/admin/posts/[id] - Admin delete any post
export async function DELETE(req: Request, { params }: RouteContext) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    const client = await clientPromise;
    const db = client.db("blogpostdb");

    const result = await db.collection<Post>("posts").deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { ok: false, message: "Post not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete post error:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to delete post" },
      { status: 500 },
    );
  }
}
