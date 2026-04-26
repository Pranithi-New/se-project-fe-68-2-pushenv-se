"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarPlus } from "lucide-react";
import { toast } from "sonner";
import {
  AdminEmptyState,
  AdminLoadingState,
  AdminMobileCard,
  AdminMobileList,
  AdminPageHeader,
  AdminPagePanel,
  AdminPagination,
  AdminPrimaryCell,
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeaderCell,
  AdminTableRow,
  AdminTableWrapper,
  AdminToolbar,
} from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { ApiResponse } from "@/types/api";
import { AdminEvent } from "./EventModals/types";
import { CreateModal } from "./EventModals/CreateModal";

type EventsPayload = {
  data: AdminEvent[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

const LIMIT = 10;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function buildPages(page: number, total: number): (number | "...")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const items: (number | "...")[] = [1];
  if (page > 3) items.push("...");
  for (let i = Math.max(2, page - 1); i <= Math.min(total - 1, page + 1); i++) items.push(i);
  if (page < total - 2) items.push("...");
  items.push(total);
  return items;
}

function publishBadgeClassName(isPublished: boolean) {
  return isPublished
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-amber-200 bg-amber-50 text-amber-700";
}

export function EventManagementPage() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const fetchEvents = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<EventsPayload>>("/admin/events", {
        params: { page: p, limit: LIMIT },
      });
      setEvents(res.data.data);
      setTotalPages(res.data.totalPages);
      setTotalEvents(res.data.total);
    } catch {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents(page);
  }, [fetchEvents, page]);

  const filteredEvents = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return events;
    return events.filter(event =>
      [event.name, event.location, event.description]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [events, query]);

  const pages = buildPages(page, totalPages);
  const publishedCount = events.filter(event => event.isPublished).length;
  const registrationsCount = events.reduce((sum, event) => sum + event._count.registrations, 0);
  const companiesCount = events.reduce((sum, event) => sum + event._count.companies, 0);

  return (
    <AdminPagePanel>
      <AdminPageHeader
        eyebrow="Event roster"
        title="Events"
        actions={
          <Button className="rounded-xl" onClick={() => setShowCreate(true)}>
            <CalendarPlus className="mr-2 h-4 w-4" />
            Create event
          </Button>
        }
        stats={[
          { label: "Total events", value: totalEvents, hint: "Published and draft" },
          { label: "Published on page", value: publishedCount, hint: "Current page load" },
          { label: "Companies linked", value: companiesCount, hint: "Current page load" },
          { label: "Registrations", value: registrationsCount, hint: "Current page load" },
        ]}
      />

      <AdminToolbar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search by event name, location, or description"
        summary={`Showing ${filteredEvents.length} of ${events.length} loaded events on this page.`}
      />

      <AdminTableWrapper>
        {loading && <AdminLoadingState label="Loading event roster..." />}
        {!loading && filteredEvents.length === 0 && (
          <AdminEmptyState
            title={query ? "No matching events" : "No events found"}
            description={
              query
                ? "Try a broader name or location query."
                : "Create an event to start building the admin event flow."
            }
          />
        )}
        {!loading && filteredEvents.length > 0 && (
          <>
            <AdminTable>
              <AdminTableHead>
                <tr>
                  <AdminTableHeaderCell className="w-[34%]">Event</AdminTableHeaderCell>
                  <AdminTableHeaderCell className="w-[14%]">Status</AdminTableHeaderCell>
                  <AdminTableHeaderCell className="w-[14%]">Date</AdminTableHeaderCell>
                  <AdminTableHeaderCell className="w-[12%]">Companies</AdminTableHeaderCell>
                  <AdminTableHeaderCell className="w-[12%]">Registrations</AdminTableHeaderCell>
                  <AdminTableHeaderCell className="w-[14%] text-right">Details</AdminTableHeaderCell>
                </tr>
              </AdminTableHead>
              <AdminTableBody>
                {filteredEvents.map(event => (
                  <AdminTableRow key={event.id}>
                    <AdminTableCell className="text-slate-950">
                      <AdminPrimaryCell title={event.name} subtitle={event.location} />
                    </AdminTableCell>
                    <AdminTableCell>
                      <Badge variant="outline" className={cn("rounded-full px-2.5 py-1 text-xs font-medium", publishBadgeClassName(event.isPublished))}>
                        {event.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="space-y-1">
                        <p>{formatDate(event.startDate)}</p>
                        <p className="text-xs text-slate-500">to {formatDate(event.endDate)}</p>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>{event._count.companies}</AdminTableCell>
                    <AdminTableCell>{event._count.registrations}</AdminTableCell>
                    <AdminTableCell className="text-right">
                      <Button asChild variant="outline" size="sm" className="rounded-xl border-slate-200">
                        <Link href={`/admin/events/${event.id}`}>
                          See details
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </AdminTableCell>
                  </AdminTableRow>
                ))}
              </AdminTableBody>
            </AdminTable>

            <AdminMobileList>
              {filteredEvents.map(event => (
                <AdminMobileCard key={event.id}>
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-slate-950">{event.name}</p>
                    <p className="text-sm text-slate-500">{event.location}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="outline" className={cn("rounded-full px-2.5 py-1 text-xs font-medium", publishBadgeClassName(event.isPublished))}>
                      {event.isPublished ? "Published" : "Draft"}
                    </Badge>
                    <span className="text-sm text-slate-500">{formatDate(event.startDate)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Companies</p>
                      <p className="mt-1">{event._count.companies}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Registrations</p>
                      <p className="mt-1">{event._count.registrations}</p>
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm" className="rounded-xl border-slate-200">
                    <Link href={`/admin/events/${event.id}`}>
                      See details
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </AdminMobileCard>
              ))}
            </AdminMobileList>
          </>
        )}
      </AdminTableWrapper>

      <AdminPagination page={page} totalPages={totalPages} pages={pages} onPageChange={setPage} />

      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            fetchEvents(page);
          }}
        />
      )}
    </AdminPagePanel>
  );
}
