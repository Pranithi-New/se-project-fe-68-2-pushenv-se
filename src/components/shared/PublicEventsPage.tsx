"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Building2, CalendarDays, MapPin } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api";

type PublicEventSummary = {
	id: string;
	name: string;
	description: string;
	location: string;
	startDate: string;
	endDate: string;
	banner?: string | null;
	isPublished: boolean;
	createdAt: string;
	updatedAt: string;
};

type PublishedEventsPayload = {
	events: PublicEventSummary[];
	total: number;
	page: number;
	limit: number;
};

type PublicEventCompany = {
	company: {
		id: string;
	};
};

const LIMIT = 9;
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function resolveAssetUrl(value?: string | null) {
	if (!value) return null;
	return value.startsWith("http") ? value : `${BASE_URL}${value}`;
}

function formatDate(value: string) {
	return new Date(value).toLocaleDateString("en-GB", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
}

function formatDateRange(startValue: string, endValue: string) {
	const start = formatDate(startValue);
	const end = formatDate(endValue);
	return start === end ? start : `${start} - ${end}`;
}

export function PublicEventsPage() {
	const [events, setEvents] = useState<PublicEventSummary[]>([]);
	const [companyCounts, setCompanyCounts] = useState<Record<string, number>>({});
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);

	useEffect(() => {
		let active = true;

		async function loadEvents() {
			try {
				const res = await api.get<ApiResponse<PublishedEventsPayload>>("/events", {
					params: { page, limit: LIMIT },
				});

				if (!active) return;
				setEvents(res.data.events);
				setTotalPages(Math.max(1, Math.ceil(res.data.total / LIMIT)));

				const countEntries = await Promise.all(
					res.data.events.map(async event => {
						try {
							const companiesRes = await api.get<ApiResponse<PublicEventCompany[]>>(
								`/events/${event.id}/companies`,
							);
							return [event.id, companiesRes.data.length] as const;
						} catch {
							return [event.id, 0] as const;
						}
					}),
				);

				if (!active) return;
				setCompanyCounts(Object.fromEntries(countEntries));
			} catch {
				if (active) toast.error("Failed to load events");
			} finally {
				if (active) setLoading(false);
			}
		}

		loadEvents();

		return () => {
			active = false;
		};
	}, [page]);

	return (
		<div className="flex min-h-screen flex-col bg-muted/30">
			<main className="mx-auto w-full max-w-6xl px-6 py-10">
				<div className="mb-6 flex items-center justify-between">
					<h1 className="text-3xl font-semibold tracking-[-1px]">Public Events</h1>
					<Badge variant="outline">Published</Badge>
				</div>

				{loading ? (
					<div className="py-24 text-center text-sm text-muted-foreground">Loading…</div>
				) : events.length === 0 ? (
					<Card>
						<CardContent className="py-20 text-center text-sm text-muted-foreground">
							No published events yet.
						</CardContent>
					</Card>
				) : (
					<>
						<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
							{events.map(event => {
								const bannerUrl = resolveAssetUrl(event.banner);

								return (
									<Card key={event.id} className="overflow-hidden border-border/70 shadow-sm">
										{bannerUrl ? (
											// eslint-disable-next-line @next/next/no-img-element
											<img src={bannerUrl} alt={event.name} className="h-44 w-full object-cover" />
										) : (
											<div className="flex h-44 items-center justify-center bg-muted text-sm text-muted-foreground">
												No banner image
											</div>
										)}

										<CardHeader>
											<CardTitle className="line-clamp-2 text-xl">{event.name}</CardTitle>
										</CardHeader>
										<CardContent className="grid gap-3 text-sm">
											<div className="flex items-start gap-2 text-muted-foreground">
												<MapPin className="mt-0.5 h-4 w-4 shrink-0" />
												<span>{event.location}</span>
											</div>
											<div className="flex items-center gap-2 text-muted-foreground">
												<CalendarDays className="h-4 w-4 shrink-0" />
												<span>{formatDateRange(event.startDate, event.endDate)}</span>
											</div>
											<div className="flex items-center gap-2 text-muted-foreground">
												<Building2 className="h-4 w-4 shrink-0" />
												<span>{companyCounts[event.id] ?? 0} Company</span>
											</div>
											<p className="line-clamp-3 text-muted-foreground">{event.description}</p>

											<Button asChild className="mt-2 w-full">
												<Link href={`/events/${event.id}`}>View details</Link>
											</Button>
										</CardContent>
									</Card>
								);
							})}
						</div>

						{totalPages > 1 ? (
							<div className="mt-8 flex items-center justify-center gap-2">
								<Button
									variant="outline"
									onClick={() => setPage(current => Math.max(1, current - 1))}
									disabled={page === 1}
								>
									Previous
								</Button>
								<span className="text-sm text-muted-foreground">Page {page} / {totalPages}</span>
								<Button
									variant="outline"
									onClick={() => setPage(current => Math.min(totalPages, current + 1))}
									disabled={page === totalPages}
								>
									Next
								</Button>
							</div>
						) : null}
					</>
				)}
			</main>
		</div>
	);
}
