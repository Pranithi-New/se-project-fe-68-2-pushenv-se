import { useState, useEffect, useCallback, useRef } from "react";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { X, Search } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import { AdminEvent } from "./types";
import { extractErrorMessage, toDateInput } from "./utils";

// ── General Info Schemas ──────────────────────────────────────────────────────

const eventFormSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  location: z.string().min(1, "Location is required"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  startDate: z.string().min(1, "Start Date is required"),
  endDate: z.string().min(1, "End Date is required"),
}).refine(data => new Date(data.endDate) >= new Date(data.startDate), {
  message: "End date cannot be before start date",
  path: ["endDate"]
});

type EventFormValues = z.infer<typeof eventFormSchema>;

// ── Component: Edit Event General Info ────────────────────────────────────────

function EditEventGeneralInfo({ event, onClose, onUpdated }: { event: AdminEvent; onClose: () => void; onUpdated: () => void }) {
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      name: event.name,
      location: event.location,
      description: event.description,
      startDate: toDateInput(event.startDate),
      endDate: toDateInput(event.endDate),
    },
  });

  async function onSubmit(values: EventFormValues) {
    try {
      await api.put(`/admin/events/${event.id}`, values);
      toast.success("Event updated");
      onUpdated();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Failed to update event"));
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 h-full">
        <div className="flex-col gap-4 flex flex-1">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <textarea
                    {...field}
                    rows={3}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4 mt-2 shrink-0">
          <Button type="button" variant="outline" onClick={onClose}>Close</Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// ── Component: Participating Companies ────────────────────────────────────────

function EditEventCompanies({ event, onClose, onUpdated }: { event: AdminEvent; onClose: () => void; onUpdated: () => void }) {
  const [eventCompanies, setEventCompanies] = useState<any[]>([]);
  const [loadingComp, setLoadingComp] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchEventCompanies = useCallback(async () => {
    setLoadingComp(true);
    try {
      const res = await api.get<ApiResponse<any>>(`/events/${event.id}/companies`);
      setEventCompanies(res.data || []);
    } catch {
      toast.error("Failed to load participating companies");
    } finally {
      setLoadingComp(false);
    }
  }, [event.id]);

  useEffect(() => {
    fetchEventCompanies();
  }, [fetchEventCompanies]);

  useEffect(() => {
    if (!searchTerm) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.get<ApiResponse<{ data: any[] }>>("/admin/companies", {
          params: { name: searchTerm, limit: 10 }
        });
        setSearchResults(res.data.data || []);
      } catch {
        // block errors
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSearchResults([]); // Clears search results so dropdown closes
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleAddCompany() {
    if (!selectedCompany) return;
    setAssigning(true);
    try {
      await api.post(`/admin/events/${event.id}/companies`, { companyId: selectedCompany.id });
      toast.success("Company added to event");
      setSelectedCompany(null);
      setSearchTerm("");
      setSearchResults([]);
      fetchEventCompanies();
      onUpdated();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Failed to add company"));
    } finally {
      setAssigning(false);
    }
  }

  async function handleRemoveCompany(companyId: string) {
    try {
      await api.delete(`/admin/events/${event.id}/companies/${companyId}`);
      toast.success("Company removed");
      setConfirmRemoveId(null);
      fetchEventCompanies();
      onUpdated();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Failed to remove company"));
    }
  }

  return (
    <div className="flex flex-col flex-1 h-full">
      <div className="flex flex-col gap-5 flex-1">
        {/* Add Company Section */}
        <div className="flex flex-col gap-2 relative">
          <Label>Add Company</Label>
          <div className="flex gap-2">
            <div className="flex-1 relative" ref={dropdownRef}>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search company by name..."
                  value={selectedCompany ? selectedCompany.companyUser.name : searchTerm}
                  onChange={e => {
                    setSelectedCompany(null);
                    setSearchTerm(e.target.value);
                  }}
                  onFocus={() => {
                    // Trigger refetch of dropdown if searchTerm exists and click back in
                    if (searchTerm && searchResults.length === 0) {
                      setSearchTerm(prev => prev + " ");
                      setTimeout(() => setSearchTerm(prev => prev.trim()), 0);
                    }
                  }}
                />
              </div>
              {searching && <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">Searching...</span>}
              {/* Combobox Dropdown */}
              {!selectedCompany && searchTerm && searchResults.length > 0 && (
                <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-background border rounded-md shadow-lg max-h-48 overflow-auto z-50 p-1 flex flex-col">
                  {searchResults.map(comp => (
                    <button
                      key={comp.id}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded transition-colors"
                      onClick={() => {
                        setSelectedCompany(comp);
                        setSearchResults([]);
                        setSearchTerm("");
                      }}
                    >
                      <div className="font-medium text-foreground">{comp.companyUser.name}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button type="button" disabled={!selectedCompany || assigning} onClick={handleAddCompany}>
              {assigning ? "Adding..." : "Add"}
            </Button>
          </div>
          {selectedCompany && (
            <div className="text-xs text-muted-foreground mt-0.5">
              Selected: <span className="font-medium text-foreground">{selectedCompany.companyUser.name}</span>
              <button className="ml-2 text-destructive hover:underline font-medium" onClick={() => setSelectedCompany(null)}>clear</button>
            </div>
          )}
        </div>

        {/* List of Participating Companies */}
        <div className="flex flex-col gap-2 flex-1 mt-2">
          <Label>Participating Companies ({eventCompanies.length})</Label>
          {eventCompanies.length === 0 && !loadingComp ? (
            <div className="text-sm text-muted-foreground py-4 text-center border rounded-md border-dashed">No companies assigned to this event</div>
          ) : (
            <div className="flex flex-wrap gap-2 pt-1 pb-4">
              {eventCompanies.map((ec: any) => (
                <div key={ec.company.id} className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 bg-muted/50 hover:bg-muted border rounded-full text-sm transition-colors shadow-sm">
                  <span className="font-medium whitespace-nowrap">{ec.company.companyUser.name}</span>
                  <button
                    onClick={() => setConfirmRemoveId(ec.company.id)}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-0.5 rounded-full transition-colors ml-1"
                    title={`Remove ${ec.company.companyUser.email}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 mt-2 shrink-0">
        <Button type="button" variant="outline" onClick={onClose}>Close</Button>
      </div>

      <ConfirmModal
        open={!!confirmRemoveId}
        onClose={() => setConfirmRemoveId(null)}
        onConfirm={() => handleRemoveCompany(confirmRemoveId!)}
        title="Remove company"
        description="Remove this company from the event? They will no longer appear as a participant."
        confirmLabel="Remove"
      />
    </div>
  );
}

// ── Main Layout Modal ─────────────────────────────────────────────────────────

export function EditModal({ event, onClose, onUpdated }: { event: AdminEvent; onClose: () => void; onUpdated: () => void }) {
  const [activeTab, setActiveTab] = useState<"info" | "companies">("info");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="rounded-2xl bg-background p-6 shadow-md w-full max-w-lg mx-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 mb-4 shrink-0">
          <p className="text-lg font-bold">Edit Event</p>
          <button onClick={onClose} className="hover:text-muted-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex gap-4 border-b mb-5 shrink-0">
          <button
            onClick={() => setActiveTab("info")}
            className={`pb-2 text-sm font-medium transition-colors border-b-2 ${activeTab === "info" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
          >
            General Info
          </button>
          <button
            onClick={() => setActiveTab("companies")}
            className={`pb-2 text-sm font-medium transition-colors border-b-2 ${activeTab === "companies" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
          >
            Participating Companies
          </button>
        </div>

        <div className="overflow-y-auto flex-1 pr-1 min-h-[300px] flex flex-col">
          {activeTab === "info" ? (
            <EditEventGeneralInfo event={event} onClose={onClose} onUpdated={onUpdated} />
          ) : (
            <EditEventCompanies event={event} onClose={onClose} onUpdated={onUpdated} />
          )}
        </div>
      </div>
    </div>
  );
}
