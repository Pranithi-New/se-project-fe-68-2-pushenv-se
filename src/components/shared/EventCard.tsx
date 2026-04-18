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
    <div className="self-stretch px-14 py-8 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-slate-200 inline-flex justify-start items-center gap-12 overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex justify-start items-center gap-12 w-full flex-col md:flex-row">
        <img 
          className="w-48 h-48 rounded-lg object-contain" 
          src={event.banner || "https://placehold.co/200x200?text=Event"} 
          alt={event.name} 
        />
        <div className="flex-1 inline-flex flex-col justify-start items-start gap-4">
          <div className="self-stretch text-black text-3xl font-semibold font-sans leading-8">{event.name}</div>
          <div className="self-stretch text-black text-base font-normal font-sans leading-6 flex-1 line-clamp-3 md:line-clamp-none">{event.description}</div>
          <div className="self-stretch inline-flex flex-col justify-start items-start gap-1">
            <div className="text-slate-500 text-lg font-normal font-sans">Location</div>
            <div className="text-black text-lg font-medium font-sans">{event.location}</div>
            <div className="text-slate-500 text-lg font-normal font-sans mt-2">Time & Date</div>
            <div className="text-black text-lg font-medium font-sans">
              {new Date(event.startDate).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })} at {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
        <div className="w-32 flex flex-col justify-center items-center">
          <Link href={`/events/${event.id}`} className="px-6 py-2.5 bg-slate-100 rounded-full cursor-pointer hover:bg-slate-200 transition-colors">
            <div className="text-center text-slate-900 text-sm font-medium font-sans">See details</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
