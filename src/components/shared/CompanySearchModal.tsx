"use client";

import { useEffect, useRef, useState } from "react";
import { Building2, Check, Loader2, Search, X } from "lucide-react";
import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api";

type Company = {
  id: string;
  companyUser: { name: string; email: string };
  description?: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (company: Company) => Promise<void>;
  excludeIds?: string[];
  title?: string;
};

export function CompanySearchModal({ open, onClose, onSelect, excludeIds = [], title = "Add company" }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Company[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<Company | null>(null);
  const [adding, setAdding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setSelected(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.get<ApiResponse<{ data: Company[] }>>("/admin/companies", {
          params: { name: query, limit: 10 },
        });
        setResults(res.data.data);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  async function handleAdd() {
    if (!selected || adding) return;
    setAdding(true);
    try {
      await onSelect(selected);
      setSelected(null);
    } finally {
      setAdding(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[14vh]"
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="mx-4 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
          <Building2 className="h-4 w-4 shrink-0 text-slate-400" />
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search input */}
        <div className="relative border-b border-slate-100">
          {searching ? (
            <Loader2 className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
          ) : (
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          )}
          <input
            ref={inputRef}
            type="text"
            placeholder="Search by company name or email…"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelected(null);
            }}
            className="w-full bg-transparent py-3.5 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        {/* Results */}
        <div className="max-h-[320px] overflow-y-auto">
          {!query.trim() && (
            <p className="px-4 py-8 text-center text-sm text-slate-400">
              Start typing to search companies
            </p>
          )}
          {query.trim() !== "" && results.length === 0 && !searching && (
            <p className="px-4 py-8 text-center text-sm text-slate-400">
              No companies found for &ldquo;{query}&rdquo;
            </p>
          )}
          {query.trim() !== "" && (results.length > 0 || searching) && (
            <ul className="p-2">
              {results.map(company => {
                const alreadyAdded = excludeIds.includes(company.id);
                const isSelected = selected?.id === company.id;
                return (
                  <li key={company.id}>
                    <button
                      type="button"
                      disabled={alreadyAdded}
                      onClick={() => setSelected(isSelected ? null : company)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors disabled:cursor-default ${
                        isSelected ? "bg-slate-900" : ""
                      } ${!isSelected && alreadyAdded ? "opacity-50" : ""} ${
                        !isSelected && !alreadyAdded ? "hover:bg-slate-50" : ""
                      }`}
                    >
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>
                        {company.companyUser.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`truncate text-sm font-medium ${isSelected ? "text-white" : ""} ${!isSelected && alreadyAdded ? "text-slate-400" : ""} ${!isSelected && !alreadyAdded ? "text-slate-900" : ""}`}>
                          {company.companyUser.name}
                        </p>
                        <p className={`truncate text-xs ${isSelected ? "text-slate-300" : "text-slate-400"}`}>
                          {company.companyUser.email}
                        </p>
                      </div>
                      {alreadyAdded && (
                        <span className="flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-400">
                          <Check className="h-3 w-3" />
                          Added
                        </span>
                      )}
                      {!alreadyAdded && isSelected && (
                        <Check className="h-4 w-4 shrink-0 text-white" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
          <p className="truncate text-xs text-slate-400">
            {selected ? `Selected: ${selected.companyUser.name}` : "Select a company above"}
          </p>
          <button
            type="button"
            disabled={!selected || adding}
            onClick={handleAdd}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {adding && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {adding && "Adding…"}
            {!adding && "Add company"}
          </button>
        </div>
      </div>
    </div>
  );
}
