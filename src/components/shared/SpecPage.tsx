import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SpecPage({
  title,
  route,
  summary,
  bullets,
}: {
  title: string;
  route: string;
  summary: string;
  bullets: string[];
}) {
  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <p className="text-xs font-semibold uppercase text-muted-foreground">{route}</p>
          <CardTitle className="text-2xl">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{summary}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Implementation notes</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2">
            {bullets.map((bullet) => (
              <li key={bullet} className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
                {bullet}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
