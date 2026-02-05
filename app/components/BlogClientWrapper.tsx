"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import PostForm from "./PostForm";
import PostItem from "./PostItem";
import { Post } from "@/types/post";

type User = {
  username: string;
  role?: string;
};

export default function BlogClientWrapper({
  initialPosts,
}: {
  initialPosts: Post[];
}) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [editPost, setEditPost] = useState<Post | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setPosts(initialPosts);
    checkAuth();
  }, [initialPosts, pathname]); // Re-check auth when posts refresh or route changes

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.data);
      } else {
        setUser(null); // Clear user if not authenticated
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null); // Clear user on error
    }
  };

  const handleRefresh = () => {
    setEditPost(null);
    // This tells Next.js to re-run the server-side fetch in page.tsx
    router.refresh();
  };

  const loadMorePosts = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/posts?skip=${posts.length}&limit=5`);
      if (res.ok) {
        const data = await res.json();
        const newPosts = data.data;

        if (newPosts.length === 0) {
          setHasMore(false);
        } else {
          setPosts([...posts, ...newPosts]);
        }
      }
    } catch (error) {
      console.error("Failed to load more posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      if (res.ok) handleRefresh();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleEdit = (p: Post) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setEditPost(p);
  };

  return (
    <>
      {/* Only show PostForm when user is logged in */}
      {user && (
        <PostForm
          key={editPost?._id || "new-post"}
          post={editPost || undefined}
          onSuccess={handleRefresh}
        />
      )}

      {posts.length ? (
        <>
          <div className="space-y-4">
            {posts.map((post: Post) => (
              <PostItem
                key={post._id}
                post={post}
                onEdit={handleEdit}
                onDelete={handleDelete}
                refreshPosts={handleRefresh}
                currentUser={user}
              />
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="mt-6 text-center">
              <button
                onClick={loadMorePosts}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Loading..." : "Load More Posts"}
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="text-gray-500">No posts yet.</p>
      )}
    </>
  );
}
