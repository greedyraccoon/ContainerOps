import type { ReactNode } from "react";
import { AppSidebar } from "./app-sidebar";
import { RequireRole, type Role } from "@/lib/auth";

export function AppLayout({ roles, children }: { roles: Role[]; children: ReactNode }) {
  return (
    <RequireRole roles={roles}>
      <div className="flex min-h-screen w-full bg-slate-50 text-slate-900">
        <AppSidebar />
        <main className="flex flex-1 flex-col">{children}</main>
      </div>
    </RequireRole>
  );
}
