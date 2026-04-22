"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export default function ViewToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const view = searchParams.get("view") || "card";

  const setView = (v: "card" | "table") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", v);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
      <button
        onClick={() => setView("card")}
        className={`p-1.5 rounded-md transition-colors ${view === "card" ? "bg-white shadow-sm text-slate-900" : "text-slate-400 hover:text-slate-700"}`}
        title="Card view"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
        </svg>
      </button>
      <button
        onClick={() => setView("table")}
        className={`p-1.5 rounded-md transition-colors ${view === "table" ? "bg-white shadow-sm text-slate-900" : "text-slate-400 hover:text-slate-700"}`}
        title="Table view"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      </button>
    </div>
  );
}
