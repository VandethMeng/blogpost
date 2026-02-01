import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { Post } from "@/types/post";

// Define the type for Next.js 15/16 where params is a Promise
type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: Request, { params }: RouteContext) {
  // 1. Await the dynamic parameters (Next.js 15+ Requirement)
  const { id } = await params;
  const body = await req.json();

  try {
    // 2. Await the shared database connection
    const client = await clientPromise;
    const db = client.db("blogpostdb");

    // 3. Update the document. 
    // Use 'id as any' because your UUID strings don't match MongoDB's ObjectId type.
    await db.collection<Post>("posts").updateOne(
      { _id: id },
      { $set: { title: body.title, content: body.content, author: body.author } }
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Patch Error:", error);
    return NextResponse.json({ ok: false, message: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteContext) {
  // 1. Await the dynamic parameters
  const { id } = await params;

  try {
    // 2. Await the shared database connection
    const client = await clientPromise;
    const db = client.db("blogpostdb");

    // 3. Delete the document
    await db.collection<Post>("posts").deleteOne({ _id: id });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json({ ok: false, message: "Failed to delete" }, { status: 500 });
  }
}