import { api } from "@/lib/api";
import type { ApiResponse as BaseApiResponse } from "@/types/api";
import ExplorerToolbar from "@/components/shared/ExplorerToolbar";
import Pagination from "@/components/shared/Pagination";
import EventCard, { type EventType } from "@/components/shared/EventCard";
import EventTableView from "@/components/shared/EventTableView";
import { Suspense } from "react";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "a-z", label: "A-Z" },
  { value: "z-a", label: "Z-A" },
];

type PublishedEventsPayload = {
  events: EventType[];
  total: number;
  page: number;
  limit: number;
};

async function getEvents(search?: string, sort?: string, page: number = 1, limit: number = 10) {
  try {
    const res = await api.get<BaseApiResponse<PublishedEventsPayload>>("/events", {
      params: { search, sort, page, limit },
      cache: "no-store",
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching events from API:", error);
    return { events: [], total: 0 };
  }
}

export default async function EventExplorerPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; sort?: string; page?: string; view?: string }>;
}) {
  const params = await searchParams;
  const search = params.search;
  const sort = params.sort || "newest";
  const view = params.view === "table" ? "table" : "card";
  const currentPage = Math.max(1, Number.parseInt(params.page || "1", 10));
  const limit = 10;

  const { events, total } = await getEvents(search, sort, currentPage, limit);

  return (
    <div className="w-full bg-white flex flex-col justify-start items-center overflow-hidden font-sans">
      {/* Banner */}
      <div className="self-stretch h-96 flex flex-col justify-center items-center gap-4 overflow-hidden bg-slate-900 relative">
        <img
          src="https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=1600&auto=format&fit=crop"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
          alt="Banner"
        />
        <div className="z-10 flex flex-col justify-center items-center gap-2 text-center">
          <div className="text-white text-5xl font-semibold font-sans leading-[48px]">Events</div>
          <div className="text-white text-sm font-normal uppercase leading-5 tracking-wider opacity-90">
            EXPLORE OUR UPCOMING ENVIRONMENTAL EVENTS
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
        <Suspense fallback={<div className="w-full h-16 bg-slate-100 rounded-lg animate-pulse" />}>
          <ExplorerToolbar
            title="All Events"
            total={total}
            searchPlaceholder="Search events..."
            sortOptions={SORT_OPTIONS}
          />
        </Suspense>

        <div className="w-full">
          {events && events.length > 0 ? (
            <>
              {view === "table" ? (
                <EventTableView events={events} />
              ) : (
                <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event: EventType) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              )}

              <div className="w-full flex justify-center mt-6">
                <Pagination total={total} limit={limit} currentPage={currentPage} />
              </div>
            </>
          ) : (
            <div className="w-full py-20 text-center text-slate-400 italic text-sm">
              {search
                ? `No events found matching "${search}".`
                : "No events available at the moment."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
