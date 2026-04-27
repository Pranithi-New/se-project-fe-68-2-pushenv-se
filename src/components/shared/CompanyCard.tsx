import Link from "next/link";
import { type Company } from "@/types/company";

export function CompanyCard({ company }: Readonly<{ company: Company }>) {
  return (
    <Link
      href={`/companies/${company.id}`}
      className="block w-full rounded-xl outline outline-1 outline-offset-[-1px] outline-slate-200 bg-white overflow-hidden hover:shadow-md transition-shadow flex flex-col"
    >
      <div className="w-full h-44 flex items-center justify-center bg-slate-50 overflow-hidden">
        {company.logo ? (
          <img
            src={company.logo}
            alt={company.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-200">
            <span className="text-slate-400 text-xs font-medium uppercase tracking-wide">IMG</span>
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="text-black text-base font-semibold font-sans leading-6 line-clamp-1">
          {company.name}
        </div>
        <div className="text-slate-500 text-sm font-normal font-sans leading-5 line-clamp-2 flex-1">
          {company.description || "No description provided."}
        </div>
        <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
          <div className="flex flex-col gap-0.5">
            <span className="text-slate-400 text-xs uppercase tracking-wide">Email</span>
            <span className="text-slate-900 text-xs font-medium truncate">{company.email}</span>
          </div>
        </div>
        <div className="mt-1 w-full text-center px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-700 transition-colors">
          See details
        </div>
      </div>
    </Link>
  );
}
