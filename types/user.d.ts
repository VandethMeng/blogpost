export type User = {
  _id: string;
  email: string;
  username: string;
  password: string; // hashed
  createdAt: string;
  role: "user" | "admin";
  blocked?: boolean;
};

export type Session = {
  userId: string;
  email: string;
  username: string;
  role: "user" | "admin";
  blocked?: boolean;
};
