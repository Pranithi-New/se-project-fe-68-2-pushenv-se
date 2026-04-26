"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  ExternalLink,
  Globe,
  MapPin,
  Plus,
  Search,
  Trash2,
  UsersRound,
} from "lucide-react";
import { CompanySearchModal } from "@/components/shared/CompanySearchModal";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { toast } from "sonner";
import {
  AdminEmptyState,
  AdminLoadingState,
  AdminPagePanel,
  adminInputClassName,
  adminTextareaClassName,
} from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { formatDateRange, resolveAssetUrl } from "@/lib/event-utils";
import { cn } from "@/lib/utils";
import type { ApiResponse } from "@/types/api";

function CompanyList({
  companies,
  onRemove,
}: {
  companies: Array<{
    companyId: string;
    company: {
      id: string;
      description?: string | null;
      logo?: string | null;
      website?: string | null;
      companyUser: { id: string; name: string; email: string; phone?: string | null };
    };
  }>;
  onRemove: (companyId: string) => void;
}) {
  const [filter, setFilter] = useState("");
  const filtered = filter
    ? companies.filter(
        l =>
          l.company.companyUser.name.toLowerCase().includes(filter.toLowerCase()) ||
          l.company.companyUser.email.toLowerCase().includes(filter.toLowerCase()),
      )
    : companies;

  return (
    <div className="px-5 py-5 space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search companies…"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
        />
      </div>
      {!companies.length ? (
        <p className="text-sm text-slate-500">No companies assigned yet.</p>
      ) : !filtered.length ? (
        <p className="text-sm text-slate-500">No companies match your search.</p>
      ) : (
        <div className="max-h-[480px] overflow-y-auto space-y-1.5">
          {filtered.map(link => (
            <div
              key={link.company.id}
              className="group flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-4 py-3"
            >
              <div className="min-w-0">
                <Link
                  href={`/admin/companies/${link.company.id}`}
                  className="text-sm font-medium text-slate-900 underline-offset-4 hover:underline"
                >
                  {link.company.companyUser.name}
                </Link>
                <p className="mt-0.5 text-xs text-slate-500">{link.company.companyUser.email}</p>
              </div>
              <button
                type="button"
                onClick={() => onRemove(link.company.id)}
                className="shrink-0 text-xs font-medium text-rose-600 opacity-0 group-hover:opacity-100 hover:text-rose-700 transition-opacity"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
      {filter && filtered.length > 0 && (
        <p className="text-xs text-slate-400">{filtered.length} of {companies.length} companies</p>
      )}
    </div>
  );
}

type EventCompany = {
  companyId: string;
  company: {
    id: string;
    description?: string | null;
    logo?: string | null;
    website?: string | null;
    companyUser: { id: string; name: string; email: string; phone?: string | null };
  };
};

type EventRegistration = {
  id: string;
  registeredAt: string;
  jobSeeker: { id: string; name: string; email: string };
};

type AdminEventDetail = {
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
  companies: EventCompany[];
  registrations: EventRegistration[];
  _count: { registrations: number; companies: number };
};


function extractErrorMessage(err: unknown, fallback: string) {
  return err && typeof err === "object" && "message" in err
    ? String((err as { message: unknown }).message)
    : fallback;
}

function formatDateInput(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

export function AdminEventDetailPage({ eventId }: { eventId: string }) {
  const [event, setEvent] = useState<AdminEventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    location: "",
    description: "",
    startDate: "",
    endDate: "",
    banner: "",
  });

  const loadEvent = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<AdminEventDetail>>(`/admin/events/${eventId}`);
      setEvent(res.data);
      setForm({
        name: res.data.name,
        location: res.data.location,
        description: res.data.description,
        startDate: formatDateInput(res.data.startDate),
        endDate: formatDateInput(res.data.endDate),
        banner: res.data.banner ?? "",
      });
    } catch (err) {
      toast.error(extractErrorMessage(err, "Failed to load event"));
      setEvent(null);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadEvent();
  }, [loadEvent]);


  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/admin/events/${eventId}`, {
        ...form,
        banner: form.banner || undefined,
      });
      toast.success("Event updated");
      await loadEvent();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Failed to update event"));
    } finally {
      setSaving(false);
    }
  }

  async function handleTogglePublish() {
    setPublishing(true);
    try {
      await api.patch(`/admin/events/${eventId}/publish`, {});
      toast.success(event?.isPublished ? "Event unpublished" : "Event published");
      await loadEvent();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Failed to update publish status"));
    } finally {
      setPublishing(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await api.delete(`/admin/events/${eventId}`);
      toast.success("Event deleted");
      window.location.href = "/admin/events";
    } catch (err) {
      toast.error(extractErrorMessage(err, "Failed to delete event"));
      setDeleting(false);
    }
  }

  async function handleAddCompany(company: { id: string; companyUser: { name: string; email: string } }) {
    try {
      await api.post(`/admin/events/${eventId}/companies`, { companyId: company.id });
      toast.success(`${company.companyUser.name} added to event`);
      await loadEvent();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Failed to add company"));
      throw err;
    }
  }

  async function handleRemoveCompany(companyId: string) {
    try {
      await api.delete(`/admin/events/${eventId}/companies/${companyId}`);
      toast.success("Company removed");
      setConfirmRemoveId(null);
      await loadEvent();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Failed to remove company"));
    }
  }

  const bannerUrl = useMemo(() => {
    const url = resolveAssetUrl(event?.banner);
    if (!url) return "";
    return (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) ? url : "";
  }, [event?.banner]);

  if (loading) return <AdminLoadingState label="Loading event..." />;

  if (!event) {
    return (
      <AdminPagePanel>
        <AdminEmptyState
          title="Event not found"
          description="The event may have been removed or is no longer available."
        />
      </AdminPagePanel>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 rounded-lg text-slate-500 hover:text-slate-900"
        >
          <Link href="/admin/events">
            <ArrowLeft className="h-3.5 w-3.5" />
            Events
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 rounded-lg border-slate-200 text-slate-600"
        >
          <Link href={`/events/${event.id}`} target="_blank">
            <ExternalLink className="h-3.5 w-3.5" />
            Public view
          </Link>
        </Button>
      </div>

      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5">
            <h1 className="truncate text-xl font-semibold text-slate-900">{event.name}</h1>
            <Badge
              variant="outline"
              className={cn(
                "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
                event.isPublished
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-amber-200 bg-amber-50 text-amber-700",
              )}
            >
              {event.isPublished ? "Published" : "Draft"}
            </Badge>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {event.location}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDateRange(event.startDate, event.endDate)}
            </span>
          </div>
        </div>

        {bannerUrl ? (
          <div className="hidden h-16 w-28 shrink-0 overflow-hidden rounded-lg border border-slate-200 sm:block">
            <Image src={bannerUrl} alt={event.name} className="h-full w-full object-cover" width={112} height={64} />
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-3">
        {[
          { label: "Companies", value: event._count.companies },
          { label: "Registrations", value: event._count.registrations },
          { label: "Status", value: event.isPublished ? "Live" : "Draft" },
        ].map(stat => (
          <div key={stat.label} className="rounded-lg border border-slate-200 bg-white px-4 py-3">
            <p className="text-[11px] font-semibold uppercase text-slate-400">{stat.label}</p>
            <p className="mt-1.5 text-xl font-bold tabular-nums text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <AdminPagePanel>
            <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
              <UsersRound className="h-4 w-4 text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-900">Participating companies</h2>
              <span className="text-xs font-medium tabular-nums text-slate-400">
                {event.companies.length}
              </span>
              <button
                type="button"
                onClick={() => setShowAddCompany(true)}
                className="ml-auto flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-slate-700"
              >
                <Plus className="h-3.5 w-3.5" />
                Add company
              </button>
            </div>
            <CompanyList companies={event.companies} onRemove={id => setConfirmRemoveId(id)} />
          </AdminPagePanel>

          <AdminPagePanel>
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-slate-900">Registered users</h2>
              <span className="ml-auto text-xs font-medium tabular-nums text-slate-400">
              </span>
            </div>
            <div className="px-5 py-5">
              {!event.registrations.length ? (
                <p className="text-sm text-slate-500">No registrations yet.</p>
              ) : (
                <div className="space-y-1.5">
                  {event.registrations.map(registration => (
                    <Link
                      key={registration.id}
                      href={`/admin/users/${registration.jobSeeker.id}`}
                      className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-4 py-3 transition-colors hover:bg-slate-50"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900">{registration.jobSeeker.name}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{registration.jobSeeker.email}</p>
                      </div>
                      <p className="shrink-0 text-xs text-slate-400">
                        {new Date(registration.registeredAt).toLocaleDateString("en-GB")}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </AdminPagePanel>
        </div>

        <div className="space-y-4">
          <AdminPagePanel>
            <form onSubmit={handleSave}>
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-sm font-semibold text-slate-900">Edit event</h2>
              </div>
              <div className="space-y-4 px-5 py-5">
                <div>
                  <Label className="mb-1.5 block text-xs font-medium text-slate-600">Name</Label>
                  <Input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className={cn("h-9 rounded-lg text-sm", adminInputClassName)}
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs font-medium text-slate-600">Location</Label>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <Input
                      value={form.location}
                      onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                      className={cn("h-9 rounded-lg pl-9 text-sm", adminInputClassName)}
                    />
                  </div>
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs font-medium text-slate-600">Banner URL</Label>
                  <div className="relative">
                    <Globe className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <Input
                      value={form.banner}
                      onChange={e => setForm(f => ({ ...f, banner: e.target.value }))}
                      placeholder="Optional"
                      className={cn("h-9 rounded-lg pl-9 text-sm", adminInputClassName)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="mb-1.5 block text-xs font-medium text-slate-600">Start date</Label>
                    <Input
                      type="date"
                      value={form.startDate}
                      onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                      className={cn("h-9 rounded-lg text-sm", adminInputClassName)}
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-xs font-medium text-slate-600">End date</Label>
                    <Input
                      type="date"
                      value={form.endDate}
                      onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                      className={cn("h-9 rounded-lg text-sm", adminInputClassName)}
                    />
                  </div>
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs font-medium text-slate-600">Description</Label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className={adminTextareaClassName}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-5 py-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                  onClick={() => setConfirmDelete(true)}
                  disabled={deleting}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {deleting ? "Deleting..." : "Delete"}
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-lg border-slate-200 text-xs"
                    onClick={handleTogglePublish}
                    disabled={publishing}
                  >
                    {publishing ? "Updating..." : event.isPublished ? "Unpublish" : "Publish"}
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="h-8 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            </form>
          </AdminPagePanel>

        </div>
      </div>

      <CompanySearchModal
        open={showAddCompany}
        onClose={() => setShowAddCompany(false)}
        onSelect={handleAddCompany}
        excludeIds={event.companies.map(l => l.company.id)}
        title="Add company to event"
      />

      <ConfirmModal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete event"
        description="This will permanently delete the event and all its data. This cannot be undone."
        confirmLabel="Delete event"
      />

      <ConfirmModal
        open={!!confirmRemoveId}
        onClose={() => setConfirmRemoveId(null)}
        onConfirm={() => handleRemoveCompany(confirmRemoveId!)}
        title="Remove company"
        description="Remove this company from the event? They will no longer appear as a participant."
        confirmLabel="Remove"
      />
    </div>
  );
}
