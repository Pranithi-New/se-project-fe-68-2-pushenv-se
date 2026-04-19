"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarPlus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api";

import { AdminEvent } from "./EventModals/types";
import { CreateModal } from "./EventModals/CreateModal";
import { EditModal } from "./EventModals/EditModal";
import { DeleteModal } from "./EventModals/DeleteModal";
import { extractErrorMessage } from "./EventModals/utils";

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
  for (let i = Math.max(2, page - 1); i <= Math.min(total - 1, page + 1); i++) {
    items.push(i);
  }
  if (page < total - 2) items.push("...");
  items.push(total);
  return items;
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function EventManagementPage() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [editEvent, setEditEvent] = useState<AdminEvent | null>(null);
  const [deleteEvent, setDeleteEvent] = useState<AdminEvent | null>(null);

  const fetchEvents = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<EventsPayload>>("/admin/events", {
        params: { page: p, limit: LIMIT },
      });
      setEvents(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents(page);
  }, [fetchEvents, page]);

  async function togglePublish(event: AdminEvent) {
    setPublishing(event.id);
    try {
      await api.patch(`/admin/events/${event.id}/publish`, {});
      toast.success(event.isPublished ? "Event unpublished" : "Event published");
      fetchEvents(page);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Failed to toggle publish"));
    } finally {
      setPublishing(null);
    }
  }

  const pages = buildPages(page, totalPages);

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="rounded-2xl bg-background p-6 shadow-md">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-5 border-b">
            <p className="text-xl font-bold">Event Management</p>
            <Button onClick={() => setShowCreate(true)}>
              <CalendarPlus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </div>

          {/* Table */}
          {loading ? (
            <div className="py-16 text-center text-sm text-muted-foreground">Loading…</div>
          ) : events.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">No events found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-3 text-left font-medium text-muted-foreground w-[22%]">Name</th>
                  <th className="py-3 text-left font-medium text-muted-foreground w-[14%]">Location</th>
                  <th className="py-3 text-left font-medium text-muted-foreground w-[11%]">Start</th>
                  <th className="py-3 text-left font-medium text-muted-foreground w-[11%]">End</th>
                  <th className="py-3 text-left font-medium text-muted-foreground w-[12%]">Status</th>
                  <th className="py-3 text-left font-medium text-muted-foreground w-[8%]">Companies</th>
                  <th className="py-3 text-left font-medium text-muted-foreground w-[8%]">Registrations</th>
                  <th className="py-3 text-left font-medium text-muted-foreground w-[14%]">Action</th>
                </tr>
              </thead>
              <tbody>
                {events.map(event => (
                  <tr key={event.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium">{event.name}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{event.location}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{formatDate(event.startDate)}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{formatDate(event.endDate)}</td>
                    <td className="py-3 pr-4">
                      <Badge variant={event.isPublished ? "default" : "outline"}>
                        {event.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">{event._count.companies}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{event._count.registrations}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => togglePublish(event)}
                          disabled={publishing === event.id}
                          className="text-xs px-2 py-0.5 rounded border border-input hover:bg-muted transition-colors disabled:opacity-40"
                          title={event.isPublished ? "Unpublish" : "Publish"}
                        >
                          {event.isPublished ? "Unpublish" : "Publish"}
                        </button>
                        <button
                          onClick={() => setEditEvent(event)}
                          className="hover:text-muted-foreground transition-colors"
                          aria-label="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteEvent(event)}
                          className="text-destructive hover:text-destructive/70 transition-colors"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-end gap-1 mt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm disabled:opacity-40 hover:text-muted-foreground transition-colors"
              >
                Previous
              </button>
              {pages.map((item, idx) =>
                item === "..." ? (
                  <span key={`dots-${idx}`} className="px-2 py-1.5 text-sm text-muted-foreground">…</span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setPage(item)}
                    className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                      item === page ? "bg-foreground text-background" : "hover:bg-muted"
                    }`}
                  >
                    {item}
                  </button>
                )
              )}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm disabled:opacity-40 hover:text-muted-foreground transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </main>

      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            fetchEvents(page);
          }}
        />
      )}
      {editEvent && (
        <EditModal
          event={editEvent}
          onClose={() => setEditEvent(null)}
          onUpdated={() => {
            setEditEvent(null);
            fetchEvents(page);
          }}
        />
      )}
      {deleteEvent && (
        <DeleteModal
          event={deleteEvent}
          onClose={() => setDeleteEvent(null)}
          onDeleted={() => {
            setDeleteEvent(null);
            fetchEvents(page);
          }}
        />
      )}
    </div>
  );
}
