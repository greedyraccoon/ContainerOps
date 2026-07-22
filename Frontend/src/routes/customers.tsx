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
import type { Customer, CustomerType } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth";
import { useCreate, useDelete, useList, usePatchCustomerStatus, useUpdate } from "@/lib/crud";

export const Route = createFileRoute("/customers")({
  component: () => (
    <AppLayout roles={["ADMIN", "MANAGER"]}>
      <CustomersPage />
    </AppLayout>
  ),
});

const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STATUS_OPTIONS = ["ACTIVE", "INACTIVE"] as const;

const TYPE_OPTIONS: { value: CustomerType; label: string }[] = [
  { value: "DIRECT_SHIPPER", label: "Direct Shipper" },
  { value: "FREIGHT_FORWARDER", label: "Freight Forwarder" },
  { value: "CUSTOMS_BROKER", label: "Customs Broker" },
  { value: "MANUFACTURER", label: "Manufacturer" },
  { value: "OTHER", label: "Other" },
];

function CustomersPage() {
  const { role } = useAuth();
  const { data = [], isLoading, error } = useList<Customer>("customers");
  const create = useCreate<Customer>("customers", { successMessage: "Customer added" });
  const update = useUpdate<Customer>("customers", { successMessage: "Customer updated" });
  const patchStatus = usePatchCustomerStatus();
  const del = useDelete("customers", { successMessage: "Customer deleted" });

  const columns: Column<Customer>[] = [
    { key: "id", header: "ID", render: (r) => <span className="font-mono text-[11px] font-medium text-slate-400"># {r.id}</span> },
    { key: "co", header: "Company", render: (r) => <span className="font-medium text-slate-900">{r.companyName}</span> },
    { key: "cp", header: "Contact", render: (r) => r.contactPerson },
    { key: "ph", header: "Phone", render: (r) => <span className="font-mono text-xs">{r.phone}</span> },
    { key: "type", header: "Type", render: (r) => <span className="text-xs font-medium text-slate-600">{r.customerType.replace("_", " ")}</span> },
    { key: "status", header: "Status", render: (r) => (
      <StatusDropdown
        value={r.isActive ? "ACTIVE" : "INACTIVE"}
        tone={r.isActive ? "green" : "slate"}
        options={STATUS_OPTIONS}
        onChange={(next) => patchStatus.mutate({ id: r.id, isActive: next === "ACTIVE" })}
      />
    ) },
  ];


  return (
    <ResourcePage
      title="Customers"
      description="Billed accounts, contact roster, and GST details."
      data={data}
      isLoading={isLoading}
      error={error}
      columns={columns}
      searchKeys={["companyName", "contactPerson", "email", "phone", "gstNumber", "customerType"]}
      addLabel="Add Customer"
      drawerTitle="Register customer"
      drawerDescription="Onboard a new billed account."
      getRowKey={(r) => r.id}
      canDelete={role === "ADMIN" || role === "MANAGER"}
      onDelete={(r) => del.mutate(r.id)}
      deleteDescription={(r) => `This will permanently delete customer ${r.companyName}.`}
      renderForm={(close) => (
        <CustomerForm
          submitting={create.isPending}
          onSubmit={(payload) => create.mutate(payload, { onSuccess: () => close() })}
        />
      )}
      renderEditForm={(row, close) => (
        <CustomerForm
          submitting={update.isPending}
          submitLabel="Save changes"
          initial={row}
          onSubmit={(payload) => update.mutate({ id: row.id, payload }, { onSuccess: () => close() })}
        />
      )}
    />
  );
}

interface CustomerPayload {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  gstNumber: string;
  billingAddress: string;
  customerType: CustomerType;
  isActive: boolean;
}

function CustomerForm({
  onSubmit,
  submitting,
  initial,
  submitLabel,
}: {
  onSubmit: (c: CustomerPayload) => void;
  submitting: boolean;
  initial?: Partial<Customer>;
  submitLabel?: string;
}) {
  const [f, setF] = useState({
    companyName: initial?.companyName ?? "",
    contactPerson: initial?.contactPerson ?? "",
    email: initial?.email ?? "",
    phone: initial?.phone ?? "",
    gstNumber: initial?.gstNumber ?? "",
    billingAddress: initial?.billingAddress ?? "",
    customerType: (initial?.customerType ?? "DIRECT_SHIPPER") as CustomerType,
  });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));
  const [err, setErr] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.companyName || !f.contactPerson || !f.billingAddress) { setErr("Company, contact, and billing address are required."); return; }
    if (!EMAIL_REGEX.test(f.email)) { setErr("Please provide a valid email."); return; }
    if (!PHONE_REGEX.test(f.phone)) { setErr("Phone must be E.164 format, e.g., +912266667777."); return; }
    if (!GST_REGEX.test(f.gstNumber)) { setErr("GST number is invalid (e.g., 27AAACR5055K1Z5)."); return; }
    onSubmit({ ...f, isActive: initial?.isActive ?? true });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div><Label>Company Name</Label><Input value={f.companyName} onChange={(e) => set("companyName", e.target.value)} placeholder="Reliance Industries" className="mt-1" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Contact Person</Label><Input value={f.contactPerson} onChange={(e) => set("contactPerson", e.target.value)} placeholder="Anita Rao" className="mt-1" /></div>
        <div><Label>Email</Label><Input type="email" value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="ops@example.com" className="mt-1" /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Phone</Label><Input value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+912266667777" className="mt-1 font-mono" /></div>
        <div><Label>GST Number</Label><Input value={f.gstNumber} onChange={(e) => set("gstNumber", e.target.value.toUpperCase())} placeholder="27AAACR5055K1Z5" className="mt-1 font-mono" /></div>
      </div>
      <div><Label>Billing Address</Label><Textarea value={f.billingAddress} onChange={(e) => set("billingAddress", e.target.value)} placeholder="Maker Chambers IV, Nariman Point, Mumbai" rows={2} className="mt-1" /></div>
      <div>
        <Label>Customer Type</Label>
        <Select value={f.customerType} onValueChange={(v) => set("customerType", v as CustomerType)}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {err && <p className="text-xs text-red-600">{err}</p>}
      <Button type="submit" disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700">
        {submitting ? "Saving…" : (submitLabel ?? "Register customer")}
      </Button>
    </form>
  );
}
