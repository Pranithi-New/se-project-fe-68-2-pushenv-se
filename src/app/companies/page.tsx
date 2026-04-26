"use client";

import { useEffect, Suspense } from "react";
import { useCompanies } from "@/hooks/company/useCompanies";
import { CompanyCard } from "@/components/shared/CompanyCard";
import CompanyTableView from "@/components/shared/CompanyTableView";
import ExplorerToolbar from "@/components/shared/ExplorerToolbar";
import Pagination from "@/components/shared/Pagination";
import { useSearchParams } from "next/navigation";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "a-z", label: "A-Z" },
  { value: "z-a", label: "Z-A" },
];

function CompaniesExplorer() {
  const searchParams = useSearchParams();

  const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10));
  const sortParam = searchParams.get("sort") || "newest";
  const searchParam = searchParams.get("search") || "";
  const view = searchParams.get("view") === "table" ? "table" : "card";
  const limit = 12;

  const { companies, total, loading, fetchCompanies } = useCompanies();

  useEffect(() => {
    fetchCompanies(page, limit, searchParam, sortParam);
  }, [page, limit, searchParam, sortParam, fetchCompanies]);

  const mappedCompanies = (companies ?? []).map((cp) => ({
    id: cp.id,
    name: cp.companyUser.name,
    email: cp.companyUser.email,
    description: cp.description,
    logo: cp.logo,
  }));

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <ExplorerToolbar
        title="All Companies"
        total={total}
        searchPlaceholder="Search companies..."
        sortOptions={SORT_OPTIONS}
      />

      <div className="w-full">
        {loading && (
          <div className="w-full py-20 flex justify-center items-center">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-black rounded-full animate-spin" />
          </div>
        )}
        {!loading && mappedCompanies.length === 0 && (
          <div className="w-full py-20 text-center text-slate-400 italic text-sm font-sans">
            No companies found.
          </div>
        )}
        {!loading && mappedCompanies.length > 0 && view === "table" && (
          <CompanyTableView companies={mappedCompanies} />
        )}
        {!loading && mappedCompanies.length > 0 && view !== "table" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {mappedCompanies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        )}
      </div>

      <div className="w-full flex justify-center">
        <Pagination total={total} limit={limit} currentPage={page} basePath="/companies" />
      </div>
    </div>
  );
}

export default function CompaniesPage() {
  return (
    <div className="w-full bg-white flex flex-col justify-start items-center overflow-hidden font-sans">
      {/* Banner */}
      <div className="w-full h-96 flex flex-col justify-center items-center relative overflow-hidden bg-slate-900">
        <img
          src="/images/company-banner.png"
          onError={(e) => { e.currentTarget.style.display = "none"; }}
          className="absolute inset-0 w-full h-full object-cover opacity-50 block"
          alt="Banner"
        />
        <div className="z-10 flex flex-col justify-center items-center text-center gap-2">
          <h1 className="text-white text-5xl font-semibold font-sans leading-[48px]">Company</h1>
          <p className="text-white/90 text-sm font-normal uppercase leading-5 tracking-wider">
            EXPLORE OUR PARTNER COMPANIES
          </p>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="w-full py-20 flex justify-center items-center">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-black rounded-full animate-spin" />
          </div>
        }
      >
        <CompaniesExplorer />
      </Suspense>
    </div>
  );
}
