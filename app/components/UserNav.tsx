"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

type User = {
  username: string;
  role?: string;
};

export default function UserNav() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, [pathname]); // Re-check auth when route changes

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.data);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) return null;

  return (
    <div className="flex items-center gap-4">
      {user ? (
        <>
          <span className="text-gray-700">Welcome, {user.username}!</span>
          {user.role === "admin" && (
            <a
              href="/admin"
              className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 transition"
            >
              Admin
            </a>
          )}
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <a
            href="/login"
            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
          >
            Login
          </a>
          <a
            href="/signup"
            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
          >
            Sign Up
          </a>
        </>
      )}
    </div>
  );
}
