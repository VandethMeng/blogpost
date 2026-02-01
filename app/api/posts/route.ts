import client from "@/app/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  const mongoClient = await client.connect();
  const db = mongoClient.db("blogpostdb");

  const posts = await db.collection("posts").find().toArray();

  return NextResponse.json(posts);
}
