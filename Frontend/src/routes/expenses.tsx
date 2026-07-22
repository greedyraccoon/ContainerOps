import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout } from "@/components/app-layout";
import { ResourcePage, type Column } from "@/components/resource-page";
import { StatusDropdown } from "@/components/page-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Expense } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth";
import { useCreate, useDelete, useList, usePatchStatus, useUpdate } from "@/lib/crud";

export const Route = createFileRoute("/expenses")({
  component: () => (
    <AppLayout roles={["ADMIN", "ACCOUNTANT"]}>
      <ExpensesPage />
    </AppLayout>
  ),
});

const STATUS_OPTIONS = ["PENDING", "APPROVED", "REJECTED", "REIMBURSED"] as const;

const statusTone = (s: Expense["status"]) =>
  s === "APPROVED" ? "green" : s === "REIMBURSED" ? "blue" : s === "PENDING" ? "amber" : "red";

const fmt = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

function ExpensesPage() {
  const { role } = useAuth();
  const { data = [], isLoading, error } = useList<Expense>("expenses");
  const create = useCreate<Expense>("expenses", { successMessage: "Expense logged" });
  const update = useUpdate<Expense>("expenses", { successMessage: "Expense updated" });
  const patchStatus = usePatchStatus("expenses");
  const del = useDelete("expenses", { successMessage: "Expense deleted" });

  const columns: Column<Expense>[] = [
    { key: "id", header: "ID", render: (r) => <span className="font-mono text-[11px] font-medium text-slate-400"># {r.id}</span> },
    { key: "trip", header: "Trip ID", render: (r) => <span className="font-mono text-xs font-semibold text-slate-900">{r.tripId}</span> },
    { key: "type", header: "Expense Type", render: (r) => <span className="text-xs font-medium text-slate-600">{r.expenseType}</span> },
    { key: "amt", header: "Amount", render: (r) => <span className="tabular-nums font-semibold text-slate-900">{fmt(r.amount)}</span>, className: "text-right" },
    { key: "date", header: "Date", render: (r) => <span className="tabular-nums text-xs">{r.expenseDate}</span> },
    { key: "status", header: "Status", render: (r) => (
      <StatusDropdown
        value={r.status}
        tone={statusTone(r.status)}
        options={STATUS_OPTIONS}
        onChange={(next) => patchStatus.mutate({ id: r.id, status: next })}
      />
    ) },
  ];

  return (
    <ResourcePage
      title="Expenses"
      description="Trip-level operational expenses awaiting approval."
      data={data}
      isLoading={isLoading}
      error={error}
      columns={columns}
      searchKeys={["tripId", "expenseType", "description", "status"]}
      addLabel="Log Expense"
      drawerTitle="Log expense"
      drawerDescription="Record fuel, tolls, maintenance, or other trip costs."
      getRowKey={(r) => r.id}
      canDelete={role === "ADMIN" || role === "MANAGER"}
      onDelete={(r) => del.mutate(r.id)}
      deleteDescription={(r) => `This will permanently delete expense on trip ${r.tripId}.`}
      renderForm={(close) => (
        <ExpenseForm
          submitting={create.isPending}
          onSubmit={(payload) => create.mutate(payload, { onSuccess: () => close() })}
        />
      )}
      renderEditForm={(row, close) => (
        <ExpenseForm
          submitting={update.isPending}
          submitLabel="Save changes"
          initial={row}
          onSubmit={(payload) => update.mutate({ id: row.id, payload }, { onSuccess: () => close() })}
        />
      )}
    />
  );
}

interface ExpensePayload {
  tripId: string;
  expenseType: Expense["expenseType"];
  amount: number;
  expenseDate: string;
  description: string;
  receiptUrl: string;
  status: Expense["status"];
}

function ExpenseForm({
  onSubmit,
  submitting,
  initial,
  submitLabel,
}: {
  onSubmit: (e: ExpensePayload) => void;
  submitting: boolean;
  initial?: Partial<Expense>;
  submitLabel?: string;
}) {
  const [tripId, setTripId] = useState(initial?.tripId ?? "");
  const [type, setType] = useState<Expense["expenseType"]>(initial?.expenseType ?? "FUEL");
  const [amount, setAmount] = useState(initial?.amount != null ? String(initial.amount) : "");
  const [expenseDate, setExpenseDate] = useState(initial?.expenseDate ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [receiptUrl, setReceiptUrl] = useState(initial?.receiptUrl ?? "");
  const [err, setErr] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!tripId || !expenseDate) { setErr("Trip ID and date are required."); return; }
    if (!Number.isFinite(amt) || amt < 0.1) { setErr("Amount must be at least 0.1."); return; }
    onSubmit({ tripId, expenseType: type, amount: amt, expenseDate, description, receiptUrl, status: initial?.status ?? "PENDING" });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div><Label>Trip ID</Label><Input value={tripId} onChange={(e) => setTripId(e.target.value)} placeholder="t1" className="mt-1" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Expense Type</Label>
          <Select value={type} onValueChange={(v) => setType(v as Expense["expenseType"])}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="FUEL">Fuel</SelectItem>
              <SelectItem value="TOLL">Toll</SelectItem>
              <SelectItem value="DRIVER_ALLOWANCE">Driver Allowance</SelectItem>
              <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
              <SelectItem value="WEIGHBRIDGE">Weighbridge</SelectItem>
              <SelectItem value="MISCELLANEOUS">Miscellaneous</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div><Label>Amount (₹ INR)</Label><Input type="number" step="0.01" min="0.1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="18400" className="mt-1 tabular-nums" /></div>
      </div>
      <div><Label>Expense Date</Label><Input type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} className="mt-1" /></div>
      <div><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="HP diesel refill at Bhiwandi" rows={2} className="mt-1" /></div>
      <div><Label>Receipt URL</Label><Input value={receiptUrl} onChange={(e) => setReceiptUrl(e.target.value)} placeholder="https://..." className="mt-1" /></div>
      {err && <p className="text-xs text-red-600">{err}</p>}
      <Button type="submit" disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700">
        {submitting ? "Saving…" : (submitLabel ?? "Log expense")}
      </Button>
    </form>
  );
}
