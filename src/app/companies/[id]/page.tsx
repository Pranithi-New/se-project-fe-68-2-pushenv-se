"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Building2, Globe, Mail, Phone, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import EventCard from "@/components/shared/EventCard";
import { useCompany } from "@/hooks/company/useCompany";
import { resolveAssetUrl } from "@/lib/event-utils";

export default function CompanyDetailPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = use(params);
  const { company, loading, error } = useCompany(id);

  useEffect(() => {
    globalThis.window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [id]);

  const [eventsSearch, setEventsSearch] = useState("");
  const [eventsSort, setEventsSort] = useState<"a-z" | "z-a">("a-z");

  const filteredEvents = useMemo(() => {
    if (!company?.eventLinks) return [];
    let list = company.eventLinks.map(({ event }) => event);
    if (eventsSearch.trim()) {
      const q = eventsSearch.toLowerCase();
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q),
      );
    }
    list.sort((a, b) =>
      eventsSort === "a-z"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name),
    );
    return list;
  }, [company, eventsSearch, eventsSort]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />
          <p className="text-sm text-muted-foreground">Loading company…</p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-md rounded-2xl bg-background p-8 shadow-md text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Building2 className="h-6 w-6 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Company not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This company may have been removed or does not exist.
          </p>
          <Button asChild className="mt-6">
            <Link href="/companies">Back to companies</Link>
          </Button>
        </div>
      </div>
    );
  }

  const logoUrl = resolveAssetUrl(company.logo);
  const hasEvents = company.eventLinks && company.eventLinks.length > 0;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Hero */}
      <div className="relative h-[280px] w-full overflow-hidden bg-gradient-to-br from-slate-800 to-slate-600 sm:h-[320px]">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Back button */}
        <div className="absolute left-0 right-0 top-0 mx-auto max-w-6xl px-6 pt-5">
          <Link
            href="/companies"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All companies
          </Link>
        </div>

        {/* Logo + name overlay */}
        <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-6xl px-6 pb-8">
          <div className="flex items-end gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-white/30 bg-white/10 shadow-lg backdrop-blur-sm">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt={company.companyUser.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Building2 className="h-8 w-8 text-white/60" />
              )}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow sm:text-3xl">
              {company.companyUser.name}
            </h1>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
          {/* Left column */}
          <div className="flex flex-col gap-8">
            {/* About */}
            <section className="rounded-2xl bg-background p-6 shadow-sm">
              <h2 className="mb-3 text-base font-semibold tracking-tight">About this company</h2>
              <p className="whitespace-pre-line text-[15px] leading-7 text-muted-foreground">
                {company.description || "No description provided."}
              </p>
            </section>

            {/* Participated Events */}
            <section className="rounded-2xl bg-background p-6 shadow-sm">
              <div className="mb-4 flex w-full items-center justify-between">
                <span className="text-lg font-semibold uppercase tracking-tight">
                  Participated events
                </span>
              </div>

              {hasEvents && (
                <div className="mb-4 flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="relative flex-1 md:max-w-[480px]">
                    <input
                      type="text"
                      placeholder="Search events..."
                      value={eventsSearch}
                      onChange={(e) => setEventsSearch(e.target.value)}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-300"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Search size={16} />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 self-end md:self-center">
                    <span className="text-sm text-slate-600">
                      Showing{" "}
                      <span className="font-semibold text-black">{filteredEvents.length}</span>{" "}
                      results
                    </span>
                    <div className="relative">
                      <select
                        value={eventsSort}
                        onChange={(e) => setEventsSort(e.target.value as "a-z" | "z-a")}
                        className="appearance-none cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 pr-10 text-sm font-medium text-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-slate-300"
                      >
                        <option value="a-z">A-Z</option>
                        <option value="z-a">Z-A</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                        <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!hasEvents && (
                <div className="w-full py-20 text-center text-sm italic text-slate-400">
                  No participated events yet.
                </div>
              )}
              {hasEvents && filteredEvents.length === 0 && (
                <div className="w-full py-20 text-center text-sm italic text-slate-400">
                  No events match your search.
                </div>
              )}
              {hasEvents && filteredEvents.length > 0 && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {filteredEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right sidebar */}
          <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-2xl bg-background p-5 shadow-sm">
              <h2 className="mb-4 text-base font-semibold tracking-tight">Company details</h2>
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Email</p>
                    <p className="mt-0.5 break-all text-sm font-medium">{company.companyUser.email}</p>
                  </div>
                </div>

                {company.companyUser.phone && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Phone</p>
                      <p className="mt-0.5 text-sm font-medium">{company.companyUser.phone}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Website</p>
                    {company.website ? (
                      <a
                        href={
                          company.website.startsWith("http")
                            ? company.website
                            : `https://${company.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-0.5 break-all text-sm font-medium hover:underline"
                      >
                        {company.website}
                      </a>
                    ) : (
                      <p className="mt-0.5 text-sm font-medium italic opacity-50">Not available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
