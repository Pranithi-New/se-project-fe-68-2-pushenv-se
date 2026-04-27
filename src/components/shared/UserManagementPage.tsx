"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, UserPlus } from "lucide-react";
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
import { buildPages, formatDateTime } from "@/components/shared/admin/admin-list-utils";
import { CreateAccountModal } from "@/components/shared/admin/CreateAccountModal";

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

function roleBadgeClassName(role: AdminUser["role"]) {
  if (role === "systemAdmin") return "border-slate-900 bg-slate-900 text-white";
  if (role === "companyUser") return "border-slate-200 bg-slate-100 text-slate-700";
  return "border-sky-200 bg-sky-50 text-sky-700";
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
                    <AdminTableCell>{formatDateTime(user.updatedAt)}</AdminTableCell>
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
        <CreateAccountModal
          title="Create account"
          description="Create a participant or company account, then continue editing it from the dedicated detail page."
          submitLabel="Create account"
          submittingLabel="Creating..."
          successMessage="Account created"
          failureMessage="Failed to create account"
          showRoleSelect
          defaultRole="jobSeeker"
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
