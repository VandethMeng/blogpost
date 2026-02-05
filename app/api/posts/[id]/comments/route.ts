import clientPromise from "@/lib/mongodb"; // 1. Import the Promise
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { Comment, Post } from "@/types/post";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { content } = await req.json();

  // Check authentication
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, message: "Must be logged in to add a comment" },
      { status: 401 },
    );
  }

  // Check if user is blocked
  if (session.blocked) {
    return NextResponse.json(
      { ok: false, message: "Your account is blocked from commenting" },
      { status: 403 },
    );
  }

  if (!content) {
    return NextResponse.json(
      { ok: false, message: "Missing content" },
      { status: 400 },
    );
  }

  const newComment: Comment = {
    id: uuidv4(),
    author: String(session.username), // Use logged-in user's username
    content,
    createdAt: new Date().toISOString(),
  };

  try {
    // 2. Await the promise to get the actual client
    const client = await clientPromise;
    const db = client.db("blogpostdb");

    // 3. Use 'id as any' to avoid the String vs ObjectId mismatch
    await db
      .collection<Post>("posts")
      .updateOne({ _id: id }, { $push: { comments: newComment } });

    return NextResponse.json({ ok: true, data: newComment });
  } catch (error) {
    console.error("Comment Error:", error);
    return NextResponse.json(
      { ok: false, message: "Database error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { commentId } = await req.json();

  // Check authentication
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, message: "Must be logged in to delete a comment" },
      { status: 401 },
    );
  }

  if (!commentId) {
    return NextResponse.json(
      { ok: false, message: "Missing commentId" },
      { status: 400 },
    );
  }

  try {
    const client = await clientPromise;
    const db = client.db("blogpostdb");

    // Check if comment exists and user owns it
    const post = await db.collection<Post>("posts").findOne({ _id: id });

    if (!post) {
      return NextResponse.json(
        { ok: false, message: "Post not found" },
        { status: 404 },
      );
    }

    const comment = post.comments?.find((c) => c.id === commentId);

    if (!comment) {
      return NextResponse.json(
        { ok: false, message: "Comment not found" },
        { status: 404 },
      );
    }

    // Only owner or admin can delete
    if (comment.author !== session.username && session.role !== "admin") {
      return NextResponse.json(
        { ok: false, message: "Not authorized to delete this comment" },
        { status: 403 },
      );
    }

    await db
      .collection<Post>("posts")
      .updateOne({ _id: id }, { $pull: { comments: { id: commentId } } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete Comment Error:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to delete comment" },
      { status: 500 },
    );
  }
}
