
import client from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { Post } from "@/types/post";

export async function GET() {
  try {
    await client.connect();
    const db = client.db("blogpostdb");
    const posts = await db.collection<Post>("posts").find().toArray();
    return NextResponse.json({ ok: true, data: posts });
  } catch (error) {
    console.error("MongoDB POST error:", error);
    return NextResponse.json({ ok: false, message: "Cannot fetch posts" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, content, author } = body;

    if (!title || !content || !author)
      return NextResponse.json({ ok: false, message: "Missing fields" }, { status: 400 });

    await client.connect();
    const db = client.db("blogpostdb");

    const newPost: Post = {
      _id: uuidv4(),
      title,
      content,
      author,
      createdAt: new Date().toISOString(),
      comments: [],
    };

    const result = await db.collection<Post>("posts").insertOne(newPost);
    return NextResponse.json({ ok: true, data: result });
  } catch (error) {
    console.error("MongoDB POST error:", error);
    return NextResponse.json({ ok: false, message: "Cannot create post" }, { status: 500 });
  }
}




//console.error("MongoDB POST error:", error);
    