"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import ViewToggle from "./ViewToggle";

interface SortOption {
  value: string;
  label: string;
}

interface ExplorerToolbarProps {
  title: string;
  total?: number;
  searchPlaceholder?: string;
  sortOptions?: SortOption[];
}

export default function ExplorerToolbar({
  title,
  total,
  searchPlaceholder,
  sortOptions,
}: ExplorerToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const searchParam = searchParams.get("search") || "";
  const sortParam = searchParams.get("sort") || sortOptions?.[0]?.value || "";

  const [search, setSearch] = useState(searchParam);

  useEffect(() => {
    setSearch(searchParam);
  }, [searchParam]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search === searchParam) return;
      const params = new URLSearchParams(searchParams.toString());
      if (search) params.set("search", search);
      else params.delete("search");
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);
    }, 500);
    return () => clearTimeout(timer);
  }, [search, searchParam, pathname, router, searchParams]);

  const handleSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const hasTopRow = !!searchPlaceholder || !!sortOptions?.length;

  return (
    <div className="w-full flex flex-col gap-4">
      {hasTopRow && (
        <div className="w-full flex flex-col gap-4 md:flex-row md:items-center">
          {searchPlaceholder && (
            <div className="relative w-full flex-1 min-w-0">
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Search size={16} />
              </div>
            </div>
          )}

          <div className="flex shrink-0 items-center gap-4 self-end md:self-center">
            {total !== undefined && (
              <span className="text-slate-600 text-sm font-sans">
                Showing <span className="font-semibold text-black">{total}</span> results
              </span>
            )}

            {sortOptions && sortOptions.length > 0 && (
              <div className="relative">
                <select
                  value={sortParam}
                  onChange={(e) => handleSort(e.target.value)}
                  className="appearance-none bg-white border border-slate-200 rounded-lg px-4 py-2 pr-10 text-sm text-slate-700 font-sans font-medium focus:outline-none focus:ring-2 focus:ring-slate-300 cursor-pointer transition-all"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="w-full flex justify-between items-center">
        <span className="text-black text-lg font-semibold font-sans uppercase tracking-tight">
          {title}
        </span>
        <ViewToggle />
      </div>
    </div>
  );
}
