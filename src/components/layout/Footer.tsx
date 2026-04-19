import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto bg-muted/40">
      <div className="mx-auto max-w-6xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between text-sm text-muted-foreground gap-4">
        <div>© 2026 SE Job Fair. All rights reserved.</div>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
