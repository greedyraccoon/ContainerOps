import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout } from "@/components/app-layout";
import { ResourcePage, type Column } from "@/components/resource-page";
import { StatusDropdown } from "@/components/page-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Vehicle } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth";
import { useCreate, useDelete, useList, usePatchStatus, useUpdate } from "@/lib/crud";

export const Route = createFileRoute("/vehicles")({
  component: () => (
    <AppLayout roles={["ADMIN", "MANAGER", "DISPATCHER"]}>
      <VehiclesPage />
    </AppLayout>
  ),
});

const PLATE_REGEX = /^[A-Z]{2}-\d{2}-[A-Z]{2}-\d{4}$/;

const STATUS_OPTIONS = ["AVAILABLE", "DISPATCHED", "MAINTENANCE", "RETIRED"] as const;

const statusTone = (s: Vehicle["status"]) =>
  s === "AVAILABLE" ? "green" : s === "DISPATCHED" ? "blue" : s === "MAINTENANCE" ? "amber" : "slate";

function VehiclesPage() {
  const { role } = useAuth();
  const { data = [], isLoading, error } = useList<Vehicle>("vehicles");
  const create = useCreate<Vehicle>("vehicles", { successMessage: "Vehicle registered" });
  const update = useUpdate<Vehicle>("vehicles", { successMessage: "Vehicle updated" });
  const patchStatus = usePatchStatus("vehicles");
  const del = useDelete("vehicles", { successMessage: "Vehicle deleted" });

  const columns: Column<Vehicle>[] = [
    { key: "id", header: "ID", render: (r) => <span className="font-mono text-[11px] font-medium text-slate-400"># {r.id}</span> },
    { key: "plate", header: "License Plate", render: (r) => <span className="font-mono text-xs font-medium text-slate-900">{r.licensePlate}</span> },
    { key: "make", header: "Make / Model", render: (r) => <span>{r.make} <span className="text-slate-400">·</span> {r.model}</span> },
    { key: "cap", header: "Capacity", render: (r) => <span className="tabular-nums">{r.capacityTons} T</span> },
    { key: "type", header: "Type", render: (r) => <span className="text-xs font-medium text-slate-600">{r.type}</span> },
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
      title="Vehicles"
      description="Fleet registry with capacity, type, and current status."
      data={data}
      isLoading={isLoading}
      error={error}
      columns={columns}
      searchKeys={["licensePlate", "make", "model", "type", "status"]}
      addLabel="Add Vehicle"
      drawerTitle="Register vehicle"
      drawerDescription="Add a new asset to the fleet."
      getRowKey={(r) => r.id}
      canDelete={role === "ADMIN" || role === "MANAGER"}
      onDelete={(r) => del.mutate(r.id)}
      deleteDescription={(r) => `This will permanently delete vehicle ${r.licensePlate}.`}
      renderForm={(close) => (
        <VehicleForm
          submitting={create.isPending}
          onSubmit={(payload) => create.mutate(payload, { onSuccess: () => close() })}
        />
      )}
      renderEditForm={(row, close) => (
        <VehicleForm
          submitting={update.isPending}
          submitLabel="Save changes"
          initial={row}
          onSubmit={(payload) => update.mutate({ id: row.id, payload }, { onSuccess: () => close() })}
        />
      )}
    />
  );
}

interface VehiclePayload {
  licensePlate: string;
  make: string;
  model: string;
  capacityTons: number;
  type: Vehicle["type"];
  status: Vehicle["status"];
}

function VehicleForm({
  onSubmit,
  submitting,
  initial,
  submitLabel,
}: {
  onSubmit: (v: VehiclePayload) => void;
  submitting: boolean;
  initial?: Partial<Vehicle>;
  submitLabel?: string;
}) {
  const [plate, setPlate] = useState(initial?.licensePlate ?? "");
  const [make, setMake] = useState(initial?.make ?? "");
  const [model, setModel] = useState(initial?.model ?? "");
  const [capacity, setCapacity] = useState(initial?.capacityTons != null ? String(initial.capacityTons) : "");
  const [type, setType] = useState<Vehicle["type"]>(initial?.type ?? "PRIME_MOVER");
  const [err, setErr] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!PLATE_REGEX.test(plate)) {
      setErr("License plate must match XX-00-XX-0000 (e.g., MH-46-AB-1234).");
      return;
    }
    const cap = parseFloat(capacity);
    if (!make || !model || !cap || cap <= 0) {
      setErr("All fields are required and capacity must be positive.");
      return;
    }
    onSubmit({ licensePlate: plate, make, model, capacityTons: cap, type, status: initial?.status ?? "AVAILABLE" });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <Label>License Plate</Label>
        <Input value={plate} onChange={(e) => setPlate(e.target.value.toUpperCase())} placeholder="MH-46-AB-1234" className="mt-1 font-mono" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Make</Label>
          <Input value={make} onChange={(e) => setMake(e.target.value)} placeholder="Tata" className="mt-1" />
        </div>
        <div>
          <Label>Model</Label>
          <Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="Prima 4028.S" className="mt-1" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Capacity (Tons)</Label>
          <Input type="number" step="0.1" value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="28" className="mt-1" />
        </div>
        <div>
          <Label>Type</Label>
          <Select value={type} onValueChange={(v) => setType(v as Vehicle["type"])}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="PRIME_MOVER">Prime Mover</SelectItem>
              <SelectItem value="CONTAINER_CHASSIS">Container Chassis</SelectItem>
              <SelectItem value="FLATBED">Flatbed</SelectItem>
              <SelectItem value="LIGHT_COMMERCIAL">Light Commercial</SelectItem>
              <SelectItem value="TRUCK">Truck</SelectItem>
              <SelectItem value="TRAILER">Trailer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {err && <p className="text-xs text-red-600">{err}</p>}
      <Button type="submit" disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700">
        {submitting ? "Saving…" : (submitLabel ?? "Register vehicle")}
      </Button>
    </form>
  );
}
