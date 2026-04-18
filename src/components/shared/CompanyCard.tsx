import Link from "next/link";
import { type Company } from "@/types/company";

export function CompanyCard({ company }: { company: Company }) {
  return (
    <Link 
      href={`/companies/${company.id}`}
      className="block w-full max-w-[280px] h-auto min-h-[316px] rounded-xl border border-[#E5E5E5] bg-white overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="w-full h-40 flex items-center justify-center bg-slate-50 relative overflow-hidden">
        {company.logo ? (
          <img 
            src={company.logo} 
            alt={company.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-200">
            <span className="text-slate-400 font-medium">No Logo</span>
          </div>
        )}
      </div>
      <div className="px-5 pt-4 pb-6 flex flex-col justify-start items-start">
        <div className="flex flex-col gap-2 w-full">
          <h4 className="text-black text-lg font-medium font-sans leading-tight line-clamp-1">
            {company.name}
          </h4>
          <p className="text-[#525252] text-sm font-normal font-sans leading-snug line-clamp-2 min-h-[40px]">
            {company.description || "No description provided."}
          </p>
        </div>
        <div className="flex justify-between items-center w-full mt-3 pt-1">
          <p className="text-[#A3A3A3] text-xs font-normal font-sans truncate pr-2">
            {company.email}
          </p>
          <span className="text-[#525252] text-sm font-medium font-sans whitespace-nowrap">
            Details
          </span>
        </div>
      </div>
    </Link>
  );
}
