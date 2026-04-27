"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface PaginationProps {
  total: number;
  limit: number;
  currentPage: number;
  basePath?: string;
}

// ── Sub-components ──────────────────────────────────────────────────────────

function PageButton({
  page,
  active,
  onClick,
}: Readonly<{
  page: number | string;
  active?: boolean;
  onClick?: () => void;
}>) {
  if (page === "...") {
    return <span className="px-2 text-slate-400">...</span>;
  }

  return (
    <button
      onClick={onClick}
      className={`w-10 h-10 flex items-center justify-center rounded-lg border ${
        active
          ? "border-slate-300 bg-white"
          : "border-transparent text-slate-600 hover:bg-slate-50"
      } font-medium text-sm transition-all`}
    >
      {page}
    </button>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function Pagination({
  total,
  limit,
  currentPage,
  basePath = "/events",
}: Readonly<PaginationProps>) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`${basePath}?${params.toString()}`);
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    // Always show page 1
    pages.push(1);

    if (currentPage > 3) {
      pages.push("...");
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      if (i > 1 && i < totalPages) pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push("...");
    }

    // Always show last page
    pages.push(totalPages);

    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-4 py-8 select-none">
      <button
        disabled={currentPage === 1}
        onClick={() => handlePageChange(currentPage - 1)}
        className="px-4 py-2 text-slate-600 font-medium hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        Previous
      </button>

      <div className="flex items-center gap-2">
        {getPageNumbers().map((p, idx) => (
          <PageButton
            key={p === "..." ? `dots-${idx}` : p}
            page={p}
            active={currentPage === p}
            onClick={typeof p === "number" ? () => handlePageChange(p) : undefined}
          />
        ))}
      </div>

      <button
        disabled={currentPage === totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
        className="px-4 py-2 text-slate-600 font-medium hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        Next
      </button>
    </div>
  );
}
