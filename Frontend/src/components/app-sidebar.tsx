import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Truck, Route as RouteIcon, Package, FileText, Receipt, LogOut, Container, Users, Box, Building2, BarChart3 } from "lucide-react";
import { useAuth, type Role } from "@/lib/auth";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  label: string;
  icon: typeof Truck;
  roles: Role[];
}

// RBAC:
// - ADMIN: everything.
// - MANAGER: Fleet, Trips, Shipments, Containers, Drivers, Customers.
// - DISPATCHER: Trips, Containers, Drivers, and Vehicle dispatch.
// - ACCOUNTANT: Invoices, Expenses, Analytics.
const navItems: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "MANAGER", "DISPATCHER", "ACCOUNTANT"] },
  { to: "/vehicles", label: "Vehicles", icon: Truck, roles: ["ADMIN", "MANAGER", "DISPATCHER"] },
  { to: "/drivers", label: "Drivers", icon: Users, roles: ["ADMIN", "MANAGER", "DISPATCHER"] },
  { to: "/containers", label: "Containers", icon: Box, roles: ["ADMIN", "MANAGER", "DISPATCHER"] },
  { to: "/trips", label: "Trips", icon: RouteIcon, roles: ["ADMIN", "MANAGER", "DISPATCHER"] },
  { to: "/shipments", label: "Shipments", icon: Package, roles: ["ADMIN", "MANAGER"] },
  { to: "/customers", label: "Customers", icon: Building2, roles: ["ADMIN", "MANAGER"] },
  { to: "/invoices", label: "Invoices", icon: FileText, roles: ["ADMIN", "ACCOUNTANT"] },
  { to: "/expenses", label: "Expenses", icon: Receipt, roles: ["ADMIN", "ACCOUNTANT"] },
  { to: "/analytics", label: "Analytics", icon: BarChart3, roles: ["ADMIN", "ACCOUNTANT"] },
];

export function AppSidebar() {
  const { role, logout } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  const visible = navItems.filter((n) => role && n.roles.includes(role));

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-14 items-center gap-2 border-b border-slate-200 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 text-white">
          <Container className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-900 leading-tight">ContainerOps</div>
          <div className="text-[10px] uppercase tracking-wider text-slate-400">Logistics Suite</div>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {visible.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              )}
            >
              <Icon className={cn("h-4 w-4", active ? "text-blue-600" : "text-slate-400")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <div className="mb-2 rounded-md bg-slate-50 px-3 py-2">
          <div className="text-[10px] uppercase tracking-wider text-slate-400">Signed in as</div>
          <div className="text-xs font-semibold text-slate-700">{role}</div>
        </div>
        <button
          onClick={() => {
            logout();
            navigate({ to: "/login" });
          }}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
        >
          <LogOut className="h-4 w-4 text-slate-400" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
