"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getToken, clearToken } from "@/lib/auth";
import { api } from "@/lib/api";
import { LogOut } from "lucide-react";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isActivePath = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const getNavLinkClassName = (href: string) =>
    `relative inline-flex pb-1 text-sm font-medium transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-center after:bg-black after:transition-transform after:duration-300 after:ease-out ${
      isActivePath(href)
        ? "text-black after:scale-x-100"
        : "text-muted-foreground after:scale-x-0 hover:text-foreground hover:after:scale-x-100"
    }`;

  useEffect(() => {
    const checkAuth = () => {
      const token = getToken();
      setIsSignedIn(!!token);
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          setIsAdmin(payload.role === "systemAdmin");
        } catch (e) {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };

    checkAuth();

    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        checkAuth();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkAuth();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("auth-change", checkAuth);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("auth-change", checkAuth);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout", {});
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      clearToken();
      setIsSignedIn(false);
      setIsAdmin(false);
      router.push("/signin");
    }
  };

  return (
    <header className="sticky top-0 z-[100] border-b border-border bg-background/95 shadow-sm backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Left: Logo with Drill-down Menu */}
        <div className="relative" ref={menuRef}>
          {isAdmin ? (
            <>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-sm font-bold tracking-widest uppercase hover:text-primary transition-colors flex items-center gap-2"
              >
                Job Fair
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transition-transform duration-200 ${isMenuOpen ? "rotate-180" : ""}`}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {/* Drill-down Menu */}
              {isMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-background border border-border rounded-lg shadow-xl py-2 animate-in fade-in slide-in-from-top-1">
                  <Link
                    href="/"
                    className="block px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <div className="h-px bg-border my-1" />
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
            </>
          ) : (
            <Link
              href="/"
              className="text-sm font-bold tracking-widest uppercase hover:text-primary transition-colors"
            >
              Job Fair
            </Link>
          )}
        </div>

        {/* Right: Navigation + User actions */}
        <div className="flex items-center gap-6">
          {/* Navigation links - now on the right */}
          {isSignedIn && (
            <nav className="hidden md:flex items-center gap-4">
              <Link
                href="/events"
                className={getNavLinkClassName("/events")}
              >
                Events
              </Link>
              <Link
                href="/companies"
                className={getNavLinkClassName("/companies")}
              >
                Company
              </Link>
            </nav>
          )}

          <div className="flex items-center gap-2">
            {isSignedIn ? (
              <>
                <div className="w-px h-6 bg-border mx-2" />
                <Button variant="ghost" size="icon" asChild title="Profile">
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
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  title="Logout"
                >
                  <LogOut className="h-5 w-5 text-destructive" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/signin">Sign in</Link>
                </Button>
                <Button
                  size="sm"
                  asChild
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Link href="/signup">Sign up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
