import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const adminInputClassName =
  "border-slate-200 bg-white text-slate-900 shadow-none placeholder:text-slate-400 focus-visible:border-slate-400 focus-visible:ring-2 focus-visible:ring-slate-200";

export const adminTextareaClassName =
  "min-h-[112px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-none outline-none transition-[border-color,box-shadow] placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 resize-none";

export const adminSelectClassName =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-none outline-none transition-[border-color,box-shadow] focus:border-slate-400 focus:ring-2 focus:ring-slate-200";

export function AdminPagePanel({
  children,
  className,
}: Readonly<{
  children: ReactNode;
  className?: string;
}>) {
  return (
    <section className={cn("rounded-xl border border-slate-200 bg-white", className)}>
      {children}
    </section>
  );
}

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
  stats,
}: Readonly<{
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  stats?: Array<{ label: string; value: string | number; hint?: string }>;
}>) {
  return (
    <div className="border-b border-slate-100 px-6 py-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase text-slate-900">{eyebrow}</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">{title}</h2>
          {description ? <p className="mt-1 max-w-xl text-sm text-slate-500">{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>

      {stats?.length ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(stat => (
            <div key={stat.label} className="rounded-lg border border-slate-200 bg-white px-4 py-3">
              <p className="text-[11px] font-semibold uppercase text-slate-400">{stat.label}</p>
              <p className="mt-1.5 text-2xl font-bold tabular-nums text-slate-900">{stat.value}</p>
              {stat.hint ? <p className="mt-0.5 text-xs text-slate-400">{stat.hint}</p> : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function AdminToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  summary,
  children,
}: Readonly<{
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  summary: string;
  children?: ReactNode;
}>) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-3.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center gap-4">
        <div className="relative max-w-xs flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchValue}
            onChange={event => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className={cn("h-9 rounded-lg pl-9 text-sm", adminInputClassName)}
          />
        </div>
        <p className="hidden text-xs text-slate-400 sm:block">{summary}</p>
      </div>
      {children ? <div className="flex items-center gap-2">{children}</div> : null}
    </div>
  );
}

export function AdminTableWrapper({ children }: Readonly<{ children: ReactNode }>) {
  return <div className="overflow-hidden">{children}</div>;
}

export function AdminTable({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full min-w-[880px] table-fixed text-sm">{children}</table>
    </div>
  );
}

export function AdminTableHead({ children }: Readonly<{ children: ReactNode }>) {
  return <thead className="border-b border-slate-100 bg-slate-50/70">{children}</thead>;
}

export function AdminTableHeaderCell({
  children,
  className,
}: Readonly<{
  children: ReactNode;
  className?: string;
}>) {
  return (
    <th
      className={cn(
        "px-5 py-3 text-left text-[11px] font-semibold uppercase text-slate-400",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function AdminTableBody({ children }: Readonly<{ children: ReactNode }>) {
  return <tbody className="divide-y divide-slate-100">{children}</tbody>;
}

export function AdminTableRow({ children }: Readonly<{ children: ReactNode }>) {
  return <tr className="align-middle transition-colors hover:bg-slate-50/70">{children}</tr>;
}

export function AdminTableCell({
  children,
  className,
}: Readonly<{
  children: ReactNode;
  className?: string;
}>) {
  return <td className={cn("px-5 py-3.5 text-sm text-slate-600", className)}>{children}</td>;
}

export function AdminPrimaryCell({
  title,
  subtitle,
  meta,
}: Readonly<{
  title: string;
  subtitle?: string | null;
  meta?: ReactNode;
}>) {
  return (
    <div className="space-y-0.5">
      <p className="truncate font-medium text-slate-900">{title}</p>
      {subtitle ? <p className="truncate text-sm text-slate-500">{subtitle}</p> : null}
      {meta ? <div className="flex flex-wrap gap-2 pt-1">{meta}</div> : null}
    </div>
  );
}

export function AdminMetaText({ children }: Readonly<{ children: ReactNode }>) {
  return <span className="text-xs text-slate-500">{children}</span>;
}

export function AdminActionGroup({ children }: Readonly<{ children: ReactNode }>) {
  return <div className="flex flex-wrap items-center justify-end gap-2">{children}</div>;
}

export function AdminMobileList({ children }: Readonly<{ children: ReactNode }>) {
  return <div className="divide-y divide-slate-100 md:hidden">{children}</div>;
}

export function AdminMobileCard({ children }: Readonly<{ children: ReactNode }>) {
  return <div className="space-y-3 px-5 py-4">{children}</div>;
}

export function AdminEmptyState({
  title,
  description,
}: Readonly<{
  title: string;
  description: string;
}>) {
  return (
    <div className="px-6 py-14 text-center">
      <div className="mx-auto max-w-sm">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="mt-1.5 text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
}

export function AdminLoadingState({ label }: Readonly<{ label: string }>) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

export function AdminPagination({
  page,
  totalPages,
  pages,
  onPageChange,
}: Readonly<{
  page: number;
  totalPages: number;
  pages: Array<number | "...">;
  onPageChange: (page: number) => void;
}>) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-3.5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-slate-400">
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 rounded-lg border-slate-200 px-3 text-xs"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          Prev
        </Button>
        {pages.map((item, index) =>
          item === "..." ? (
            <span key={`dots-${String(pages[index + 1] ?? "end")}`} className="px-1 text-xs text-slate-400">
              …
            </span>
          ) : (
            <Button
              key={item}
              type="button"
              variant={item === page ? "default" : "outline"}
              size="sm"
              className={cn(
                "h-8 min-w-8 rounded-lg px-2 text-xs",
                item === page
                  ? "bg-slate-900 text-white hover:bg-slate-800"
                  : "border-slate-200",
              )}
              onClick={() => onPageChange(item)}
            >
              {item}
            </Button>
          ),
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 rounded-lg border-slate-200 px-3 text-xs"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export function AdminDialog({
  title,
  description,
  onClose,
  children,
  className,
}: Readonly<{
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}>) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div
        className={cn(
          "w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-2xl",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 rounded-lg text-slate-400 hover:text-slate-700"
            onClick={onClose}
          >
            <span className="sr-only">Close</span>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
