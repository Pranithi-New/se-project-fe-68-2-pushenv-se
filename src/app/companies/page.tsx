"use client";

import { useEffect, useState, Suspense } from "react";
import { Search } from "lucide-react";
import { useCompanies } from "@/hooks/company/useCompanies";
import { CompanyCard } from "@/components/shared/CompanyCard";
import Pagination from "@/components/shared/Pagination";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

function CompaniesExplorer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const sortParam = searchParams.get("sort") || "newest";
  const searchParam = searchParams.get("search") || "";

  const [search, setSearch] = useState(searchParam);
  const [debouncedSearch, setDebouncedSearch] = useState(searchParam);
  const limit = 12;

  const { companies, total, loading, fetchCompanies } = useCompanies();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (debouncedSearch !== searchParam) {
      const params = new URLSearchParams(searchParams.toString());
      if (debouncedSearch) {
        params.set("search", debouncedSearch);
      } else {
        params.delete("search");
      }
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);
    }
  }, [debouncedSearch, pathname, router, searchParams, searchParam]);

  useEffect(() => {
    fetchCompanies(page, limit, searchParam, sortParam);
  }, [page, limit, searchParam, sortParam, fetchCompanies]);

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", newSort);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-[1200px] mt-10 px-6 mx-auto flex flex-col items-center">
      {/* Filter Section */}
      <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Search Bar */}
        <div className="relative w-full md:w-auto md:max-w-[480px] flex-1">
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-[40px] rounded-xl border border-slate-200 bg-white px-6 pr-[60px] text-xl focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all font-sans"
          />
          <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={20} />
          </div>
        </div>

        {/* Results Count & Sort */}
        <div className="flex flex-row items-center gap-6 self-end md:self-center">
          <div className="text-slate-600 font-sans text-base">
            Showing <span className="font-semibold text-black">{total}</span>{" "}
            results
          </div>

          <div className="relative">
            <select
              value={sortParam}
              onChange={(e) => handleSortChange(e.target.value)}
              className="appearance-none bg-white border border-slate-200 rounded-lg px-4 py-2 pr-10 text-slate-700 font-sans focus:outline-none focus:ring-2 focus:ring-slate-300 font-medium cursor-pointer transition-all"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="a-z">A-Z</option>
              <option value="z-a">Z-A</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="w-full mt-6">
        {loading ? (
          <div className="w-full py-20 flex justify-center items-center">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-black rounded-full animate-spin"></div>
          </div>
        ) : companies && companies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 place-items-center sm:place-items-start">
            {companies.map((companyProfile) => {
              const mappedCompany = {
                id: companyProfile.id,
                name: companyProfile.companyUser.name,
                email: companyProfile.companyUser.email,
                description: companyProfile.description,
                logo: companyProfile.logo,
              };
              return (
                <CompanyCard key={companyProfile.id} company={mappedCompany} />
              );
            })}
          </div>
        ) : (
          <div className="w-full py-20 text-center text-slate-400 italic font-sans text-lg">
            No companies found.
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="w-full flex justify-center mt-6">
        <Pagination
          total={total}
          limit={limit}
          currentPage={page}
          basePath="/companies"
        />
      </div>
    </div>
  );
}

export default function CompaniesPage() {
  return (
    <div className="w-full bg-white flex flex-col justify-start items-center overflow-hidden font-sans pb-20">
      {/* Banner Section */}
      <div className="w-full h-[360px] flex flex-col justify-center items-center relative overflow-hidden bg-slate-900 px-4">
        <img
          src="/images/company-banner.png"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
          className="absolute inset-0 w-full h-full object-cover opacity-50 block"
          alt="Banner"
        />
        <div className="z-10 flex flex-col justify-center items-center text-center">
          <h1 className="text-white text-[48px] font-semibold leading-[48px] tracking-[-1.5px] mb-2">
            Company
          </h1>
          <p className="text-white/90 text-[14px] font-normal leading-[21px] tracking-[1.5px] uppercase">
            EXPLORE OUR PARTNER COMPANIES
          </p>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="w-full py-20 flex justify-center items-center">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-black rounded-full animate-spin"></div>
          </div>
        }
      >
        <CompaniesExplorer />
      </Suspense>
    </div>
  );
}
