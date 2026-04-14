"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getToken } from "@/lib/auth";

export function Navbar() {
  const [isSignedIn, setIsSignedIn] = useState(false);

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
    
    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <header className="bg-background/95 backdrop-blur-sm shadow-sm">
      <div className="mx-auto grid max-w-6xl grid-cols-3 items-center px-6 py-4">
        {/* Left: Logo */}
        <Link href="/" className="text-sm font-bold tracking-widest uppercase">
          Job Fair
        </Link>

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
