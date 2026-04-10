import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";

export function Navbar({ role }: { role?: "user" | "company" | "admin" }) {
  return (
    <header className="bg-background/95 backdrop-blur-sm shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-sm font-bold tracking-widest uppercase">
          Job Fair
        </Link>
        <nav className="flex items-center gap-1">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">Home</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/register">Sign up</Link>
          </Button>
          {role ? <StatusBadge status={role} /> : null}
        </nav>
      </div>
    </header>
  );
}
