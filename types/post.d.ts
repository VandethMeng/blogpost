export type Comment = {
  id: string;
  author: string;
  content: string;
  createdAt: string;
};

export type Post = {
  _id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string; // ISO string
  comments?: Comment[];
};
