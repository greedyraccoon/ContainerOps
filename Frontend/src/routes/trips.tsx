import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { ResourcePage, type Column } from "@/components/resource-page";
import { StatusDropdown } from "@/components/page-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Trip } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth";
import { useCreate, useDelete, useList, usePatchTripStatus, useUpdate } from "@/lib/crud";

export const Route = createFileRoute("/trips")({
  component: () => (
    <AppLayout roles={["ADMIN", "MANAGER", "DISPATCHER"]}>
      <TripsPage />
    </AppLayout>
  ),
});

const STATUS_OPTIONS = ["PLANNED", "DISPATCHED", "IN_TRANSIT", "DELAYED", "ARRIVED", "COMPLETED", "CANCELLED"] as const;

const statusTone = (s: Trip["status"]) =>
  s === "COMPLETED" || s === "ARRIVED" ? "green" : s === "IN_TRANSIT" || s === "DISPATCHED" ? "blue" : s === "PLANNED" ? "slate" : s === "DELAYED" ? "amber" : "red";

function TripsPage() {
  const { role } = useAuth();
  const { data = [], isLoading, error } = useList<Trip>("trips");
  
  // 1. Fetch drivers and vehicles lists for name lookups
  const { data: drivers = [] } = useList<any>("drivers");
  const { data: vehicles = [] } = useList<any>("vehicles");

  const create = useCreate<Trip>("trips", { successMessage: "Trip created" });
  const update = useUpdate<Trip>("trips", { successMessage: "Trip updated" });
  const patchStatus = usePatchTripStatus();
  const del = useDelete("trips", { successMessage: "Trip deleted" });

  const columns: Column<Trip>[] = [
    { key: "id", header: "ID", render: (r) => <span className="font-mono text-[11px] font-medium text-slate-400"># {r.id}</span> },
    { key: "mf", header: "Manifest #", render: (r) => <span className="font-mono text-xs font-semibold text-slate-900">{r.tripManifestNumber}</span> },
    
    // 2. Looks up vehicle license plate by ID
    { 
      key: "veh", 
      header: "Vehicle", 
      render: (r) => {
        const veh = vehicles.find((v: any) => String(v.id) === String(r.vehicleId));
        return (
          <span className="font-mono text-xs">
            {veh ? veh.licensePlate : (r.vehicleRegistrationNumber || `#${r.vehicleId}`)}
          </span>
        );
      } 
    },
    
    { key: "cn", header: "Container", render: (r) => <span className="font-mono text-xs">{r.containerNumber}</span> },
    
    // 3. Looks up driver full name by ID
    { 
      key: "drv", 
      header: "Driver", 
      render: (r) => {
        const drv = drivers.find((d: any) => String(d.id) === String(r.driverId));
        return drv ? `${drv.firstName} ${drv.lastName}` : (r.driverName || `#${r.driverId}`);
      } 
    },
    
    { key: "route", header: "Origin → Destination", render: (r) => (
      <span className="flex items-center gap-1.5 text-xs">
        <span className="font-medium text-slate-700">{r.sourceLocation}</span>
        <ArrowRight className="h-3 w-3 text-slate-400" />
        <span className="font-medium text-slate-700">{r.destinationLocation}</span>
      </span>
    )},
    { key: "status", header: "Status", render: (r) => (
      <StatusDropdown
        value={r.status}
        tone={statusTone(r.status)}
        options={STATUS_OPTIONS}
        onChange={(next) => patchStatus.mutate({ id: r.id, status: next, currentOdometer: r.currentOdometer })}
      />
    ) },
    { key: "eta", header: "ETA", render: (r) => <span className="tabular-nums text-xs text-slate-600">{r.estimatedDeliveryAt}</span> },
  ];

  return (
    <ResourcePage
      title="Trips"
      description="Active manifests and route status across the fleet."
      data={data}
      isLoading={isLoading}
      error={error}
      columns={columns}
      searchKeys={["tripManifestNumber", "vehicleRegistrationNumber", "containerNumber", "driverName", "sourceLocation", "destinationLocation", "status"]}
      addLabel="Create Trip"
      drawerTitle="Create trip"
      drawerDescription="Assign a vehicle, driver, and route."
      getRowKey={(r) => r.id}
      canDelete={role === "ADMIN" || role === "MANAGER"}
      onDelete={(r) => del.mutate(r.id)}
      deleteDescription={(r) => `This will permanently delete trip ${r.tripManifestNumber}.`}
      renderForm={(close) => (
        <TripForm
          submitting={create.isPending}
          onSubmit={(payload) => create.mutate(payload, { onSuccess: () => close() })}
        />
      )}
      renderEditForm={(row, close) => (
        <TripForm
          submitting={update.isPending}
          submitLabel="Save changes"
          initial={row}
          onSubmit={(payload) => update.mutate({ id: row.id, payload }, { onSuccess: () => close() })}
        />
      )}
    />
  );
}

interface TripPayload {
  vehicleId: string;
  containerId: string;
  driverId: string;
  sourceLocation: string;
  destinationLocation: string;
  estimatedDeliveryAt: string;
  startingOdometer: number;
  status: Trip["status"];
}

function TripForm({
  onSubmit,
  submitting,
  initial,
  submitLabel,
}: {
  onSubmit: (t: TripPayload) => void;
  submitting: boolean;
  initial?: Partial<Trip>;
  submitLabel?: string;
}) {
  const [f, setF] = useState({
    vehicleId: initial?.vehicleId ?? "",
    containerId: initial?.containerId ?? "",
    driverId: initial?.driverId ?? "",
    sourceLocation: initial?.sourceLocation ?? "",
    destinationLocation: initial?.destinationLocation ?? "",
    estimatedDeliveryAt: initial?.estimatedDeliveryAt ?? "",
    startingOdometer: initial?.startingOdometer != null ? String(initial.startingOdometer) : "",
  });
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));
  const [err, setErr] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.vehicleId || !f.containerId || !f.driverId || !f.sourceLocation || !f.destinationLocation || !f.estimatedDeliveryAt) {
      setErr("All fields are required.");
      return;
    }
    const odo = parseInt(f.startingOdometer, 10);
    if (!Number.isFinite(odo) || odo < 0) { setErr("Odometer must be a non-negative integer."); return; }

    const formatLocalDateTime = (dateStr: string) => {
      if (!dateStr) return dateStr;
      if (dateStr.length === 10) return `${dateStr}T00:00:00`;
      if (dateStr.length === 16) return `${dateStr}:00`;
      return dateStr;
    };

    onSubmit({
      vehicleId: f.vehicleId, 
      containerId: f.containerId, 
      driverId: f.driverId,
      sourceLocation: f.sourceLocation, 
      destinationLocation: f.destinationLocation,
      estimatedDeliveryAt: formatLocalDateTime(f.estimatedDeliveryAt), 
      startingOdometer: odo,
      status: initial?.status ?? "PLANNED",
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Vehicle ID</Label><Input value={f.vehicleId} onChange={(e) => set("vehicleId", e.target.value)} placeholder="v1" className="mt-1" /></div>
        <div><Label>Container ID</Label><Input value={f.containerId} onChange={(e) => set("containerId", e.target.value)} placeholder="CN-8815" className="mt-1" /></div>
      </div>
      <div><Label>Driver ID</Label><Input value={f.driverId} onChange={(e) => set("driverId", e.target.value)} placeholder="d1" className="mt-1" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Source Location</Label><Input value={f.sourceLocation} onChange={(e) => set("sourceLocation", e.target.value)} placeholder="JNPT, Mumbai" className="mt-1" /></div>
        <div><Label>Destination Location</Label><Input value={f.destinationLocation} onChange={(e) => set("destinationLocation", e.target.value)} placeholder="Delhi ICD" className="mt-1" /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Estimated Delivery</Label><Input type="datetime-local" value={f.estimatedDeliveryAt} onChange={(e) => set("estimatedDeliveryAt", e.target.value)} className="mt-1" /></div>
        <div><Label>Starting Odometer</Label><Input type="number" value={f.startingOdometer} onChange={(e) => set("startingOdometer", e.target.value)} placeholder="150000" className="mt-1" /></div>
      </div>
      {err && <p className="text-xs text-red-600">{err}</p>}
      <Button type="submit" disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700">
        {submitting ? "Saving…" : (submitLabel ?? "Create trip")}
      </Button>
    </form>
  );
}
