import { Comment } from "@/types/post";

type CommentItemProps = {
  comment: Comment;
};

export default function CommentItem({ comment }: CommentItemProps) {
  return (
    <div className="border-l-2 border-gray-300 pl-2 mb-2">
      <p className="text-sm font-semibold">{comment.author}</p>
      <p className="text-gray-700">{comment.content}</p>
      <p className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString()}</p>
    </div>
  );
}
