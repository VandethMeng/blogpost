"use client";

import { useState } from "react";
import { Post } from "@/types/post";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";

type PostItemProps = {
  post: Post;
  onEdit: (post: Post) => void;
  onDelete: (id: string) => void;
  refreshPosts: () => void;
};

export default function PostItem({ post, onEdit, onDelete, refreshPosts }: PostItemProps) {
  const [showComments, setShowComments] = useState(false);

  return (
    <div className="bg-white shadow rounded p-4 mb-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-bold text-lg">{post.title}</h3>
          <p className="text-gray-600 text-sm">by {post.author}</p>
          <p className="text-gray-800 mt-1">{post.content}</p>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onEdit(post)}
            className="bg-yellow-400 text-black px-2 py-1 rounded hover:bg-yellow-500 transition"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(post._id)}
            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
          >
            Delete
          </button>
        </div>
      </div>

      <button
        onClick={() => setShowComments(!showComments)}
        className="text-blue-500 text-sm mb-2 hover:underline"
      >
        {showComments ? "Hide Comments" : "Show Comments"} ({post.comments?.length || 0})
      </button>

      {showComments && (
        <div className="mt-2">
          {post.comments?.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
          <CommentForm
            postId={post._id}
            onAdd={refreshPosts} // Refresh after comment added
          />
        </div>
      )}
    </div>
  );
}
