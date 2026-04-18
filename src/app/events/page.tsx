import { api } from "@/lib/api";
import type { ApiResponse as BaseApiResponse } from "@/types/api";
import EventSearch from "@/components/shared/EventSearch";
import Pagination from "@/components/shared/Pagination";
import EventCard, { type EventType } from "@/components/shared/EventCard";
import { Suspense } from "react";

type PublishedEventsPayload = {
  events: EventType[];
  total: number;
  page: number;
  limit: number;
};

async function getEvents(
  search?: string,
  page: number = 1,
  limit: number = 10,
) {
  try {
    const res = await api.get<BaseApiResponse<PublishedEventsPayload>>(
      "/events",
      {
        params: { search, page, limit },
        cache: "no-store",
      },
    );

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
            <div className="self-stretch text-center font-sans text-white text-5xl font-semibold leading-[48px]">
              Events
            </div>
            <div className="self-stretch text-center font-sans text-white text-sm font-normal uppercase leading-5 tracking-wider opacity-90">
              EXPLORE OUR UPCOMING ENVIRONMENTAL EVENTS
            </div>
          </div>

          <Suspense
            fallback={
              <div className="w-[600px] h-10 bg-white/10 rounded-lg animate-pulse" />
            }
          >
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
                <span className="text-black text-lg font-medium font-sans">
                  {total}
                </span>
                <span className="text-black text-lg font-normal font-sans">
                  Events match your preferences
                </span>
              </>
            ) : (
              <span className="text-black text-lg font-semibold font-sans uppercase tracking-tight">
                All Events
              </span>
            )}
          </div>

          <div className="self-stretch flex flex-col justify-start items-start gap-6">
            {events && events.length > 0 ? (
              <>
                {events.map((event: EventType) => (
                  <EventCard key={event.id} event={event} />
                ))}

                {/* Pagination */}
                <div className="w-full flex justify-center mt-6">
                  <Pagination
                    total={total}
                    limit={limit}
                    currentPage={currentPage}
                  />
                </div>
              </>
            ) : (
              <div className="w-full py-20 text-center text-slate-400 italic">
                {search
                  ? `No events found matching "${search}".`
                  : "No events available at the moment."}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
