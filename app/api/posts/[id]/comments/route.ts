import client from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { Comment } from "@/types/post";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // <--- Add await here
  const { author, content } = await req.json();

  if (!author || !content)
    return NextResponse.json({ ok: false, message: "Missing fields" }, { status: 400 });

  const newComment: Comment = {
    id: uuidv4(),
    author,
    content,
    createdAt: new Date().toISOString(),
  };

  await client.connect();
  const db = client.db("blogpostdb");

  await db.collection("posts").updateOne(
    { _id: id },
    { $push: { comments: newComment } }
  );

  return NextResponse.json({ ok: true });
}