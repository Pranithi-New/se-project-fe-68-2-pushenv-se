"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { getToken } from "@/lib/auth";

export function Navbar() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAuth = () => setIsSignedIn(!!getToken());

    // Check on mount
    checkAuth();

    // Re-check when page is restored from bfcache (back button)
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        checkAuth();
      }
    };

    // Re-check when tab becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkAuth();
      }
    };

    // Close menu when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    // Close menu on Escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <header className="relative z-[100] bg-background/95 backdrop-blur-sm shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Left: Logo with Drill-down Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-sm font-bold tracking-widest uppercase hover:text-primary transition-colors"
          >
            Job Fair
          </button>

          {/* Drill-down Menu */}
          {isMenuOpen && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-background border border-border rounded-md shadow-lg py-2">
              <Link
                href="/"
                className="block px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/admin/users"
                className="block px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                User Management
              </Link>
              <Link
                href="/admin/companies"
                className="block px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Company Management
              </Link>
              <Link
                href="/admin/events"
                className="block px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Event Management
              </Link>
            </div>
          )}
        </div>

        {/* Center: Navigation links */}
        <nav className="flex items-center justify-center gap-1">
          {isSignedIn ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/events">Events</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/company">Company</Link>
              </Button>
            </>
          ) : null}
        </nav>

        {/* Right: User actions */}
        <div className="flex items-center justify-end gap-1">
          {isSignedIn ? (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/profile">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/signin">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
