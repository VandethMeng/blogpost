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
    <div className="flex items-center gap-3">
      {user ? (
        <>
          <span className="text-gray-600 font-medium text-sm">
            Welcome,{" "}
            <span className="text-gray-900 font-semibold">{user.username}</span>
          </span>
          {user.role === "admin" && (
            <a
              href="/admin"
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors font-medium text-sm shadow-sm"
            >
              Admin
            </a>
          )}
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors font-medium text-sm shadow-sm"
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <a
            href="/login"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"
          >
            Login
          </a>
          <a
            href="/signup"
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors font-medium text-sm shadow-sm"
          >
            Sign Up
          </a>
        </>
      )}
    </div>
  );
}
