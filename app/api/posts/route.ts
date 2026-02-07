import clientPromise from "@/lib/mongodb"; // Make sure this matches your lib file export
import { NextResponse } from "next/server";
import { Post } from "@/types/post";
import { v4 as uuidv4 } from "uuid";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic"; // <--- Add this!

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get("skip") || "0");
    const limit = parseInt(searchParams.get("limit") || "10");

    const client = await clientPromise;
    const db = client.db("blogpostdb");
    
    // Use aggregation to sort by comment count first, then by date
    const posts = await db
      .collection("posts")
      .aggregate([
        {
          $addFields: {
            commentCount: { $size: { $ifNull: ["$comments", []] } }
          }
        },
        {
          $sort: { commentCount: -1, createdAt: -1 }
        },
        {
          $skip: skip
        },
        {
          $limit: limit
        }
      ])
      .toArray();
    return NextResponse.json({ ok: true, data: posts });
  } catch (e) {
    console.log(e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { ok: false, message: "Must be logged in to create a post" },
        { status: 401 },
      );
    }

    // Check if user is blocked
    if (session.blocked) {
      return NextResponse.json(
        { ok: false, message: "Your account is blocked from posting" },
        { status: 403 },
      );
    }

    const { title, content } = await req.json();

    if (!title || !content) {
      return NextResponse.json(
        { ok: false, message: "Missing required fields (title, content)" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("blogpostdb");

    const newPost: Post = {
      _id: uuidv4(),
      title,
      author: session.username as string, // Use logged-in user's username
      content,
      createdAt: new Date().toISOString(),
      comments: [],
    };

    await db.collection<Post>("posts").insertOne(newPost);
    return NextResponse.json({ ok: true, data: newPost });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: "Post creation failed" + error },
      { status: 500 },
    );
  }
}
