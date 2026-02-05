import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { requireAdmin } from "@/lib/adminAuth";
import { Post } from "@/types/post";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// DELETE /api/admin/comments/[id] - Admin delete any comment
export async function DELETE(req: Request, { params }: RouteContext) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id: commentId } = await params;
  const { postId } = await req.json();

  if (!postId) {
    return NextResponse.json(
      { ok: false, message: "postId is required" },
      { status: 400 },
    );
  }

  try {
    const client = await clientPromise;
    const db = client.db("blogpostdb");

    const result = await db
      .collection<Post>("posts")
      .updateOne({ _id: postId }, { $pull: { comments: { id: commentId } } });

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { ok: false, message: "Post not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete comment error:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to delete comment" },
      { status: 500 },
    );
  }
}
