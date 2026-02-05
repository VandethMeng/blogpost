import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { requireAdmin } from "@/lib/adminAuth";
import { Post, Comment } from "@/types/post";

export const dynamic = "force-dynamic";

// GET /api/admin/comments - List all comments from all posts
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const client = await clientPromise;
    const db = client.db("blogpostdb");

    // Get all posts with comments
    const posts = await db
      .collection<Post>("posts")
      .find({ comments: { $exists: true, $ne: [] } })
      .project({ _id: 1, title: 1, comments: 1 })
      .toArray();

    // Flatten comments with post info
    const allComments = posts.flatMap((post) =>
      (post.comments || []).map((comment: Comment) => ({
        ...comment,
        postId: post._id,
        postTitle: post.title,
      })),
    );

    // Sort by newest first
    allComments.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return NextResponse.json({ ok: true, data: allComments });
  } catch (error) {
    console.error("Get comments error:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to fetch comments" },
      { status: 500 },
    );
  }
}
