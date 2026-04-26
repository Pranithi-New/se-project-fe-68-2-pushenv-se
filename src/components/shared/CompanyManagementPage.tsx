"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, Plus } from "lucide-react";
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
} from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
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
    <AdminDialog
      title="Create company"
      description="Create the company account first, then open the detail page to edit profile content and jobs."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5 sm:px-6 sm:py-6">
        <div className="grid gap-4">
          <div>
            <Label className="mb-2 block text-sm font-medium text-slate-700">Company name</Label>
            <Input
              required
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className={cn("h-11 rounded-xl", adminInputClassName)}
            />
          </div>
          <div>
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
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
          <Button type="button" variant="outline" className="rounded-xl border-slate-200" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="rounded-xl" disabled={saving}>
            {saving ? "Creating..." : "Create company"}
          </Button>
        </div>
      </form>
    </AdminDialog>
  );
}

export function CompanyManagementPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const fetchCompanies = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<CompaniesPayload>>("/admin/companies", {
        params: { page: p, limit: LIMIT },
      });
      setCompanies(res.data.data);
      setTotalPages(res.data.totalPages);
      setTotalCompanies(res.data.total);
    } catch {
      toast.error("Failed to load companies");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies(page);
  }, [fetchCompanies, page]);

  const filteredCompanies = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return companies;
    return companies.filter(company =>
      [company.companyUser.name, company.companyUser.email, company.website ?? "", company.description ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [companies, query]);

  const pages = buildPages(page, totalPages);
  const totalJobs = companies.reduce((sum, company) => sum + company._count.jobs, 0);
  const withWebsite = companies.filter(company => company.website).length;

  return (
    <AdminPagePanel>
      <AdminPageHeader
        eyebrow="Company directory"
        title="Companies"
        actions={
          <Button className="rounded-xl" onClick={() => setShowCreate(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create company
          </Button>
        }
        stats={[
          { label: "Total companies", value: totalCompanies, hint: "Across the directory" },
          { label: "Jobs on page", value: totalJobs, hint: "Combined active and closed listings" },
          { label: "Websites set", value: withWebsite, hint: "Visible on this page" },
          { label: "Newly updated", value: companies.length, hint: "Current page load" },
        ]}
      />

      <AdminToolbar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search by company name, email, website, or description"
        summary={`Showing ${filteredCompanies.length} of ${companies.length} loaded companies on this page.`}
      />

      <AdminTableWrapper>
        {loading && <AdminLoadingState label="Loading company data..." />}
        {!loading && filteredCompanies.length === 0 && (
          <AdminEmptyState
            title={query ? "No matching companies" : "No companies found"}
            description={
              query
                ? "Try a broader name or website query."
                : "Create a company to start managing its profile and jobs."
            }
          />
        )}
        {!loading && filteredCompanies.length > 0 && (
          <>
            <AdminTable>
              <AdminTableHead>
                <tr>
                  <AdminTableHeaderCell className="w-[32%]">Company</AdminTableHeaderCell>
                  <AdminTableHeaderCell className="w-[24%]">Website</AdminTableHeaderCell>
                  <AdminTableHeaderCell className="w-[12%]">Jobs</AdminTableHeaderCell>
                  <AdminTableHeaderCell className="w-[16%]">Updated</AdminTableHeaderCell>
                  <AdminTableHeaderCell className="w-[16%] text-right">Details</AdminTableHeaderCell>
                </tr>
              </AdminTableHead>
              <AdminTableBody>
                {filteredCompanies.map(company => (
                  <AdminTableRow key={company.id}>
                    <AdminTableCell className="text-slate-950">
                      <AdminPrimaryCell
                        title={company.companyUser.name}
                        subtitle={company.companyUser.email}
                      />
                    </AdminTableCell>
                    <AdminTableCell>
                      {company.website ? (
                        <a
                          href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate text-slate-700 underline-offset-4 hover:underline"
                        >
                          {company.website}
                        </a>
                      ) : (
                        "No website"
                      )}
                    </AdminTableCell>
                    <AdminTableCell>{company._count.jobs}</AdminTableCell>
                    <AdminTableCell>{formatDate(company.updatedAt)}</AdminTableCell>
                    <AdminTableCell className="text-right">
                      <Button asChild variant="outline" size="sm" className="rounded-xl border-slate-200">
                        <Link href={`/admin/companies/${company.id}`}>
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
              {filteredCompanies.map(company => (
                <AdminMobileCard key={company.id}>
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-slate-950">{company.companyUser.name}</p>
                    <p className="text-sm text-slate-500">{company.companyUser.email}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Jobs</p>
                      <p className="mt-1">{company._count.jobs}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Website</p>
                      <p className="mt-1 truncate">{company.website || "No website"}</p>
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm" className="rounded-xl border-slate-200">
                    <Link href={`/admin/companies/${company.id}`}>
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
            fetchCompanies(page);
          }}
        />
      )}
    </AdminPagePanel>
  );
}
