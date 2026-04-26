"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { ArrowLeft, BriefcaseBusiness, Building2, CalendarDays, Globe, Mail, Trash2 } from "lucide-react";
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
import { resolveAssetUrl } from "@/lib/event-utils";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { ApiResponse } from "@/types/api";
import type { CompanyProfile } from "@/types/company";
import type { JobListing } from "@/types/job";
import type { EventType } from "@/components/shared/EventCard";

type CompanyDetail = CompanyProfile & {
  eventLinks?: {
    eventId: string;
    companyId: string;
    event: EventType;
  }[];
};

export function AdminCompanyDetailPage({ companyId }: { companyId: string }) {
  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState({ website: "", description: "" });

  const loadCompany = useCallback(async () => {
    setLoading(true);
    try {
      const [companyRes, jobsRes] = await Promise.all([
        api.get<ApiResponse<CompanyDetail>>(`/companies/${companyId}`),
        api.get<ApiResponse<JobListing[]>>(`/admin/companies/${companyId}/jobs`),
      ]);
      setCompany(companyRes.data);
      setJobs(jobsRes.data);
      setForm({
        website: companyRes.data.website ?? "",
        description: companyRes.data.description ?? "",
      });
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Failed to load company";
      toast.error(message);
      setCompany(null);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    loadCompany();
  }, [loadCompany]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/admin/companies/${companyId}`, {
        website: form.website || undefined,
        description: form.description || undefined,
      });
      toast.success("Company updated");
      await loadCompany();
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Failed to update company";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!company) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/accounts/${company.companyUserId}`);
      toast.success("Company deleted");
      window.location.href = "/admin/companies";
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Failed to delete company";
      toast.error(message);
      setDeleting(false);
    }
  }

  const logoUrl = useMemo(() => {
    const url = resolveAssetUrl(company?.logo);
    if (!url) return "";
    return (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) ? url : "";
  }, [company?.logo]);

  if (loading) return <AdminLoadingState label="Loading company..." />;

  if (!company) {
    return (
      <AdminPagePanel>
        <AdminEmptyState
          title="Company not found"
          description="The company record may have been removed or is no longer available."
        />
      </AdminPagePanel>
    );
  }

  return (
    <div className="space-y-6">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="h-8 gap-1.5 rounded-lg text-slate-500 hover:text-slate-900"
      >
        <Link href="/admin/companies">
          <ArrowLeft className="h-3.5 w-3.5" />
          Companies
        </Link>
      </Button>

      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
          {logoUrl ? (
            <Image src={logoUrl} alt={company.companyUser.name} className="h-full w-full object-cover" width={44} height={44} />
          ) : (
            <Building2 className="h-5 w-5 text-slate-400" />
          )}
        </div>
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{company.companyUser.name}</h1>
          <p className="mt-0.5 text-sm text-slate-500">{company.companyUser.email}</p>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <AdminPagePanel>
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-slate-900">About</h2>
            </div>
            <div className="px-5 py-5">
              <p className="whitespace-pre-line text-sm leading-6 text-slate-600">
                {company.description || "No description provided."}
              </p>
            </div>
          </AdminPagePanel>

          <AdminPagePanel>
            <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
              <CalendarDays className="h-4 w-4 text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-900">Participated events</h2>
            </div>
            <div className="px-5 py-5">
              {!company.eventLinks?.length ? (
                <p className="text-sm text-slate-500">Not linked to any events yet.</p>
              ) : (
                <div className="grid gap-2 md:grid-cols-2">
                  {company.eventLinks.map(link => (
                    <Link
                      key={link.eventId}
                      href={`/admin/events/${link.event.id}`}
                      className="rounded-lg border border-slate-100 px-4 py-3 transition-colors hover:bg-slate-50"
                    >
                      <p className="text-sm font-medium text-slate-900">{link.event.name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{link.event.location}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </AdminPagePanel>

          <AdminPagePanel>
            <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
              <BriefcaseBusiness className="h-4 w-4 text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-900">Job listings</h2>
              <span className="ml-auto text-xs font-medium tabular-nums text-slate-400">{jobs.length}</span>
            </div>
            <div className="px-5 py-5">
              {!jobs.length ? (
                <p className="text-sm text-slate-500">No job listings yet.</p>
              ) : (
                <div className="space-y-2">
                  {jobs.map(job => (
                    <div key={job.id} className="rounded-lg border border-slate-100 px-4 py-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-slate-900">{job.title}</p>
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-medium",
                            job.isClosed
                              ? "border-amber-200 bg-amber-50 text-amber-700"
                              : "border-emerald-200 bg-emerald-50 text-emerald-700",
                          )}
                        >
                          {job.isClosed ? "Closed" : "Open"}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {job.type} · {job.location}
                      </p>
                      {job.salary ? <p className="mt-1 text-xs text-slate-600">{job.salary}</p> : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </AdminPagePanel>
        </div>

        <div className="space-y-4">
          <AdminPagePanel>
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-slate-900">Quick facts</h2>
            </div>
            <div className="space-y-4 px-5 py-5">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div>
                  <p className="text-[11px] font-semibold uppercase text-slate-400">Email</p>
                  <p className="mt-1 break-all text-sm text-slate-700">{company.companyUser.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Globe className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div>
                  <p className="text-[11px] font-semibold uppercase text-slate-400">Website</p>
                  {company.website ? (
                    <a
                      href={
                        company.website.startsWith("http://") || company.website.startsWith("https://")
                          ? company.website
                          : `https://${company.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block break-all text-sm text-slate-900 underline-offset-4 hover:underline"
                    >
                      {company.website}
                    </a>
                  ) : (
                    <p className="mt-1 text-sm text-slate-500">Not set</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <BriefcaseBusiness className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div>
                  <p className="text-[11px] font-semibold uppercase text-slate-400">Total jobs</p>
                  <p className="mt-1 text-sm text-slate-700">{jobs.length}</p>
                </div>
              </div>
            </div>
          </AdminPagePanel>

          <AdminPagePanel>
            <form onSubmit={handleSave}>
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-sm font-semibold text-slate-900">Edit profile</h2>
              </div>
              <div className="space-y-4 px-5 py-5">
                <div>
                  <Label className="mb-1.5 block text-xs font-medium text-slate-600">Website</Label>
                  <div className="relative">
                    <Globe className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <Input
                      value={form.website}
                      onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                      placeholder="https://example.com"
                      className={cn("h-9 rounded-lg pl-9 text-sm", adminInputClassName)}
                    />
                  </div>
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs font-medium text-slate-600">Description</Label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Describe the company, team, or hiring focus"
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
                <Button
                  type="submit"
                  size="sm"
                  className="h-8 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </form>
          </AdminPagePanel>
        </div>
      </div>

      <ConfirmModal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete company"
        description="This will permanently delete the company and its account. This cannot be undone."
        confirmLabel="Delete company"
      />
    </div>
  );
}
