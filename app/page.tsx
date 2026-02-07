export const dynamic = "force-dynamic";
import BlogClientWrapper from "@/app/components/BlogClientWrapper";
import clientPromise from "@/lib/mongodb";
import { Post } from "@/types/post";

async function getPosts() {
  try {
    // Direct database query instead of HTTP fetch (better for Vercel)
    const client = await clientPromise;
    const db = client.db("blogpostdb");
    
    // Use aggregation to sort by comment count first, then by date
    const posts = await db
      .collection<Post>("posts")
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
          $limit: 10 // Fetch 10 most recent posts initially
        }
      ])
      .toArray();

    // Convert MongoDB documents to plain objects
    return JSON.parse(JSON.stringify(posts));
  } catch (error) {
    console.error("Fetch error:", error);
    return [];
  }
}

export default async function HomePage() {
  const posts = await getPosts();

  return (
    <main className="max-w-3xl mx-auto p-6">
      {/* Pass the server-fetched posts to the client wrapper.
        This fixes the 'setState' error because the client 
        doesn't need an effect to load the initial list.
      */}
      <BlogClientWrapper initialPosts={posts} />
    </main>
  );
}
