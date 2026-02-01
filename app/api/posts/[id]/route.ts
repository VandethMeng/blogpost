import client from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { Post } from "@/types/post";

// Notice the Promise type in the arguments
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // <--- Add await here
  const body = await req.json();
  
  await client.connect();
  const db = client.db("blogpostdb");

  await db.collection<Post>("posts").updateOne(
    { _id: id },
    { $set: { title: body.title, content: body.content, author: body.author } }
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // <--- Add await here
  
  await client.connect();
  const db = client.db("blogpostdb");

  await db.collection<Post>("posts").deleteOne({ _id: id });
  return NextResponse.json({ ok: true });
}