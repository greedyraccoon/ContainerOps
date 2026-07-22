import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { ResourcePage, type Column } from "@/components/resource-page";
import { StatusDropdown } from "@/components/page-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Shipment } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth";
import { useCreate, useDelete, useList, usePatchStatus, useUpdate } from "@/lib/crud";

export const Route = createFileRoute("/shipments")({
  component: () => (
    <AppLayout roles={["ADMIN", "MANAGER"]}>
      <ShipmentsPage />
    </AppLayout>
  ),
});

const STATUS_OPTIONS = ["BOOKED", "AT_ORIGIN_PORT", "ON_VESSEL", "DISCHARGED_AT_DESTINATION", "INLAND_TRANSIT", "DELIVERED"] as const;

const statusTone = (s: Shipment["status"]) =>
  s === "DELIVERED" ? "green" : s === "INLAND_TRANSIT" || s === "ON_VESSEL" ? "blue" : s === "DISCHARGED_AT_DESTINATION" ? "amber" : "slate";

function ShipmentsPage() {
  const { role } = useAuth();
  const { data = [], isLoading, error } = useList<Shipment>("shipments");

  // 1. Fetch lookup data for customers and containers
  const { data: customers = [] } = useList<any>("customers");
  const { data: containers = [] } = useList<any>("containers");

  const create = useCreate<Shipment>("shipments", { successMessage: "Shipment booked" });
  const update = useUpdate<Shipment>("shipments", { successMessage: "Shipment updated" });
  const patchStatus = usePatchStatus("shipments");
  const del = useDelete("shipments", { successMessage: "Shipment deleted" });

  const columns: Column<Shipment>[] = [
    { key: "id", header: "ID", render: (r) => <span className="font-mono text-[11px] font-medium text-slate-400"># {r.id}</span> },
    { key: "sn", header: "Shipment #", render: (r) => <span className="font-mono text-xs font-semibold text-slate-900">{r.shipmentNumber}</span> },
    
    // Customer Column (handles flat DTO, nested object, or array lookup)
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
    
    // Container Column (handles flat DTO, nested object, or array lookup)
    { 
      key: "cn", 
      header: "Container", 
      render: (r: any) => {
        const num = r.containerNumber || r.container?.containerNumber;
        if (num) return <span className="font-mono text-xs">{num}</span>;

        const id = r.containerId ?? r.container?.id;
        const cnt = containers.find((c: any) => String(c.id) === String(id));
        const finalNum = cnt?.containerNumber || (id ? `#${id}` : "—");
        return <span className="font-mono text-xs">{finalNum}</span>;
      } 
    },
    
    { key: "bl", header: "BL Number", render: (r) => <span className="font-mono text-xs">{r.blNumber}</span> },
    { key: "dir", header: "Direction", render: (r) => (
      <span className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${r.direction === "IMPORT" ? "bg-indigo-50 text-indigo-700" : "bg-teal-50 text-teal-700"}`}>
        {r.direction}
      </span>
    )},
    { key: "route", header: "Route", render: (r) => (
      <span className="flex items-center gap-1.5 text-xs">
        <span className="font-medium text-slate-700">{r.origin}</span>
        <ArrowRight className="h-3 w-3 text-slate-400" />
        <span className="font-medium text-slate-700">{r.destination}</span>
      </span>
    )},
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
      title="Shipments"
      description="Import and export shipments with BL tracking."
      data={data}
      isLoading={isLoading}
      error={error}
      columns={columns}
      searchKeys={["shipmentNumber", "customerName", "blNumber", "origin", "destination", "shippingLine"]}
      addLabel="New Shipment"
      drawerTitle="New shipment"
      drawerDescription="Book an import or export shipment."
      getRowKey={(r) => r.id}
      canDelete={role === "ADMIN" || role === "MANAGER"}
      onDelete={(r) => del.mutate(r.id)}
      deleteDescription={(r) => `This will permanently delete shipment ${r.shipmentNumber}.`}
      renderForm={(close) => (
        <ShipmentForm
          submitting={create.isPending}
          onSubmit={(payload) => create.mutate(payload, { onSuccess: () => close() })}
        />
      )}
      renderEditForm={(row, close) => (
        <ShipmentForm
          submitting={update.isPending}
          submitLabel="Save changes"
          initial={row}
          onSubmit={(payload) => update.mutate({ id: row.id, payload }, { onSuccess: () => close() })}
        />
      )}
    />
  );
}

interface ShipmentPayload {
  customerId: string;
  containerId: string;
  shippingLine: string;
  blNumber: string;
  direction: Shipment["direction"];
  origin: string;
  destination: string;
  etd: string;
  eta: string;
  status: Shipment["status"];
}

function ShipmentForm({
  onSubmit,
  submitting,
  initial,
  submitLabel,
}: {
  onSubmit: (s: ShipmentPayload) => void;
  submitting: boolean;
  initial?: Partial<Shipment>;
  submitLabel?: string;
}) {
  const [f, setF] = useState({
    customerId: initial?.customerId ?? "",
    containerId: initial?.containerId ?? "",
    shippingLine: initial?.shippingLine ?? "",
    blNumber: initial?.blNumber ?? "",
    direction: (initial?.direction ?? "IMPORT") as Shipment["direction"],
    origin: initial?.origin ?? "",
    destination: initial?.destination ?? "",
    etd: initial?.etd ?? "",
    eta: initial?.eta ?? "",
  });
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));
  const [err, setErr] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(f).some((v) => !v)) { setErr("All fields are required."); return; }

    const formatLocalDateTime = (dateStr: string) => {
      if (!dateStr) return dateStr;
      if (dateStr.length === 10) return `${dateStr}T00:00:00`;
      if (dateStr.length === 16) return `${dateStr}:00`;
      return dateStr;
    };

    onSubmit({
      ...f,
      etd: formatLocalDateTime(f.etd),
      eta: formatLocalDateTime(f.eta),
      status: initial?.status ?? "BOOKED",
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Customer ID</Label><Input value={f.customerId} onChange={(e) => set("customerId", e.target.value)} placeholder="c1" className="mt-1" /></div>
        <div><Label>Container ID</Label><Input value={f.containerId} onChange={(e) => set("containerId", e.target.value)} placeholder="CN-8815" className="mt-1" /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Shipping Line</Label><Input value={f.shippingLine} onChange={(e) => set("shippingLine", e.target.value)} placeholder="Maersk" className="mt-1" /></div>
        <div><Label>BL Number</Label><Input value={f.blNumber} onChange={(e) => set("blNumber", e.target.value)} placeholder="MAEU-12345678" className="mt-1 font-mono" /></div>
      </div>
      <div>
        <Label>Direction</Label>
        <Select value={f.direction} onValueChange={(v) => set("direction", v)}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="IMPORT">Import</SelectItem>
            <SelectItem value="EXPORT">Export</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Origin</Label><Input value={f.origin} onChange={(e) => set("origin", e.target.value)} placeholder="Rotterdam" className="mt-1" /></div>
        <div><Label>Destination</Label><Input value={f.destination} onChange={(e) => set("destination", e.target.value)} placeholder="New Delhi" className="mt-1" /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>ETD</Label><Input type="date" value={f.etd} onChange={(e) => set("etd", e.target.value)} className="mt-1" /></div>
        <div><Label>ETA</Label><Input type="date" value={f.eta} onChange={(e) => set("eta", e.target.value)} className="mt-1" /></div>
      </div>
      {err && <p className="text-xs text-red-600">{err}</p>}
      <Button type="submit" disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700">
        {submitting ? "Saving…" : (submitLabel ?? "Book shipment")}
      </Button>
    </form>
  );
}
