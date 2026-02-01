import clientPromise from "@/lib/mongodb"; // 1. Import the Promise
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { Comment, Post } from "@/types/post";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; 
  const { author, content } = await req.json();

  if (!author || !content) {
    return NextResponse.json({ ok: false, message: "Missing fields" }, { status: 400 });
  }

  const newComment: Comment = {
    id: uuidv4(),
    author,
    content,
    createdAt: new Date().toISOString(),
  };

  try {
    // 2. Await the promise to get the actual client
    const client = await clientPromise;
    const db = client.db("blogpostdb");

    // 3. Use 'id as any' to avoid the String vs ObjectId mismatch
    await db.collection<Post>("posts").updateOne(
      { _id: id },
      { $push: { comments: newComment } }
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Comment Error:", error);
    return NextResponse.json({ ok: false, message: "Database error" }, { status: 500 });
  }
}