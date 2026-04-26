"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { ArrowLeft, Building2, Mail, Phone, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AdminEmptyState,
  AdminLoadingState,
  AdminPagePanel,
  adminInputClassName,
} from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { ApiResponse } from "@/types/api";

type Registration = {
  id: string;
  registeredAt: string;
  event: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    location: string;
    isPublished: boolean;
  };
};

type AdminAccountDetail = {
  id: string;
  name: string;
  email: string;
  role: "jobSeeker" | "companyUser" | "systemAdmin";
  phone?: string | null;
  avatar?: string | null;
  createdAt: string;
  updatedAt: string;
  companyProfile?: {
    id: string;
    description?: string | null;
    logo?: string | null;
    website?: string | null;
    _count: { jobs: number };
  } | null;
  eventRegistrations: Registration[];
};

const ROLE_LABELS: Record<AdminAccountDetail["role"], string> = {
  jobSeeker: "Participant",
  companyUser: "Company user",
  systemAdmin: "Admin",
};

function roleBadgeClassName(role: AdminAccountDetail["role"]) {
  if (role === "systemAdmin") return "border-slate-200 bg-slate-50 text-slate-700";
  if (role === "companyUser") return "border-slate-200 bg-slate-100 text-slate-700";
  return "border-sky-200 bg-sky-50 text-sky-700";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function extractErrorMessage(err: unknown, fallback: string) {
  return err && typeof err === "object" && "message" in err
    ? String((err as { message: unknown }).message)
    : fallback;
}

function InitialAvatar({ name, role }: { name: string; role: AdminAccountDetail["role"] }) {
  const initial = name.trim()[0]?.toUpperCase() ?? "?";
  let bg = "bg-sky-100 text-sky-700";
  if (role === "systemAdmin" || role === "companyUser") {
    bg = "bg-slate-100 text-slate-700";
  }
  return (
    <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-bold", bg)}>
      {initial}
    </div>
  );
}

export function AdminUserDetailPage({ userId }: { userId: string }) {
  const [user, setUser] = useState<AdminAccountDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [passwordForm, setPasswordForm] = useState({ password: "", confirmPassword: "" });
  const [savingPassword, setSavingPassword] = useState(false);

  const loadUser = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<AdminAccountDetail>>(`/admin/accounts/${userId}`);
      setUser(res.data);
      setForm({
        name: res.data.name,
        email: res.data.email,
        phone: res.data.phone ?? "",
      });
    } catch (err) {
      toast.error(extractErrorMessage(err, "Failed to load account"));
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/admin/accounts/${userId}`, {
        name: form.name,
        email: form.email,
        phone: form.phone,
      });
      toast.success("Account updated");
      await loadUser();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Failed to update account"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await api.delete(`/admin/accounts/${userId}`);
      toast.success("Account deleted");
      window.location.href = "/admin/users";
    } catch (err) {
      toast.error(extractErrorMessage(err, "Failed to delete account"));
      setDeleting(false);
    }
  }

  async function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault();
    if (passwordForm.password !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (!passwordForm.password) {
      toast.error("Password cannot be empty");
      return;
    }
    setSavingPassword(true);
    try {
      await api.put(`/admin/accounts/${userId}`, { password: passwordForm.password });
      toast.success("Password updated");
      setPasswordForm({ password: "", confirmPassword: "" });
    } catch (err) {
      toast.error(extractErrorMessage(err, "Failed to update password"));
    } finally {
      setSavingPassword(false);
    }
  }

  if (loading) return <AdminLoadingState label="Loading account..." />;

  if (!user) {
    return (
      <AdminPagePanel>
        <AdminEmptyState
          title="Account not found"
          description="The account may have been removed or you may not have permission to view it."
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
        <Link href="/admin/users">
          <ArrowLeft className="h-3.5 w-3.5" />
          Users
        </Link>
      </Button>

      <div className="flex items-center gap-4">
        <InitialAvatar name={user.name} role={user.role} />
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-semibold text-slate-900">{user.name}</h1>
            <Badge
              variant="outline"
              className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", roleBadgeClassName(user.role))}
            >
              {ROLE_LABELS[user.role]}
            </Badge>
          </div>
          <p className="mt-0.5 text-sm text-slate-500">{user.email}</p>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <AdminPagePanel>
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-slate-900">Account activity</h2>
            </div>
            <div className="grid gap-6 px-5 py-5 sm:grid-cols-3">
              <div>
                <p className="text-[11px] font-semibold uppercase text-slate-400">Created</p>
                <p className="mt-1.5 text-sm text-slate-700">{formatDate(user.createdAt)}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase text-slate-400">Last updated</p>
                <p className="mt-1.5 text-sm text-slate-700">{formatDate(user.updatedAt)}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase text-slate-400">Registrations</p>
                <p className="mt-1.5 text-sm text-slate-700">{user.eventRegistrations.length}</p>
              </div>
            </div>
          </AdminPagePanel>

          {user.role === "jobSeeker" ? (
            <AdminPagePanel>
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-sm font-semibold text-slate-900">Registered events</h2>
              </div>
              <div className="px-5 py-5">
                {user.eventRegistrations.length === 0 ? (
                  <p className="text-sm text-slate-500">No event registrations yet.</p>
                ) : (
                  <div className="space-y-2">
                    {user.eventRegistrations.map(registration => (
                      <Link
                        key={registration.id}
                        href={`/admin/events/${registration.event.id}`}
                        className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-4 py-3 transition-colors hover:bg-slate-50"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-900">{registration.event.name}</p>
                          <p className="mt-0.5 text-xs text-slate-500">{registration.event.location}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <Badge
                            variant="outline"
                            className={cn(
                              "rounded-full px-2 py-0.5 text-xs font-medium",
                              registration.event.isPublished
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-amber-200 bg-amber-50 text-amber-700",
                            )}
                          >
                            {registration.event.isPublished ? "Published" : "Draft"}
                          </Badge>
                          <p className="text-xs text-slate-400">{formatDate(registration.registeredAt)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </AdminPagePanel>
          ) : null}
        </div>

        <div className="space-y-4">
          <AdminPagePanel>
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-slate-900">Contact</h2>
            </div>
            <div className="space-y-4 px-5 py-5">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div>
                  <p className="text-[11px] font-semibold uppercase text-slate-400">Email</p>
                  <p className="mt-1 break-all text-sm text-slate-700">{user.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div>
                  <p className="text-[11px] font-semibold uppercase text-slate-400">Phone</p>
                  <p className="mt-1 text-sm text-slate-700">{user.phone || "Not provided"}</p>
                </div>
              </div>
              {user.companyProfile ? (
                <div className="flex items-start gap-3">
                  <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <div>
                    <p className="text-[11px] font-semibold uppercase text-slate-400">Company</p>
                    <Link
                      href={`/admin/companies/${user.companyProfile.id}`}
                      className="mt-1 inline-block text-sm text-slate-900 underline-offset-4 hover:underline"
                    >
                      Open company detail
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>
          </AdminPagePanel>

          <AdminPagePanel>
            <form onSubmit={handleSave}>
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-sm font-semibold text-slate-900">Edit account</h2>
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
                  <Label className="mb-1.5 block text-xs font-medium text-slate-600">Email</Label>
                  <Input
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className={cn("h-9 rounded-lg text-sm", adminInputClassName)}
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs font-medium text-slate-600">Phone</Label>
                  <Input
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className={cn("h-9 rounded-lg text-sm", adminInputClassName)}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
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

          <AdminPagePanel>
            <form onSubmit={handlePasswordSave}>
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-sm font-semibold text-slate-900">Change password</h2>
              </div>
              <div className="space-y-4 px-5 py-5">
                <div>
                  <Label className="mb-1.5 block text-xs font-medium text-slate-600">New password</Label>
                  <Input
                    type="password"
                    value={passwordForm.password}
                    onChange={e => setPasswordForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Enter new password"
                    className={cn("h-9 rounded-lg text-sm", adminInputClassName)}
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs font-medium text-slate-600">Confirm password</Label>
                  <Input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={e => setPasswordForm(f => ({ ...f, confirmPassword: e.target.value }))}
                    placeholder="Repeat new password"
                    className={cn("h-9 rounded-lg text-sm", adminInputClassName)}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
                <Button
                  type="submit"
                  size="sm"
                  className="h-8 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
                  disabled={savingPassword}
                >
                  {savingPassword ? "Saving..." : "Update password"}
                </Button>
              </div>
            </form>
          </AdminPagePanel>

          <AdminPagePanel className="border-rose-200">
            <div className="border-b border-rose-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-rose-700">Danger zone</h2>
              <p className="mt-0.5 text-xs text-rose-500">These actions are irreversible. Proceed with caution.</p>
            </div>
            <div className="flex items-center justify-between px-5 py-5">
              <div>
                <p className="text-sm font-medium text-slate-900">Delete account</p>
                <p className="mt-0.5 text-xs text-slate-500">Permanently remove this account and all associated data.</p>
              </div>
              <Button
                type="button"
                size="sm"
                className="h-8 rounded-lg border border-rose-300 bg-white text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                onClick={() => setConfirmDelete(true)}
                disabled={deleting}
              >
                <Trash2 className="h-3.5 w-3.5" />
                {deleting ? "Deleting..." : "Delete account"}
              </Button>
            </div>
          </AdminPagePanel>
        </div>
      </div>

      <ConfirmModal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete account"
        description="This will permanently delete the user account and all associated data. This cannot be undone."
        confirmLabel="Delete account"
      />
    </div>
  );
}
