"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Post } from "@/types/post";

type PostFormProps = {
  post?: Post;
  onSuccess: () => void;
};

export default function PostForm({ post, onSuccess }: PostFormProps) {
  const [title, setTitle] = useState(post?.title ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const method = post?._id ? "PATCH" : "POST";
    const url = post?._id ? `/api/posts/${post._id}` : "/api/posts";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });

    const data = await res.json();

    if (!data.ok) {
      if (res.status === 401) {
        setError("You must be logged in to create a post");
        router.push("/login");
        return;
      }
      setError(data.message || "Failed to save post");
      return;
    }

    // Clear form after successful post creation (not for edits)
    if (!post?._id) {
      setTitle("");
      setContent("");
    }

    onSuccess();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-md p-6 rounded-lg mb-6"
    >
      <h2 className="text-xl font-semibold mb-4">
        {post?._id ? `Editing: ${post.title}` : "Add New Post"}
      </h2>

      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border border-gray-300 p-2 rounded w-full mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        required
      />

      <textarea
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="border border-gray-300 p-2 rounded w-full mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        required
      />

      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
        >
          {post?._id ? "Update Post" : "Add Post"}
        </button>
        {post?._id && (
          <button
            type="button"
            onClick={() => onSuccess()}
            className="bg-gray-400 text-white p-2 rounded hover:bg-gray-500 transition"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
