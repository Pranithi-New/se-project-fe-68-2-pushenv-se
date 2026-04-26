"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, UserPlus } from "lucide-react";
import { toast } from "sonner";
import {
  AdminDialog,
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
  adminInputClassName,
  adminSelectClassName,
} from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
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

type CreateForm = { name: string; email: string; password: string; role: "jobSeeker" | "companyUser" };

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
  for (let i = Math.max(2, page - 1); i <= Math.min(total - 1, page + 1); i++) items.push(i);
  if (page < total - 2) items.push("...");
  items.push(total);
  return items;
}

function extractErrorMessage(err: unknown, fallback: string) {
  return err && typeof err === "object" && "message" in err
    ? String((err as { message: unknown }).message)
    : fallback;
}

function roleBadgeClassName(role: AdminUser["role"]) {
  if (role === "systemAdmin") return "border-slate-900 bg-slate-900 text-white";
  if (role === "companyUser") return "border-slate-200 bg-slate-100 text-slate-700";
  return "border-sky-200 bg-sky-50 text-sky-700";
}

function CreateModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState<CreateForm>({ name: "", email: "", password: "", role: "jobSeeker" });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/admin/accounts", form);
      toast.success("Account created");
      onCreated();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Failed to create account"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminDialog
      title="Create account"
      description="Create a participant or company account, then continue editing it from the dedicated detail page."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5 sm:px-6 sm:py-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label className="mb-2 block text-sm font-medium text-slate-700">Name</Label>
            <Input
              required
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className={cn("h-11 rounded-xl", adminInputClassName)}
            />
          </div>
          <div className="sm:col-span-2">
            <Label className="mb-2 block text-sm font-medium text-slate-700">Email</Label>
            <Input
              required
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className={cn("h-11 rounded-xl", adminInputClassName)}
            />
          </div>
          <div>
            <Label className="mb-2 block text-sm font-medium text-slate-700">Password</Label>
            <Input
              required
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className={cn("h-11 rounded-xl", adminInputClassName)}
            />
          </div>
          <div>
            <Label className="mb-2 block text-sm font-medium text-slate-700">Role</Label>
            <select
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value as CreateForm["role"] }))}
              className={adminSelectClassName}
            >
              <option value="jobSeeker">Participant</option>
              <option value="companyUser">Company</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
          <Button type="button" variant="outline" className="rounded-xl border-slate-200" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="rounded-xl" disabled={saving}>
            {saving ? "Creating..." : "Create account"}
          </Button>
        </div>
      </form>
    </AdminDialog>
  );
}

export function UserManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const fetchUsers = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<AccountsPayload>>("/admin/accounts", {
        params: { page: p, limit: LIMIT },
      });
      setUsers(res.data.data);
      setTotalPages(res.data.totalPages);
      setTotalUsers(res.data.total);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(page);
  }, [fetchUsers, page]);

  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return users;

    return users.filter(user =>
      [user.name, user.email, user.phone ?? "", ROLE_LABELS[user.role] ?? user.role]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [query, users]);

  const pages = buildPages(page, totalPages);
  const adminCount = users.filter(user => user.role === "systemAdmin").length;
  const participantCount = users.filter(user => user.role === "jobSeeker").length;
  const companyCount = users.filter(user => user.role === "companyUser").length;

  return (
    <AdminPagePanel>
      <AdminPageHeader
        eyebrow="Account directory"
        title="Users"
        actions={
          <Button className="rounded-xl" onClick={() => setShowCreate(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Create account
          </Button>
        }
        stats={[
          { label: "Total accounts", value: totalUsers, hint: "Across all roles" },
          { label: "Participants", value: participantCount, hint: "Visible on this page" },
          { label: "Company users", value: companyCount, hint: "Visible on this page" },
          { label: "Admins", value: adminCount, hint: "Internal operators" },
        ]}
      />

      <AdminToolbar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search by name, email, phone, or role"
        summary={`Showing ${filteredUsers.length} of ${users.length} loaded records on this page.`}
      />

      <AdminTableWrapper>
        {loading && <AdminLoadingState label="Loading account data..." />}
        {!loading && filteredUsers.length === 0 && (
          <AdminEmptyState
            title={query ? "No matching accounts" : "No users found"}
            description={
              query
                ? "Try a different name, email, or role to widen the results."
                : "New accounts will appear here as soon as they are created."
            }
          />
        )}
        {!loading && filteredUsers.length > 0 && (
          <>
            <AdminTable>
              <AdminTableHead>
                <tr>
                  <AdminTableHeaderCell className="w-[34%]">Account</AdminTableHeaderCell>
                  <AdminTableHeaderCell className="w-[16%]">Role</AdminTableHeaderCell>
                  <AdminTableHeaderCell className="w-[18%]">Contact</AdminTableHeaderCell>
                  <AdminTableHeaderCell className="w-[16%]">Updated</AdminTableHeaderCell>
                  <AdminTableHeaderCell className="w-[16%] text-right">Details</AdminTableHeaderCell>
                </tr>
              </AdminTableHead>
              <AdminTableBody>
                {filteredUsers.map(user => (
                  <AdminTableRow key={user.id}>
                    <AdminTableCell className="text-slate-950">
                      <AdminPrimaryCell title={user.name} subtitle={user.email} />
                    </AdminTableCell>
                    <AdminTableCell>
                      <Badge variant="outline" className={cn("rounded-full px-2.5 py-1 text-xs font-medium", roleBadgeClassName(user.role))}>
                        {ROLE_LABELS[user.role] ?? user.role}
                      </Badge>
                    </AdminTableCell>
                    <AdminTableCell>{user.phone || "No phone"}</AdminTableCell>
                    <AdminTableCell>{formatDate(user.updatedAt)}</AdminTableCell>
                    <AdminTableCell className="text-right">
                      <Button asChild variant="outline" size="sm" className="rounded-xl border-slate-200">
                        <Link href={`/admin/users/${user.id}`}>
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
              {filteredUsers.map(user => (
                <AdminMobileCard key={user.id}>
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-slate-950">{user.name}</p>
                    <p className="text-sm text-slate-500">{user.email}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="outline" className={cn("rounded-full px-2.5 py-1 text-xs font-medium", roleBadgeClassName(user.role))}>
                      {ROLE_LABELS[user.role] ?? user.role}
                    </Badge>
                    <span className="text-sm text-slate-500">{user.phone || "No phone"}</span>
                  </div>
                  <Button asChild variant="outline" size="sm" className="rounded-xl border-slate-200">
                    <Link href={`/admin/users/${user.id}`}>
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
            fetchUsers(page);
          }}
        />
      )}
    </AdminPagePanel>
  );
}
