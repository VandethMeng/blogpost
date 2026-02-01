"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PostForm from "./PostForm";
import PostItem from "./PostItem";
import { Post } from "@/types/post";

export default function BlogClientWrapper({ initialPosts }: { initialPosts: Post[] }) {
  const [editPost, setEditPost] = useState<Post | null>(null);
  const router = useRouter();

  const handleRefresh = () => {
    setEditPost(null);
    // This tells Next.js to re-run the server-side fetch in page.tsx
    router.refresh(); 
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
      {/* The 'key' ensures that when editPost changes, 
        the form resets its internal state automatically.
      */}
      <PostForm
        key={editPost?._id || "new-post"}
        post={editPost || undefined}
        onSuccess={handleRefresh}
      />

      {initialPosts.length ? (
        <div className="space-y-4">
          {initialPosts.map((post: Post) => (
            <PostItem
              key={post._id}
              post={post}
              onEdit={handleEdit}
              onDelete={handleDelete}
              refreshPosts={handleRefresh}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No posts yet.</p>
      )}
    </>
  );
}