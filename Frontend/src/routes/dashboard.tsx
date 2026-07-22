import { createFileRoute, Link } from "@tanstack/react-router";
import { Truck, Route as RouteIcon, Package, FileText, Receipt, Users, Box, Building2, BarChart3 } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { PageShell } from "@/components/page-shell";
import { useAuth, type Role } from "@/lib/auth";

export const Route = createFileRoute("/dashboard")({
  component: () => (
    <AppLayout roles={["ADMIN", "MANAGER", "DISPATCHER", "ACCOUNTANT"]}>
      <DashboardPage />
    </AppLayout>
  ),
});

interface Tile {
  to: string;
  label: string;
  desc: string;
  icon: typeof Truck;
  roles: Role[];
}

const tiles: Tile[] = [
  { to: "/vehicles", label: "Vehicles", desc: "Fleet registry and status", icon: Truck, roles: ["ADMIN", "MANAGER", "DISPATCHER"] },
  { to: "/drivers", label: "Drivers", desc: "Licensed driver roster", icon: Users, roles: ["ADMIN", "MANAGER", "DISPATCHER"] },
  { to: "/containers", label: "Containers", desc: "Container inventory", icon: Box, roles: ["ADMIN", "MANAGER", "DISPATCHER"] },
  { to: "/trips", label: "Trips", desc: "Active manifests", icon: RouteIcon, roles: ["ADMIN", "MANAGER", "DISPATCHER"] },
  { to: "/shipments", label: "Shipments", desc: "Import / export tracking", icon: Package, roles: ["ADMIN", "MANAGER"] },
  { to: "/customers", label: "Customers", desc: "Billed accounts & GST", icon: Building2, roles: ["ADMIN", "MANAGER"] },
  { to: "/invoices", label: "Invoices", desc: "Customer billing", icon: FileText, roles: ["ADMIN", "ACCOUNTANT"] },
  { to: "/expenses", label: "Expenses", desc: "Trip cost logging", icon: Receipt, roles: ["ADMIN", "ACCOUNTANT"] },
  { to: "/analytics", label: "Analytics", desc: "Trip profitability", icon: BarChart3, roles: ["ADMIN", "ACCOUNTANT"] },
];

function DashboardPage() {
  const { role } = useAuth();
  const visible = tiles.filter((t) => role && t.roles.includes(role));

  return (
    <PageShell title="Dashboard" description={`Welcome back — signed in as ${role}.`}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((t) => {
          const Icon = t.icon;
          return (
            <Link
              key={t.to}
              to={t.to}
              className="group flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50/40"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600 group-hover:bg-blue-100">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">{t.label}</div>
                <div className="text-xs text-slate-500">{t.desc}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </PageShell>
  );
}
