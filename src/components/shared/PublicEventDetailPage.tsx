"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarDays, Clock3, MapPin } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import {
  resolveAssetUrl,
  formatDateRange,
  formatTime,
} from "@/lib/event-utils";
import type { ApiResponse } from "@/types/api";
import type {
  PublicEventSummary,
  PublicEventCompany,
  EventRegistrationStatusPayload,
  AuthTokenPayload,
} from "@/types/event";

type PublicEventDetail = PublicEventSummary & {
  /** Set client-side after a successful register call; not sent by the server. */
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
        } catch {
          // If companies fail, we still show the event
        }

        if (active) {
          setEvent({ ...foundEvent, companies });
        }
      } catch (err: any) {
        console.error("Load Event Error:", err);
        toast.error("Failed to load event details");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadEvent();

    return () => {
      active = false;
    };
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
        const response = await api.get<
          ApiResponse<EventRegistrationStatusPayload>
        >(`/events/${eventId}/registration-status`);

        if (!active) return;
        setRegisteredFromServer(Boolean(response.data.registered));
      } catch {
        if (!active) return;
        setRegisteredFromServer(null);
      } finally {
        if (active) {
          setRegistrationStatusLoading(false);
        }
      }
    }

    checkRegistrationStatus();

    return () => {
      active = false;
    };
  }, [accessLoaded, accessRole, eventId]);

  const isJobSeeker = accessRole === "jobSeeker";
  const isCompanyOrAdmin =
    accessRole === "companyUser" || accessRole === "systemAdmin";
  const alreadyRegistered = Boolean(
    event?.viewerRegistered || registeredFromServer,
  );
  const registerButtonClass =
    "h-9 min-h-9 w-full whitespace-nowrap rounded-full bg-[#171717] px-5 text-[13px] font-medium text-[#FAFAFA]";

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
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-md rounded-2xl bg-background p-6 shadow-md">
          <h1 className="text-xl font-semibold tracking-[-1px]">
            Event not found
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The event may have been removed or is not published yet.
          </p>
          <div className="mt-6">
            <Button asChild>
              <Link href="/events">Back to events</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const bannerUrl = resolveAssetUrl(event.banner);

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <main className="mx-auto flex w-full max-w-[560px] flex-col gap-6 px-6 py-8">
        <section className="overflow-hidden rounded-lg bg-background shadow-md">
          {bannerUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={bannerUrl}
              alt={event.name}
              className="h-[280px] w-full object-cover"
            />
          ) : (
            <div className="flex h-[280px] w-full items-center justify-center bg-muted text-sm text-muted-foreground">
              No banner image
            </div>
          )}
        </section>

        <section className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <h1 className="text-[22px] font-semibold tracking-[-1px] text-foreground">
              {event.name}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-[16px] text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 shrink-0" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-2 whitespace-nowrap">
                <CalendarDays className="h-5 w-5 shrink-0" />
                <span>{formatDateRange(event.startDate, event.endDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock3 className="h-5 w-5 shrink-0" />
                <span>{formatTime(event.startDate)}</span>
              </div>
            </div>

            <p className="text-[16px] leading-6 text-muted-foreground">
              {event.description}
            </p>
          </div>

          <div className="flex justify-start">
            <div className="flex w-[156px] flex-col gap-2">
              {!accessLoaded ? (
                <Button
                  disabled
                  className={`${registerButtonClass} opacity-60`}
                >
                  Checking access…
                </Button>
              ) : !accessRole ? (
                <>
                  <Button
                    asChild
                    className={`${registerButtonClass} hover:bg-[#262626]`}
                  >
                    <Link href="/signin">Sign in</Link>
                  </Button>
                  <p className="whitespace-nowrap text-xs text-muted-foreground">
                    Sign in to register.
                  </p>
                </>
              ) : isCompanyOrAdmin ? (
                <>
                  <Button
                    disabled
                    className={`${registerButtonClass} opacity-60`}
                  >
                    Unavailable
                  </Button>
                  <p className="whitespace-nowrap text-xs text-muted-foreground">
                    User only.
                  </p>
                </>
              ) : registrationStatusLoading ? (
                <>
                  <Button
                    disabled
                    className={`${registerButtonClass} opacity-60`}
                  >
                    Checking status…
                  </Button>
                  <p className="whitespace-nowrap text-xs text-muted-foreground">
                    Checking registration.
                  </p>
                </>
              ) : alreadyRegistered ? (
                <>
                  <Button
                    disabled
                    className={`${registerButtonClass} opacity-60`}
                  >
                    Registered
                  </Button>
                  <p className="whitespace-nowrap text-xs text-muted-foreground">
                    Already registered.
                  </p>
                </>
              ) : (
                <Button
                  onClick={handleRegister}
                  disabled={saving}
                  className={`${registerButtonClass} hover:bg-[#262626]`}
                >
                  {saving ? "Registering…" : "Register"}
                </Button>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-[#F2F2F2] px-8 py-6 shadow-sm">
          <h2 className="text-center text-[24px] font-semibold tracking-[-1px] text-foreground">
            Company list
          </h2>

          <div className="mt-5 grid gap-3">
            {event.companies.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground">
                No companies linked yet.
              </div>
            ) : (
              event.companies.map(({ company }) => {
                const logoUrl = resolveAssetUrl(company.logo);

                return (
                  <div
                    key={company.id}
                    className="flex items-center gap-3 rounded-xl bg-background p-3 shadow-sm"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                      {logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={logoUrl}
                          alt={company.companyUser.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-semibold text-muted-foreground">
                          {company.companyUser.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/companies/${company.id}?eventId=${eventId}`}
                        className="text-[16px] font-medium text-foreground underline underline-offset-4"
                      >
                        {company.companyUser.name}
                      </Link>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {company.description ?? company.companyUser.email}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
