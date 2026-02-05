"use client";

import { useState } from "react";
import { Post } from "@/types/post";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";

type User = {
  username: string;
  role?: string;
};

type PostItemProps = {
  post: Post;
  onEdit: (post: Post) => void;
  onDelete: (id: string) => void;
  refreshPosts: () => void;
  currentUser: User | null;
};

export default function PostItem({
  post,
  onEdit,
  onDelete,
  refreshPosts,
  currentUser,
}: PostItemProps) {
  const [showComments, setShowComments] = useState(false);

  return (
    <div className="bg-white shadow rounded p-4 mb-4">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-lg text-black">{post.title}</h3>
            <span className="text-xs text-gray-400">•</span>
            <p className="text-xs text-gray-500">
              {new Date(post.createdAt).toLocaleString()}
            </p>
          </div>
          <p className="text-gray-600 text-sm mb-2">by {post.author}</p>
          <p className="text-gray-800">{post.content}</p>
        </div>
        {/* Show edit/delete buttons only if user is logged in and owns the post (or is admin) */}
        {currentUser &&
          (currentUser.username === post.author ||
            currentUser.role === "admin") && (
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => onEdit(post)}
                className="text-blue-600 hover:text-blue-800 transition p-1"
                title="Edit post"
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
                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                  />
                </svg>
              </button>
              <button
                onClick={() => onDelete(post._id)}
                className="text-red-600 hover:text-red-800 transition p-1"
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
          )}
      </div>

      <button
        onClick={() => setShowComments(!showComments)}
        className="text-blue-500 text-sm mb-2 hover:underline"
      >
        {showComments ? "Hide Comments" : "Show Comments"} (
        {post.comments?.length || 0})
      </button>

      {showComments && (
        <div className="mt-2">
          {post.comments?.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={post._id}
              currentUser={currentUser}
              onDelete={refreshPosts}
            />
          ))}
          {currentUser && (
            <CommentForm
              postId={post._id}
              onAdd={refreshPosts} // Refresh after comment added
            />
          )}
        </div>
      )}
    </div>
  );
}
