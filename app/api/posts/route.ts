import clientPromise from "@/lib/mongodb"; // Make sure this matches your lib file export
import { NextResponse } from "next/server";
import { Post } from "@/types/post";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic"; // <--- Add this!

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("blogpostdb");
    const posts = await db.collection("posts").find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json({ ok: true, data: posts });
  } catch (e) {
    console.log(e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { title, author, content } = await req.json();
    const client = await clientPromise;
    const db = client.db("blogpostdb");

    const newPost: Post = {
      _id: uuidv4(),
      title,
      author,
      content,
      createdAt: new Date().toISOString(),
      comments: [],
    };

    await db.collection<Post>("posts").insertOne(newPost);
    return NextResponse.json({ ok: true, data: newPost });
  } catch (error) {
    return NextResponse.json({ ok: false, message: "Post creation failed" + error }, { status: 500 });
  }
}