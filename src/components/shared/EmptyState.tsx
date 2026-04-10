import { Card } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="text-center">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">{description}</p>
    </Card>
  );
}
