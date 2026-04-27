"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Building2, CalendarRange, ExternalLink, LogOut, Menu, ShieldCheck, UsersRound, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { clearUserInfo } from "@/lib/auth";

const adminLinks = [
  { href: "/admin/users", label: "Users", icon: UsersRound },
  { href: "/admin/companies", label: "Companies", icon: Building2 },
  { href: "/admin/events", label: "Events", icon: CalendarRange },
];

function SidebarContent({ pathname, onNavClick, onLogout }: Readonly<{ pathname: string; onNavClick?: () => void; onLogout: () => void }>) {
  return (
    <>
      <div className="flex items-center gap-2.5 border-b border-white/[0.07] px-5 py-[18px]">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10">
          <ShieldCheck className="h-3.5 w-3.5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-none text-white">Admin</p>
          <p className="mt-0.5 text-[11px] text-slate-500">Internal panel</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-6 px-3 py-5">
        <div>
          <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase text-slate-600">
            Manage
          </p>
          <nav className="space-y-0.5">
            {adminLinks.map(link => {
              const active = pathname.startsWith(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onNavClick}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-white/10 text-white"
                      : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-200",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="border-t border-white/[0.07] px-3 py-3">
        <Link
          href="/"
          onClick={onNavClick}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-white/[0.05] hover:text-slate-200"
        >
          <ExternalLink className="h-4 w-4 shrink-0" />
          Participant View
        </Link>
      </div>
      <div className="border-t border-white/[0.07] px-3 py-3">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-white/[0.05] hover:text-slate-200"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Logout
        </button>
      </div>
    </>
  );
}

export function AdminLayoutShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout", {});
    } catch {
      // proceed regardless
    } finally {
      clearUserInfo();
      router.push("/signin");
    }
  };

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-56 flex-col bg-slate-950 lg:flex">
        <SidebarContent pathname={pathname} onLogout={handleLogout} />
      </aside>

      {/* Mobile overlay */}
      {open && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 h-full w-full border-none bg-slate-950/60 outline-none backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-56 flex-col bg-slate-950 transition-transform duration-200 lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
        <SidebarContent pathname={pathname} onNavClick={() => setOpen(false)} onLogout={handleLogout} />
      </aside>

      <div className="flex flex-1 flex-col lg:pl-56">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex h-12 items-center gap-3 border-b border-slate-200 bg-white px-4 lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-slate-700" />
            <span className="text-sm font-semibold text-slate-900">Admin</span>
          </div>
        </header>

        <main className="flex-1 bg-slate-50 px-4 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
