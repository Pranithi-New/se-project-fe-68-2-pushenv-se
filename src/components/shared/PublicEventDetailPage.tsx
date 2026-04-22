"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CalendarDays, Clock3, MapPin, Search } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { CompanyCard } from "@/components/shared/CompanyCard";
import CompanyTableView from "@/components/shared/CompanyTableView";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import {
  resolveAssetUrl,
  formatDateRange,
  formatTime,
} from "@/lib/event-utils";
import type { ApiResponse } from "@/types/api";
import type { Company } from "@/types/company";
import type {
  PublicEventSummary,
  PublicEventCompany,
  EventRegistrationStatusPayload,
  AuthTokenPayload,
} from "@/types/event";

type PublicEventDetail = PublicEventSummary & {
  viewerRegistered?: boolean;
  companies: PublicEventCompany[];
};

export function PublicEventDetailPage({ eventId }: { eventId: string }) {
  const [event, setEvent] = useState<PublicEventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [accessLoaded, setAccessLoaded] = useState(false);
  const [accessRole, setAccessRole] = useState<string | null>(null);
  const [registrationStatusLoading, setRegistrationStatusLoading] =
    useState(true);
  const [registeredFromServer, setRegisteredFromServer] = useState<
    boolean | null
  >(null);
  const [companiesSearch, setCompaniesSearch] = useState("");
  const [companiesSort, setCompaniesSort] = useState<"a-z" | "z-a">("a-z");
  const [companiesView, setCompaniesView] = useState<"card" | "table">("card");

  const filteredCompanies = useMemo<Company[]>(() => {
    if (!event) return [];
    let list: Company[] = event.companies.map(({ company }) => ({
      id: company.id,
      name: company.companyUser.name,
      email: company.companyUser.email,
      description: company.description,
      logo: resolveAssetUrl(company.logo),
    }));
    if (companiesSearch.trim()) {
      const q = companiesSearch.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.description ?? "").toLowerCase().includes(q),
      );
    }
    list.sort((a, b) =>
      companiesSort === "a-z"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name),
    );
    return list;
  }, [event, companiesSearch, companiesSort]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [eventId]);

  useEffect(() => {
    let active = true;

    async function loadEvent() {
      try {
        const res = await api.get<ApiResponse<PublicEventDetail>>(
          `/events/${eventId}`,
        );
        const foundEvent = res.data;

        let companies: PublicEventCompany[] = [];
        try {
          const companiesRes = await api.get<ApiResponse<PublicEventCompany[]>>(
            `/events/${eventId}/companies`,
          );
          companies = companiesRes.data;
        } catch {}

        if (active) setEvent({ ...foundEvent, companies });
      } catch (err: any) {
        console.error("Load Event Error:", err);
        toast.error("Failed to load event details");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadEvent();
    return () => { active = false; };
  }, [eventId]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setAccessRole(null);
      setAccessLoaded(true);
      return;
    }
    try {
      const decoded = jwtDecode<AuthTokenPayload>(token);
      setAccessRole(decoded.role ?? null);
    } catch {
      setAccessRole(null);
    } finally {
      setAccessLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!accessLoaded) return;
    if (accessRole !== "jobSeeker") {
      setRegistrationStatusLoading(false);
      setRegisteredFromServer(null);
      return;
    }

    let active = true;

    async function checkRegistrationStatus() {
      setRegistrationStatusLoading(true);
      try {
        const response = await api.get<ApiResponse<EventRegistrationStatusPayload>>(
          `/events/${eventId}/registration-status`,
        );
        if (!active) return;
        setRegisteredFromServer(Boolean(response.data.registered));
      } catch {
        if (!active) return;
        setRegisteredFromServer(null);
      } finally {
        if (active) setRegistrationStatusLoading(false);
      }
    }

    checkRegistrationStatus();
    return () => { active = false; };
  }, [accessLoaded, accessRole, eventId]);

  const isJobSeeker = accessRole === "jobSeeker";
  const isCompanyOrAdmin =
    accessRole === "companyUser" || accessRole === "systemAdmin";
  const alreadyRegistered = Boolean(event?.viewerRegistered || registeredFromServer);

  async function handleRegister() {
    if (!isJobSeeker) {
      toast.error(
        accessRole
          ? "Only user accounts can register for events"
          : "Please sign in as a user",
      );
      return;
    }
    if (alreadyRegistered) {
      toast.error("You already registered for this event");
      return;
    }
    setSaving(true);
    try {
      await api.post(`/events/${eventId}/register`, {});
      setEvent((current) =>
        current ? { ...current, viewerRegistered: true } : current,
      );
      setRegisteredFromServer(true);
      toast.success("Registered for event");
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Failed to register";
      if (message.toLowerCase().includes("already registered")) {
        setEvent((current) =>
          current ? { ...current, viewerRegistered: true } : current,
        );
        setRegisteredFromServer(true);
      }
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />
          <p className="text-sm text-muted-foreground">Loading event…</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-md rounded-2xl bg-background p-8 shadow-md text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <CalendarDays className="h-6 w-6 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Event not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This event may have been removed or is not published yet.
          </p>
          <Button asChild className="mt-6">
            <Link href="/events">Back to events</Link>
          </Button>
        </div>
      </div>
    );
  }

  const bannerUrl = resolveAssetUrl(event.banner);

  function RegisterPanel() {
    if (!accessLoaded || registrationStatusLoading) {
      return (
        <Button disabled className="w-full rounded-full opacity-60">
          {!accessLoaded ? "Checking access…" : "Checking status…"}
        </Button>
      );
    }
    if (!accessRole) {
      return (
        <div className="flex flex-col gap-2">
          <Button asChild className="w-full rounded-full bg-[#171717] text-[#FAFAFA] hover:bg-[#262626]">
            <Link href="/signin">Sign in to register</Link>
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            New here?{" "}
            <Link href="/signup" className="underline underline-offset-2">
              Create an account
            </Link>
          </p>
        </div>
      );
    }
    if (isCompanyOrAdmin) {
      return (
        <div className="flex flex-col gap-2">
          <Button disabled className="w-full rounded-full opacity-50">
            Registration unavailable
          </Button>
          <p className="text-center text-xs text-muted-foreground">For job seekers only.</p>
        </div>
      );
    }
    if (alreadyRegistered) {
      return (
        <div className="flex flex-col gap-2">
          <div className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-50 py-2.5 text-sm font-medium text-emerald-700 border border-emerald-200">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            You&apos;re registered
          </div>
          <p className="text-center text-xs text-muted-foreground">See you at the event!</p>
        </div>
      );
    }
    return (
      <Button
        onClick={handleRegister}
        disabled={saving}
        className="w-full rounded-full bg-[#171717] text-[#FAFAFA] hover:bg-[#262626]"
      >
        {saving ? "Registering…" : "Register for this event"}
      </Button>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Hero banner */}
      <div className="relative h-[320px] w-full overflow-hidden bg-muted sm:h-[400px]">
        {bannerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bannerUrl}
            alt={event.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-600">
            <CalendarDays className="h-16 w-16 text-white/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Back button */}
        <div className="absolute left-0 right-0 top-0 mx-auto max-w-6xl px-6 pt-5">
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All events
          </Link>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-6xl px-6 pb-8">
          <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow sm:text-3xl">
            {event.name}
          </h1>
        </div>
      </div>

      {/* Main content */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
          {/* Left column */}
          <div className="flex flex-col gap-8">
            {/* About */}
            <section className="rounded-2xl bg-background p-6 shadow-sm">
              <h2 className="mb-3 text-base font-semibold tracking-tight">About this event</h2>
              <p className="text-[15px] leading-7 text-muted-foreground">
                {event.description}
              </p>
            </section>

            {/* Companies */}
            <section className="rounded-2xl bg-background p-6 shadow-sm">
              {event.companies.length > 0 && (
                <div className="mb-4 w-full flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="relative flex-1 md:max-w-[480px]">
                    <input
                      type="text"
                      placeholder="Search companies..."
                      value={companiesSearch}
                      onChange={(e) => setCompaniesSearch(e.target.value)}
                      className="w-full h-10 rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Search size={16} />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 self-end md:self-center">
                    <span className="text-slate-600 text-sm font-sans">
                      Showing <span className="font-semibold text-black">{filteredCompanies.length}</span> results
                    </span>
                    <div className="relative">
                      <select
                        value={companiesSort}
                        onChange={(e) => setCompaniesSort(e.target.value as "a-z" | "z-a")}
                        className="appearance-none bg-white border border-slate-200 rounded-lg px-4 py-2 pr-10 text-sm text-slate-700 font-sans font-medium focus:outline-none focus:ring-2 focus:ring-slate-300 cursor-pointer transition-all"
                      >
                        <option value="a-z">A-Z</option>
                        <option value="z-a">Z-A</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="w-full flex justify-between items-center mb-4">
                <span className="text-black text-lg font-semibold font-sans uppercase tracking-tight">
                  Participating companies
                </span>
                {event.companies.length > 0 && (
                  <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
                    <button
                      onClick={() => setCompaniesView("card")}
                      className={`p-1.5 rounded-md transition-colors ${companiesView === "card" ? "bg-white shadow-sm text-slate-900" : "text-slate-400 hover:text-slate-700"}`}
                      title="Card view"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setCompaniesView("table")}
                      className={`p-1.5 rounded-md transition-colors ${companiesView === "table" ? "bg-white shadow-sm text-slate-900" : "text-slate-400 hover:text-slate-700"}`}
                      title="Table view"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {event.companies.length === 0 ? (
                <div className="w-full py-20 text-center text-slate-400 italic text-sm font-sans">
                  No companies linked yet.
                </div>
              ) : filteredCompanies.length === 0 ? (
                <div className="w-full py-20 text-center text-slate-400 italic text-sm font-sans">
                  No companies match your search.
                </div>
              ) : companiesView === "table" ? (
                <CompanyTableView companies={filteredCompanies} />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {filteredCompanies.map((company) => (
                    <CompanyCard key={company.id} company={company} />
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right sidebar */}
          <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-2xl bg-background p-5 shadow-sm">
              <h2 className="mb-4 text-base font-semibold tracking-tight">Event details</h2>

              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Date</p>
                    <p className="mt-0.5 text-sm font-medium">
                      {formatDateRange(event.startDate, event.endDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Clock3 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Time</p>
                    <p className="mt-0.5 text-sm font-medium">{formatTime(event.startDate)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Location</p>
                    <p className="mt-0.5 text-sm font-medium">{event.location}</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 border-t pt-4">
                <RegisterPanel />
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
