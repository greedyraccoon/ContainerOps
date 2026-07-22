import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp, TrendingDown, DollarSign, Wallet } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { PageShell, DataCard } from "@/components/page-shell";
import type { AnalyticsRow } from "@/lib/mock-data";
import { useList } from "@/lib/crud";

export const Route = createFileRoute("/analytics")({
  component: () => (
    <AppLayout roles={["ADMIN", "ACCOUNTANT"]}>
      <AnalyticsPage />
    </AppLayout>
  ),
});

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

function AnalyticsPage() {
  const { data = [], isLoading, error } = useList<AnalyticsRow>("analytics/trip-profitability");
  const rows = data;
  const totalRevenue = rows.reduce((a, b) => a + b.totalRevenue, 0);
  const totalExpenses = rows.reduce((a, b) => a + b.totalExpenses, 0);
  const totalProfit = totalRevenue - totalExpenses;
  const avgMargin = rows.length ? rows.reduce((a, b) => a + b.marginPercentage, 0) / rows.length : 0;

  const kpis = [
    { label: "Total Revenue", value: fmt(totalRevenue), icon: DollarSign, tone: "text-blue-600 bg-blue-50" },
    { label: "Total Expenses", value: fmt(totalExpenses), icon: Wallet, tone: "text-amber-600 bg-amber-50" },
    { label: "Net Profit", value: fmt(totalProfit), icon: TrendingUp, tone: totalProfit >= 0 ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50" },
    { label: "Avg Margin", value: `${avgMargin.toFixed(1)}%`, icon: avgMargin >= 0 ? TrendingUp : TrendingDown, tone: avgMargin >= 0 ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50" },
  ];

  const errMsg = error && typeof error === "object" ? ((error as { message?: string }).message ?? "Failed to load") : null;

  return (
    <PageShell title="Analytics" description="Trip-level profitability across the fleet.">
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-medium uppercase tracking-wider text-slate-500">{k.label}</div>
                  <div className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">{k.value}</div>
                </div>
                <div className={`flex h-9 w-9 items-center justify-center rounded-md ${k.tone}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <DataCard>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/60">
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Manifest #</th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Revenue</th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Expenses</th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Net Profit</th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Margin %</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.tripId} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-900">{r.tripManifestNumber}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-700">{fmt(r.totalRevenue)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-700">{fmt(r.totalExpenses)}</td>
                  <td className={`px-4 py-3 text-right tabular-nums font-semibold ${r.netProfit >= 0 ? "text-emerald-700" : "text-red-700"}`}>{fmt(r.netProfit)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ring-1 ring-inset tabular-nums ${
                      r.marginPercentage >= 0
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                        : "bg-red-50 text-red-700 ring-red-600/20"
                    }`}>
                      {r.marginPercentage.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
              {isLoading && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-500">Loading…</td>
                </tr>
              )}
              {!isLoading && errMsg && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-red-600">{errMsg}</td>
                </tr>
              )}
              {!isLoading && !errMsg && rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-500">No records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </DataCard>
    </PageShell>
  );
}
