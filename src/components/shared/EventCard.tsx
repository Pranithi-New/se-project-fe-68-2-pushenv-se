import Link from "next/link";

export interface EventType {
  id: string;
  name: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  banner: string | null;
}

export default function EventCard({ event }: { event: EventType }) {
  return (
    <div className="bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      <img
        className="w-full h-44 object-cover"
        src={event.banner || "https://placehold.co/400x176?text=IMG"}
        alt={event.name}
      />
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="text-black text-base font-semibold leading-6 line-clamp-2">
          {event.name}
        </div>
        <div className="text-slate-500 text-sm leading-5 line-clamp-2 flex-1">
          {event.description}
        </div>
        <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
          <div className="flex flex-col gap-0.5">
            <span className="text-slate-400 text-xs uppercase tracking-wide">Location</span>
            <span className="text-slate-900 text-xs font-medium">{event.location}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-slate-400 text-xs uppercase tracking-wide">Date</span>
            <span className="text-slate-900 text-xs font-medium">
              {new Date(event.startDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
        <Link
          href={`/events/${event.id}`}
          scroll
          className="mt-1 w-full text-center px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-700 transition-colors"
        >
          See details
        </Link>
      </div>
    </div>
  );
}
