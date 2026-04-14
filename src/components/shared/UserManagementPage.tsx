"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Trash2, UserPlus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "jobSeeker" | "companyUser" | "systemAdmin";
  phone?: string | null;
  createdAt: string;
  updatedAt: string;
};

type AccountsPayload = {
  data: AdminUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

const ROLE_LABELS: Record<string, string> = {
  jobSeeker: "Participant",
  companyUser: "Company",
  systemAdmin: "Admin",
};

const LIMIT = 10;

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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

function extractErrorMessage(err: unknown, fallback: string) {
  return err && typeof err === "object" && "message" in err
    ? String((err as { message: unknown }).message)
    : fallback;
}

// ── Create Modal ──────────────────────────────────────────────────────────────

type CreateForm = { name: string; email: string; password: string; role: "jobSeeker" | "companyUser" };

function CreateModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState<CreateForm>({ name: "", email: "", password: "", role: "jobSeeker" });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/admin/accounts", form);
      toast.success("User created");
      onCreated();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Failed to create user"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="rounded-2xl bg-background p-6 shadow-md w-full max-w-md mx-4">
        <div className="flex items-center justify-between pb-4 mb-5 border-b">
          <p className="text-lg font-bold">Create User</p>
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
            <Label className="mb-1.5">Email</Label>
            <Input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <Label className="mb-1.5">Password</Label>
            <Input required type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          </div>
          <div>
            <Label className="mb-1.5">Role</Label>
            <select
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value as "jobSeeker" | "companyUser" }))}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="jobSeeker">Participant</option>
              <option value="companyUser">Company</option>
            </select>
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

type EditForm = { name: string; email: string; phone: string; password: string };

function EditModal({ user, onClose, onUpdated }: { user: AdminUser; onClose: () => void; onUpdated: () => void }) {
  const [form, setForm] = useState<EditForm>({
    name: user.name,
    email: user.email,
    phone: user.phone ?? "",
    password: "",
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const body: Record<string, string> = { name: form.name, email: form.email, phone: form.phone };
      if (form.password) body.password = form.password;
      await api.put(`/admin/accounts/${user.id}`, body);
      toast.success("User updated");
      onUpdated();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Failed to update user"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="rounded-2xl bg-background p-6 shadow-md w-full max-w-md mx-4">
        <div className="flex items-center justify-between pb-4 mb-5 border-b">
          <p className="text-lg font-bold">Edit User</p>
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
            <Label className="mb-1.5">Email</Label>
            <Input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <Label className="mb-1.5">Phone</Label>
            <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Optional" />
          </div>
          <div>
            <Label className="mb-1.5">New Password</Label>
            <Input
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="Leave blank to keep current"
            />
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

function DeleteModal({ user, onClose, onDeleted }: { user: AdminUser; onClose: () => void; onDeleted: () => void }) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await api.delete(`/admin/accounts/${user.id}`);
      toast.success("User deleted");
      onDeleted();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Failed to delete user"));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="rounded-2xl bg-background p-6 shadow-md w-full max-w-sm mx-4">
        <div className="flex items-center justify-between pb-4 mb-5 border-b">
          <p className="text-lg font-bold">Delete User</p>
          <button onClick={onClose} className="hover:text-muted-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Delete <span className="font-medium text-foreground">{user.name}</span>? This cannot be undone.
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

export function UserManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null);

  const fetchUsers = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<AccountsPayload>>("/admin/accounts", {
        params: { page: p, limit: LIMIT },
      });
      setUsers(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(page);
  }, [fetchUsers, page]);

  const pages = buildPages(page, totalPages);

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="rounded-2xl bg-background p-6 shadow-md">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-5 border-b">
            <p className="text-xl font-bold">User Management</p>
            <Button onClick={() => setShowCreate(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Create User
            </Button>
          </div>

          {/* Table */}
          {loading ? (
            <div className="py-16 text-center text-sm text-muted-foreground">Loading…</div>
          ) : users.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">No users found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-3 text-left font-medium text-muted-foreground w-[18%]">Name</th>
                  <th className="py-3 text-left font-medium text-muted-foreground w-[22%]">Email</th>
                  <th className="py-3 text-left font-medium text-muted-foreground w-[13%]">Role</th>
                  <th className="py-3 text-left font-medium text-muted-foreground w-[20%]">Created Date</th>
                  <th className="py-3 text-left font-medium text-muted-foreground w-[20%]">Last Updated</th>
                  <th className="py-3 text-left font-medium text-muted-foreground w-[7%]">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium">{user.name}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{user.email}</td>
                    <td className="py-3 pr-4">
                      <Badge variant="outline">{ROLE_LABELS[user.role] ?? user.role}</Badge>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">{formatDate(user.createdAt)}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{formatDate(user.updatedAt)}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditUser(user)}
                          className="hover:text-muted-foreground transition-colors"
                          aria-label="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteUser(user)}
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
                  <span key={`dots-${idx}`} className="px-2 py-1.5 text-sm text-muted-foreground">
                    …
                  </span>
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
            fetchUsers(page);
          }}
        />
      )}
      {editUser && (
        <EditModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onUpdated={() => {
            setEditUser(null);
            fetchUsers(page);
          }}
        />
      )}
      {deleteUser && (
        <DeleteModal
          user={deleteUser}
          onClose={() => setDeleteUser(null)}
          onDeleted={() => {
            setDeleteUser(null);
            fetchUsers(page);
          }}
        />
      )}
    </div>
  );
}
