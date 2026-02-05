"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Comment } from "@/types/post";

type Post = {
  _id: string;
  title: string;
  author: string;
  content: string;
  createdAt: string;
  comments?: Comment[];
};

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/admin/posts");
      if (res.status === 403) {
        setError("Admin access required");
        router.push("/");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setPosts(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      setError("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/posts/${postId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchPosts();
      } else {
        alert("Failed to delete post");
      }
    } catch (error) {
      console.error("Failed to delete post:", error);
      alert("Failed to delete post");
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <Link
          href="/admin"
          className="text-blue-600 hover:underline mb-4 inline-block"
        >
          ← Back to Admin Dashboard
        </Link>
        <h1 className="text-3xl font-bold">Post Management</h1>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post._id} className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-2">{post.title}</h2>
                <p className="text-sm text-gray-600 mb-2">
                  by {post.author} • {new Date(post.createdAt).toLocaleString()}
                </p>
                <p className="text-gray-800 mb-2">{post.content}</p>
                <p className="text-sm text-gray-500">
                  {post.comments?.length || 0} comments
                </p>
              </div>
              <button
                onClick={() => deletePost(post._id)}
                className="text-red-600 hover:text-red-800 p-2"
                title="Delete post"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {posts.length === 0 && (
        <p className="text-gray-500 text-center mt-8">No posts found</p>
      )}
    </div>
  );
}
