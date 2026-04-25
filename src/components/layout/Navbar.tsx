"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getUserInfo, clearUserInfo, setUserInfo } from "@/lib/auth";
import { api } from "@/lib/api";
import { LogOut, Menu, X } from "lucide-react";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActivePath = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const getNavLinkClassName = (href: string) =>
    `relative inline-flex h-10 items-center text-sm font-medium transition-colors duration-200 after:absolute after:bottom-1 after:left-0 after:h-0.5 after:w-full after:origin-center after:bg-black after:transition-transform after:duration-300 after:ease-out ${
      isActivePath(href)
        ? "text-black after:scale-x-100"
        : "text-muted-foreground after:scale-x-0 hover:text-foreground hover:after:scale-x-100"
    }`;

  useEffect(() => {
    const checkAuth = () => {
      const user = getUserInfo();
      setIsSignedIn(!!user);
      setIsAdmin(user?.role === "systemAdmin");
    };

    const recoverSession = async () => {
      const user = getUserInfo();
      if (!user && !pathname.startsWith("/signin") && !pathname.startsWith("/signup")) {
        try {
          const res = await api.get<{ data: { id: string; role: string; name: string } }>("/auth/me");
          if (res.data) {
            setUserInfo({ id: res.data.id, role: res.data.role });
          }
        } catch {
          // No session or error, ignore
        }
      }
    };

    checkAuth();
    recoverSession();

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

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("auth-change", checkAuth);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("auth-change", checkAuth);
    };
  }, [pathname]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout", {});
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      clearUserInfo();
      setIsSignedIn(false);
      setIsAdmin(false);
      setIsMobileMenuOpen(false);
      router.push("/signin");
    }
  };

  return (
    <header className="sticky top-0 z-[100] border-b border-border bg-background/95 shadow-sm backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Left: Logo */}
        <div>
          <Link
            href="/"
            className="text-sm font-bold tracking-widest uppercase hover:text-primary transition-colors"
          >
            Job Fair
          </Link>
        </div>

        {/* Right: Navigation + User actions */}
        <div className="flex items-center gap-4">
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-nav"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Navigation links */}
          {isSignedIn && (
            <nav className="hidden md:flex items-center gap-4">
              <Link href="/events" className={getNavLinkClassName("/events")}>
                Events
              </Link>
              <Link href="/companies" className={getNavLinkClassName("/companies")}>
                Company
              </Link>
            </nav>
          )}

          {isSignedIn && isAdmin && (
            <>
              <div className="hidden md:block w-px h-5 bg-border" />
              <Link href="/admin" className={`hidden md:inline-flex ${getNavLinkClassName("/admin")}`}>
                Admin
              </Link>
            </>
          )}

          <div className="flex items-center gap-2">
            {isSignedIn ? (
              <>
                <div className="w-px h-6 bg-border" />
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

      {isMobileMenuOpen && (
        <div
          id="mobile-nav"
          className="absolute left-0 right-0 top-full z-50 border-t border-border bg-background/95 px-6 py-4 shadow-xl backdrop-blur-sm md:hidden"
        >
          <nav className="mx-auto flex max-w-6xl flex-col gap-2">
            <Link
              href="/events"
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent ${
                isActivePath("/events") ? "text-foreground bg-accent" : "text-muted-foreground"
              }`}
            >
              Events
            </Link>
            <Link
              href="/companies"
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent ${
                isActivePath("/companies") ? "text-foreground bg-accent" : "text-muted-foreground"
              }`}
            >
              Company
            </Link>

            {isSignedIn && isAdmin && (
              <Link
                href="/admin"
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent ${
                  isActivePath("/admin") ? "text-foreground bg-accent" : "text-muted-foreground"
                }`}
              >
                Admin Panel
              </Link>
            )}

            <div className="my-2 h-px bg-border" />

            {isSignedIn ? (
              <>
                <Link
                  href="/profile"
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent ${
                    isActivePath("/profile") ? "text-foreground bg-accent" : "text-muted-foreground"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
