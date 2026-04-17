import { api } from "@/lib/api";
import type { ApiResponse as BaseApiResponse } from "@/types/api";
import EventSearch from "@/components/shared/EventSearch";
import Pagination from "@/components/shared/Pagination";
import { Suspense } from "react";
import Link from "next/link";

interface Event {
  id: string;
  name: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  banner: string | null;
}

type PublishedEventsPayload = {
  events: Event[];
  total: number;
  page: number;
  limit: number;
};

async function getEvents(search?: string, page: number = 1, limit: number = 10) {
  try {
    const res = await api.get<BaseApiResponse<PublishedEventsPayload>>("/events", {
      params: { search, page, limit },
      cache: "no-store",
    } as any); // Cast for cache as apiFetch might not support it in all types yet

    return res.data;
  } catch (error) {
    console.error("Error fetching events from API:", error);
    return { events: [], total: 0 };
  }
}

export default async function EventExplorerPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const params = await searchParams;
  const search = params.search;
  const page = params.page;
  const currentPage = Math.max(1, parseInt(page || "1"));
  const limit = 10;
  
  const { events, total } = await getEvents(search, currentPage, limit);

  return (
    <div className="w-full bg-white flex flex-col justify-start items-center overflow-hidden font-sans">
      {/* Banner Section */}
      <div className="self-stretch h-96 px-28 py-10 flex flex-col justify-center items-center gap-2.5 overflow-hidden bg-slate-900 relative">
        <img 
          src="https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=1600&auto=format&fit=crop" 
          className="absolute inset-0 w-full h-full object-cover opacity-50"
          alt="Banner"
        />
        <div className="z-10 flex flex-col justify-center items-center gap-6">
          <div className="w-[540px] flex flex-col justify-center items-center gap-4">
            <div className="self-stretch text-center font-sans text-white text-5xl font-semibold leading-[48px]">Events</div>
            <div className="self-stretch text-center font-sans text-white text-sm font-normal uppercase leading-5 tracking-wider opacity-90">
              EXPLORE OUR UPCOMING ENVIRONMENTAL EVENTS
            </div>
          </div>
          
          <Suspense fallback={<div className="w-[600px] h-10 bg-white/10 rounded-lg animate-pulse" />}>
            <EventSearch />
          </Suspense>
        </div>
      </div>

      {/* Events List Section */}
      <div className="self-stretch px-28 py-10 flex flex-col justify-start items-start gap-2.5 overflow-hidden">
        <div className="w-full max-w-[1200px] mx-auto flex flex-col justify-start items-center gap-8">
          <div className="self-stretch text-center">
            {search ? (
              <>
                <span className="text-black text-lg font-medium font-sans">{total}</span>
                <span className="text-black text-lg font-normal font-sans"> Events match your preferences</span>
              </>
            ) : (
              <span className="text-black text-lg font-semibold font-sans uppercase tracking-tight">All Events</span>
            )}
          </div>

          <div className="self-stretch flex flex-col justify-start items-start gap-6">
            {events && events.length > 0 ? (
              <>
                {events.map((event: Event, index: number) => (
                  <div key={event.id || index} className="self-stretch px-14 py-8 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-slate-200 inline-flex justify-start items-center gap-12 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="flex justify-start items-center gap-12 w-full">
                      <img 
                        className="w-48 h-48 rounded-lg object-contain" 
                        src={event.banner || "https://placehold.co/200x200?text=Event"} 
                        alt={event.name} 
                      />
                      <div className="flex-1 inline-flex flex-col justify-start items-start gap-4">
                        <div className="self-stretch text-black text-3xl font-semibold font-sans leading-8">{event.name}</div>
                        <div className="self-stretch text-black text-base font-normal font-sans leading-6">{event.description}</div>
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
                ))}
                
                {/* Pagination */}
                <div className="w-full flex justify-center mt-6">
                  <Pagination total={total} limit={limit} currentPage={currentPage} />
                </div>
              </>
            ) : (
              <div className="w-full py-20 text-center text-slate-400 italic">
                {search ? `No events found matching "${search}".` : "No events available at the moment."}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}