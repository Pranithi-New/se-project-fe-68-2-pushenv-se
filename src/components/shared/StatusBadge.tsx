import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const colorMap: Record<string, string> = {
  open: "bg-emerald-100 text-emerald-800 border-emerald-200",
  closed: "bg-zinc-100 text-zinc-700 border-zinc-200",
  published: "bg-sky-100 text-sky-800 border-sky-200",
  unpublished: "bg-amber-100 text-amber-800 border-amber-200",
  user: "bg-indigo-100 text-indigo-800 border-indigo-200",
  company: "bg-teal-100 text-teal-800 border-teal-200",
  admin: "bg-rose-100 text-rose-800 border-rose-200",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("capitalize", colorMap[status] ?? "bg-zinc-100 text-zinc-700 border-zinc-200")}
    >
      {status}
    </Badge>
  );
}
