"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import UserNav from "./UserNav";

export default function StickyNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  return (
    <nav
      className={`sticky top-0 z-50 bg-white shadow-md border-b border-gray-200 transition-all duration-300 ${
        scrolled ? "py-2" : "py-4"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
        <Link
          href="/"
          className="flex items-center hover:opacity-90 transition-opacity"
        >
          <Image
            src="/angkor-logo.jpg"
            alt="My Blog Logo"
            width={250}
            height={90}
            className={`w-auto object-contain bg-transparent transition-all duration-300 ${
              scrolled ? "h-14" : "h-20"
            }`}
            priority
          />
        </Link>
        <UserNav />
      </div>
    </nav>
  );
}
