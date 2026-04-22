import Link from "next/link";
import type { Company } from "@/types/company";

export default function CompanyTableView({ companies }: { companies: Company[] }) {
  return (
    <div className="w-full overflow-x-auto rounded-xl outline outline-1 outline-offset-[-1px] outline-slate-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="text-left px-6 py-4 font-semibold text-slate-500 uppercase tracking-wide text-xs">
              Company
            </th>
            <th className="text-left px-6 py-4 font-semibold text-slate-500 uppercase tracking-wide text-xs">
              Email
            </th>
            <th className="px-6 py-4" />
          </tr>
        </thead>
        <tbody>
          {companies.map((company, i) => (
            <tr
              key={company.id}
              className={`hover:bg-slate-50 transition-colors ${i < companies.length - 1 ? "border-b border-slate-100" : ""}`}
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                  {company.logo ? (
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
                      <span className="text-slate-400 text-xs font-medium">IMG</span>
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 text-sm leading-5">
                      {company.name}
                    </div>
                    <div className="text-slate-400 text-xs line-clamp-2 max-w-xs mt-0.5">
                      {company.description || "No description provided."}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-slate-700 whitespace-nowrap align-middle text-xs">
                {company.email}
              </td>
              <td className="px-6 py-4 text-right align-middle">
                <Link
                  href={`/companies/${company.id}`}
                  className="inline-block px-4 py-1.5 bg-slate-100 rounded-full text-slate-900 text-xs font-medium hover:bg-slate-200 transition-colors whitespace-nowrap"
                >
                  See details
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
