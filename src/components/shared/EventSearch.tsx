"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

interface EventSearchProps {
  basePath?: string;
}

export default function EventSearch({ basePath = "/events" }: Readonly<EventSearchProps>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("search") || "");

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set("search", query);
    } else {
      params.delete("search");
    }
    params.set("page", "1"); // Always reset to page 1 on query change
    router.push(`${basePath}?${params.toString()}`);
  };

  return (
    <div className="w-[600px] min-h-10 px-4 py-2.5 bg-white rounded-lg shadow-sm outline outline-1 outline-slate-200 inline-flex justify-start items-center gap-3 overflow-hidden">
      <div className="flex-1 flex justify-start items-center gap-1">
        <input
          type="text"
          placeholder="Search events..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              (e.target as HTMLInputElement).blur();
              handleSearch();
            }
          }}
          className="w-full bg-transparent outline-none text-black text-sm font-normal font-sans placeholder:text-slate-400"
        />
      </div>
      <button
        type="button"
        aria-label="Search"
        className="w-5 p-0.5 inline-flex flex-col justify-center items-center cursor-pointer outline-none border-none bg-transparent"
        onClick={handleSearch}
      >
        <div className="w-4 h-4 relative overflow-hidden">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-slate-400"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
      </button>
    </div>
  );
}
