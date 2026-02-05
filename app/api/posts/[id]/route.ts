import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { Post } from "@/types/post";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Define the type for Next.js 15/16 where params is a Promise
type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(req: Request, { params }: RouteContext) {
  const { id } = await params;

  try {
    const client = await clientPromise;
    const db = client.db("blogpostdb");
    const post = await db.collection<Post>("posts").findOne({ _id: id });

    if (!post) {
      return NextResponse.json(
        { ok: false, message: "Post not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true, data: post });
  } catch (error) {
    console.error("Get Error:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to fetch" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request, { params }: RouteContext) {
  // 1. Await the dynamic parameters (Next.js 15+ Requirement)
  const { id } = await params;
  const body = await req.json();

  // Check authentication
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, message: "Must be logged in to edit a post" },
      { status: 401 },
    );
  }

  if (!body.title || !body.content) {
    return NextResponse.json(
      { ok: false, message: "Missing required fields" },
      { status: 400 },
    );
  }

  try {
    // 2. Await the shared database connection
    const client = await clientPromise;
    const db = client.db("blogpostdb");

    // Check if post exists and user owns it
    const existingPost = await db.collection<Post>("posts").findOne({ _id: id });
    
    if (!existingPost) {
      return NextResponse.json(
        { ok: false, message: "Post not found" },
        { status: 404 },
      );
    }

    // Only owner or admin can edit
    if (existingPost.author !== session.username && session.role !== "admin") {
      return NextResponse.json(
        { ok: false, message: "Not authorized to edit this post" },
        { status: 403 },
      );
    }

    // 3. Update the document
    await db
      .collection<Post>("posts")
      .updateOne(
        { _id: id },
        {
          $set: {
            title: body.title,
            content: body.content,
          },
        },
      );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Patch Error:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to update" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request, { params }: RouteContext) {
  // 1. Await the dynamic parameters
  const { id } = await params;

  // Check authentication
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, message: "Must be logged in to delete a post" },
      { status: 401 },
    );
  }

  try {
    // 2. Await the shared database connection
    const client = await clientPromise;
    const db = client.db("blogpostdb");

    // Check if post exists and user owns it
    const existingPost = await db.collection<Post>("posts").findOne({ _id: id });
    
    if (!existingPost) {
      return NextResponse.json(
        { ok: false, message: "Post not found" },
        { status: 404 },
      );
    }

    // Only owner or admin can delete
    if (existingPost.author !== session.username && session.role !== "admin") {
      return NextResponse.json(
        { ok: false, message: "Not authorized to delete this post" },
        { status: 403 },
      );
    }

    // 3. Delete the document
    await db.collection<Post>("posts").deleteOne({ _id: id });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to delete" },
      { status: 500 },
    );
  }
}
