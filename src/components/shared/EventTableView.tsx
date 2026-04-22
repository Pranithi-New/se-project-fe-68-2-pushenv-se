import Link from "next/link";
import type { EventType } from "./EventCard";

export default function EventTableView({ events }: { events: EventType[] }) {
  return (
    <div className="w-full overflow-x-auto rounded-xl outline outline-1 outline-offset-[-1px] outline-slate-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="text-left px-6 py-4 font-semibold text-slate-500 uppercase tracking-wide text-xs">
              Event
            </th>
            <th className="text-left px-6 py-4 font-semibold text-slate-500 uppercase tracking-wide text-xs">
              Location
            </th>
            <th className="text-left px-6 py-4 font-semibold text-slate-500 uppercase tracking-wide text-xs">
              Date
            </th>
            <th className="px-6 py-4" />
          </tr>
        </thead>
        <tbody>
          {events.map((event, i) => (
            <tr
              key={event.id}
              className={`hover:bg-slate-50 transition-colors ${i < events.length - 1 ? "border-b border-slate-100" : ""}`}
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                  <img
                    src={event.banner || "https://placehold.co/56x56?text=E"}
                    alt={event.name}
                    className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 text-sm leading-5">
                      {event.name}
                    </div>
                    <div className="text-slate-400 text-xs line-clamp-2 max-w-xs mt-0.5">
                      {event.description}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-slate-700 whitespace-nowrap align-middle">
                {event.location}
              </td>
              <td className="px-6 py-4 text-slate-700 whitespace-nowrap align-middle">
                {new Date(event.startDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </td>
              <td className="px-6 py-4 text-right align-middle">
                <Link
                  href={`/events/${event.id}`}
                  scroll
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
