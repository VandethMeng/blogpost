import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import UserNav from "@/app/components/UserNav";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Blog Post App",
  description: "Enterprise-grade blog application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <nav className="bg-gray-100 border-b border-gray-300 p-4">
          <div className="max-w-3xl mx-auto flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-gray-800">
              My Blog
            </Link>
            <UserNav />
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
