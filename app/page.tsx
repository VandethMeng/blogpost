import BlogClientWrapper from "@/app/components/BlogClientWrapper";
async function getPosts() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  try {
    // Adding a timestamp or 'no-store' forces Next.js to skip the cache
    const res = await fetch(`${baseUrl}/api/posts?t=${Date.now()}`, {
      cache: "no-store",
      next: { revalidate: 0 },
    });

    if (!res.ok) return [];
    const data = await res.json();
    return data.ok ? data.data : [];
  } catch (error) {
    console.error("Fetch error:", error);
    return [];
  }
}

export default async function HomePage() {
  const posts = await getPosts();

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Blog</h1>
      {/* Pass the server-fetched posts to the client wrapper.
        This fixes the 'setState' error because the client 
        doesn't need an effect to load the initial list.
      */}
      <BlogClientWrapper initialPosts={posts} />
    </main>
  );
}
