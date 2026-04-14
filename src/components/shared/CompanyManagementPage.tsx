"use client";

import { useCallback, useEffect, useState } from "react";
import { Building2, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api";

type CompanyUser = { id: string; name: string; email: string };

type Company = {
  id: string;
  companyUserId: string;
  description?: string | null;
  website?: string | null;
  createdAt: string;
  updatedAt: string;
  companyUser: CompanyUser;
  _count: { jobs: number };
};

type CompaniesPayload = {
  data: Company[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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

function CreateModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/admin/accounts", { ...form, role: "companyUser" });
      toast.success("Company created");
      onCreated();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Failed to create company"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="rounded-2xl bg-background p-6 shadow-md w-full max-w-md mx-4">
        <div className="flex items-center justify-between pb-4 mb-5 border-b">
          <p className="text-lg font-bold">Create Company</p>
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

type EditForm = { description: string; website: string };

function EditModal({ company, onClose, onUpdated }: { company: Company; onClose: () => void; onUpdated: () => void }) {
  const [form, setForm] = useState<EditForm>({
    description: company.description ?? "",
    website: company.website ?? "",
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/admin/companies/${company.id}`, {
        description: form.description || undefined,
        website: form.website || undefined,
      });
      toast.success("Company updated");
      onUpdated();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Failed to update company"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="rounded-2xl bg-background p-6 shadow-md w-full max-w-md mx-4">
        <div className="flex items-center justify-between pb-4 mb-5 border-b">
          <p className="text-lg font-bold">Edit Company</p>
          <button onClick={onClose} className="hover:text-muted-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label className="mb-1.5">Website</Label>
            <Input
              value={form.website}
              onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
              placeholder="https://example.com"
            />
          </div>
          <div>
            <Label className="mb-1.5">Description</Label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={4}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              placeholder="Company description"
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

function DeleteModal({ company, onClose, onDeleted }: { company: Company; onClose: () => void; onDeleted: () => void }) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      // Deleting the user account cascades to company profile
      await api.delete(`/admin/accounts/${company.companyUserId}`);
      toast.success("Company deleted");
      onDeleted();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Failed to delete company"));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="rounded-2xl bg-background p-6 shadow-md w-full max-w-sm mx-4">
        <div className="flex items-center justify-between pb-4 mb-5 border-b">
          <p className="text-lg font-bold">Delete Company</p>
          <button onClick={onClose} className="hover:text-muted-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Delete <span className="font-medium text-foreground">{company.companyUser.name}</span>? This also deletes the user account and all jobs. This cannot be undone.
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

export function CompanyManagementPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [editCompany, setEditCompany] = useState<Company | null>(null);
  const [deleteCompany, setDeleteCompany] = useState<Company | null>(null);

  const fetchCompanies = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<CompaniesPayload>>("/admin/companies", {
        params: { page: p, limit: LIMIT },
      });
      setCompanies(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch {
      toast.error("Failed to load companies");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies(page);
  }, [fetchCompanies, page]);

  const pages = buildPages(page, totalPages);

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="rounded-2xl bg-background p-6 shadow-md">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-5 border-b">
            <p className="text-xl font-bold">Company Management</p>
            <Button onClick={() => setShowCreate(true)}>
              <Building2 className="h-4 w-4 mr-2" />
              Create Company
            </Button>
          </div>

          {/* Table */}
          {loading ? (
            <div className="py-16 text-center text-sm text-muted-foreground">Loading…</div>
          ) : companies.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">No companies found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-3 text-left font-medium text-muted-foreground w-[20%]">Name</th>
                  <th className="py-3 text-left font-medium text-muted-foreground w-[22%]">Email</th>
                  <th className="py-3 text-left font-medium text-muted-foreground w-[22%]">Website</th>
                  <th className="py-3 text-left font-medium text-muted-foreground w-[10%]">Jobs</th>
                  <th className="py-3 text-left font-medium text-muted-foreground w-[18%]">Created Date</th>
                  <th className="py-3 text-left font-medium text-muted-foreground w-[8%]">Action</th>
                </tr>
              </thead>
              <tbody>
                {companies.map(company => (
                  <tr key={company.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium">{company.companyUser.name}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{company.companyUser.email}</td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {company.website ? (
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline truncate block max-w-[180px]"
                        >
                          {company.website}
                        </a>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">{company._count.jobs}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{formatDate(company.createdAt)}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditCompany(company)}
                          className="hover:text-muted-foreground transition-colors"
                          aria-label="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteCompany(company)}
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
            fetchCompanies(page);
          }}
        />
      )}
      {editCompany && (
        <EditModal
          company={editCompany}
          onClose={() => setEditCompany(null)}
          onUpdated={() => {
            setEditCompany(null);
            fetchCompanies(page);
          }}
        />
      )}
      {deleteCompany && (
        <DeleteModal
          company={deleteCompany}
          onClose={() => setDeleteCompany(null)}
          onDeleted={() => {
            setDeleteCompany(null);
            fetchCompanies(page);
          }}
        />
      )}
    </div>
  );
}
