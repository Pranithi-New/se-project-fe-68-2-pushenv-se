import Link from "next/link";

type SidebarItem = {
  href: string;
  label: string;
};

export function Sidebar({
  role,
  items,
}: {
  role: "company" | "admin";
  items: SidebarItem[];
}) {
  return (
    <aside className="rounded-lg bg-card p-4 shadow-md">
      <p className="text-xs font-semibold uppercase text-muted-foreground">
        {role} workspace
      </p>
      <nav className="mt-4 grid gap-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
