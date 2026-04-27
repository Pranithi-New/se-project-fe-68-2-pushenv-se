import { X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
} from "@/components/ui/form";
import { api } from "@/lib/api";
import { extractErrorMessage } from "./utils";
import { EventFormFields, type EventFormValues, useEventForm } from "./EventFormFields";

export function CreateModal({ onClose, onCreated }: Readonly<{ onClose: () => void; onCreated: () => void }>) {
  const form = useEventForm({
    name: "",
    location: "",
    description: "",
    startDate: "",
    endDate: "",
  });

  async function onSubmit(values: EventFormValues) {
    try {
      await api.post("/admin/events", values);
      toast.success("Event created");
      onCreated();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Failed to create event"));
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="rounded-2xl bg-background p-6 shadow-md w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 mb-5 border-b">
          <p className="text-lg font-bold">Create Event</p>
          <button onClick={onClose} className="hover:text-muted-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <EventFormFields form={form} />
            
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creating…" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
