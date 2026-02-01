"use client";

import { useState } from "react";

type CommentFormProps = {
  postId: string;
  onAdd: () => void;
};

export default function CommentForm({ postId, onAdd }: CommentFormProps) {
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author, content }),
    });
    setAuthor("");
    setContent("");
    onAdd();
  };

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-2">
      <input
        type="text"
        placeholder="Ente your name"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-400"
      />
      <textarea
        placeholder="Your comment"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-400"
      />
      <button
        type="submit"
        className="bg-green-600 text-white p-1 rounded hover:bg-green-700 transition w-38"
      >
        Add Comment
      </button>
    </form>
  );
}
