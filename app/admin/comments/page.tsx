"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Comment = {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  postId: string;
  postTitle: string;
};

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchComments = async () => {
    try {
      const res = await fetch("/api/admin/comments");
      if (res.status === 403) {
        setError("Admin access required");
        router.push("/");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setComments(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      setError("Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (commentId: string, postId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/comments/${commentId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });

      if (res.ok) {
        fetchComments();
      } else {
        alert("Failed to delete comment");
      }
    } catch (error) {
      console.error("Failed to delete comment:", error);
      alert("Failed to delete comment");
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
        <h1 className="text-3xl font-bold">Comment Management</h1>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="mb-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {comment.author}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-800 mb-2">{comment.content}</p>
                <p className="text-sm text-gray-500">
                  On post:{" "}
                  <span className="font-medium">{comment.postTitle}</span>
                </p>
              </div>
              <button
                onClick={() => deleteComment(comment.id, comment.postId)}
                className="text-red-600 hover:text-red-800 p-2"
                title="Delete comment"
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

      {comments.length === 0 && (
        <p className="text-gray-500 text-center mt-8">No comments found</p>
      )}
    </div>
  );
}
