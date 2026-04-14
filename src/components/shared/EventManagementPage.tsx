"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarPlus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api";

type Event = {
  id: string;
  name: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  banner?: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  _count: { registrations: number; companies: number };
};

type EventsPayload = {
  data: Event[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type EventForm = {
  name: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
};

const LIMIT = 10;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Convert ISO/DB date to yyyy-MM-dd for <input type="date">
function toDateInput(iso: string) {
  return iso.slice(0, 10);
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

function extractErrorMessage(err: unknown, fallback: string) {
  return err && typeof err === "object" && "message" in err
    ? String((err as { message: unknown }).message)
    : fallback;
}

// ── Create Modal ──────────────────────────────────────────────────────────────

function CreateModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState<EventForm>({ name: "", description: "", location: "", startDate: "", endDate: "" });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/admin/events", form);
      toast.success("Event created");
      onCreated();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Failed to create event"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="rounded-2xl bg-background p-6 shadow-md w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 mb-5 border-b">
          <p className="text-lg font-bold">Create Event</p>
          <button onClick={onClose} className="hover:text-muted-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label className="mb-1.5">Name</Label>
            <Input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <Label className="mb-1.5">Location</Label>
            <Input required value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
          </div>
          <div>
            <Label className="mb-1.5">Description</Label>
            <textarea
              required
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5">Start Date</Label>
              <Input required type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div>
              <Label className="mb-1.5">End Date</Label>
              <Input required type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Creating…" : "Create"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Edit Modal ────────────────────────────────────────────────────────────────

function EditModal({ event, onClose, onUpdated }: { event: Event; onClose: () => void; onUpdated: () => void }) {
  const [form, setForm] = useState<EventForm>({
    name: event.name,
    description: event.description,
    location: event.location,
    startDate: toDateInput(event.startDate),
    endDate: toDateInput(event.endDate),
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/admin/events/${event.id}`, form);
      toast.success("Event updated");
      onUpdated();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Failed to update event"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="rounded-2xl bg-background p-6 shadow-md w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 mb-5 border-b">
          <p className="text-lg font-bold">Edit Event</p>
          <button onClick={onClose} className="hover:text-muted-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label className="mb-1.5">Name</Label>
            <Input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <Label className="mb-1.5">Location</Label>
            <Input required value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
          </div>
          <div>
            <Label className="mb-1.5">Description</Label>
            <textarea
              required
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5">Start Date</Label>
              <Input required type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div>
              <Label className="mb-1.5">End Date</Label>
              <Input required type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete Modal ──────────────────────────────────────────────────────────────

function DeleteModal({ event, onClose, onDeleted }: { event: Event; onClose: () => void; onDeleted: () => void }) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await api.delete(`/admin/events/${event.id}`);
      toast.success("Event deleted");
      onDeleted();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Failed to delete event"));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="rounded-2xl bg-background p-6 shadow-md w-full max-w-sm mx-4">
        <div className="flex items-center justify-between pb-4 mb-5 border-b">
          <p className="text-lg font-bold">Delete Event</p>
          <button onClick={onClose} className="hover:text-muted-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Delete <span className="font-medium text-foreground">{event.name}</span>? This cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function EventManagementPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [editEvent, setEditEvent] = useState<Event | null>(null);
  const [deleteEvent, setDeleteEvent] = useState<Event | null>(null);

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

  async function togglePublish(event: Event) {
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
