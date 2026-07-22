import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppLayout } from "@/components/app-layout";
import { ResourcePage, type Column } from "@/components/resource-page";
import { StatusDropdown } from "@/components/page-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Invoice } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth";
import { useCreate, useDelete, useList, usePatchStatus, useUpdate } from "@/lib/crud";

export const Route = createFileRoute("/invoices")({
  component: () => (
    <AppLayout roles={["ADMIN", "ACCOUNTANT"]}>
      <InvoicesPage />
    </AppLayout>
  ),
});

const STATUS_OPTIONS = ["DRAFT", "ISSUED", "PARTIALLY_PAID", "PAID", "OVERDUE", "CANCELLED"] as const;

const statusTone = (s: Invoice["status"]) =>
  s === "PAID" ? "green" : s === "ISSUED" || s === "PARTIALLY_PAID" ? "blue" : s === "OVERDUE" ? "red" : s === "CANCELLED" ? "red" : "slate";

const fmt = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

function InvoicesPage() {
  const { role } = useAuth();
  const { data = [], isLoading, error } = useList<Invoice>("invoices");
  
  // 1. Fetch customer lookup data
  const { data: customers = [] } = useList<any>("customers");

  const create = useCreate<Invoice>("invoices", { successMessage: "Invoice created" });
  const update = useUpdate<Invoice>("invoices", { successMessage: "Invoice updated" });
  const patchStatus = usePatchStatus("invoices");
  const del = useDelete("invoices", { successMessage: "Invoice deleted" });

  const columns: Column<Invoice>[] = [
    { key: "id", header: "ID", render: (r) => <span className="font-mono text-[11px] font-medium text-slate-400"># {r.id}</span> },
    { key: "num", header: "Invoice #", render: (r) => <span className="font-mono text-xs font-semibold text-slate-900">{r.invoiceNumber}</span> },
    
    // 2. Bulletproof Customer Column Renderer
    { 
      key: "cust", 
      header: "Customer", 
      render: (r: any) => {
        if (r.customerName) return r.customerName;
        if (r.customer?.companyName) return r.customer.companyName;
        if (r.customer?.name) return r.customer.name;

        const id = r.customerId ?? r.customer?.id;
        const c = customers.find((cust: any) => String(cust.id) === String(id));
        return c?.companyName || c?.name || (id ? `#${id}` : "—");
      } 
    },

    { key: "base", header: "Base Charge", render: (r) => <span className="tabular-nums">{fmt(r.baseFreightCharge)}</span>, className: "text-right" },
    { key: "tax", header: "Tax", render: (r) => <span className="tabular-nums text-slate-600">{fmt(r.taxAmount)}</span>, className: "text-right" },
    { key: "total", header: "Total", render: (r) => <span className="tabular-nums font-semibold text-slate-900">{fmt(r.totalAmount)}</span>, className: "text-right" },
    { key: "status", header: "Status", render: (r) => (
      <StatusDropdown
        value={r.status}
        tone={statusTone(r.status)}
        options={STATUS_OPTIONS}
        onChange={(next) => patchStatus.mutate({ id: r.id, status: next })}
      />
    ) },
    { key: "issue", header: "Issue Date", render: (r) => <span className="tabular-nums text-xs text-slate-600">{r.issueDate}</span> },
    { key: "due", header: "Due Date", render: (r) => <span className="tabular-nums text-xs">{r.dueDate}</span> },
  ];

  return (
    <ResourcePage
      title="Invoices"
      description="Customer billing, tax, and payment status."
      data={data}
      isLoading={isLoading}
      error={error}
      columns={columns}
      searchKeys={["invoiceNumber", "customerName", "status"]}
      addLabel="Create Invoice"
      drawerTitle="Create invoice"
      drawerDescription="Bill a customer for a completed trip."
      getRowKey={(r) => r.id}
      canDelete={role === "ADMIN" || role === "MANAGER"}
      onDelete={(r) => del.mutate(r.id)}
      deleteDescription={(r) => `This will permanently delete invoice ${r.invoiceNumber}.`}
      renderForm={(close) => (
        <InvoiceForm
          submitting={create.isPending}
          onSubmit={(payload) => create.mutate(payload, { onSuccess: () => close() })}
        />
      )}
      renderEditForm={(row, close) => (
        <InvoiceForm
          submitting={update.isPending}
          submitLabel="Save changes"
          initial={row}
          onSubmit={(payload) => update.mutate({ id: row.id, payload }, { onSuccess: () => close() })}
        />
      )}
    />
  );
}

interface InvoicePayload {
  customerId: string;
  tripId: string;
  baseFreightCharge: number;
  taxAmount: number;
  dueDate: string;
  status: Invoice["status"];
}

function InvoiceForm({
  onSubmit,
  submitting,
  initial,
  submitLabel,
}: {
  onSubmit: (i: InvoicePayload) => void;
  submitting: boolean;
  initial?: Partial<Invoice>;
  submitLabel?: string;
}) {
  const [customerId, setCustomerId] = useState(initial?.customerId ?? "");
  const [tripId, setTripId] = useState(initial?.tripId ?? "");
  const [base, setBase] = useState(initial?.baseFreightCharge != null ? String(initial.baseFreightCharge) : "");
  const [tax, setTax] = useState(initial?.taxAmount != null ? String(initial.taxAmount) : "");
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? "");
  const [err, setErr] = useState<string | null>(null);

  const total = useMemo(() => {
    const b = parseFloat(base) || 0;
    const t = parseFloat(tax) || 0;
    return b + t;
  }, [base, tax]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const b = parseFloat(base);
    const t = parseFloat(tax);
    if (!customerId || !tripId || !dueDate) { setErr("Customer, trip, and due date are required."); return; }
    if (!Number.isFinite(b) || b < 1.0) { setErr("Base freight charge must be at least 1.0."); return; }
    if (!Number.isFinite(t) || t < 0) { setErr("Tax amount must be 0 or greater."); return; }
    onSubmit({ customerId, tripId, baseFreightCharge: b, taxAmount: t, dueDate, status: initial?.status ?? "DRAFT" });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Customer ID</Label><Input value={customerId} onChange={(e) => setCustomerId(e.target.value)} placeholder="c1" className="mt-1" /></div>
        <div><Label>Trip ID</Label><Input value={tripId} onChange={(e) => setTripId(e.target.value)} placeholder="t1" className="mt-1" /></div>
      </div>
      <div><Label>Base Freight Charge (₹ INR)</Label><Input type="number" step="0.01" min="1" value={base} onChange={(e) => setBase(e.target.value)} placeholder="125000" className="mt-1 tabular-nums" /></div>
      <div><Label>Tax Amount (₹ INR)</Label><Input type="number" step="0.01" min="0" value={tax} onChange={(e) => setTax(e.target.value)} placeholder="22500" className="mt-1 tabular-nums" /></div>
      <div><Label>Due Date</Label><Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="mt-1" /></div>

      <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Base + Tax</span>
          <span className="tabular-nums">{fmt(parseFloat(base) || 0)} + {fmt(parseFloat(tax) || 0)}</span>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-900">Total</span>
          <span className="text-lg font-bold tabular-nums text-blue-700">{fmt(total)}</span>
        </div>
      </div>

      {err && <p className="text-xs text-red-600">{err}</p>}
      <Button type="submit" disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700">
        {submitting ? "Saving…" : (submitLabel ?? "Create invoice")}
      </Button>
    </form>
  );
}
