import type { ReactNode } from "react";
import { AdminLayoutShell } from "@/components/admin/AdminLayoutShell";

export default function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <AdminLayoutShell>{children}</AdminLayoutShell>;
}
