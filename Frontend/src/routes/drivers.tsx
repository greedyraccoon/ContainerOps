import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout } from "@/components/app-layout";
import { ResourcePage, type Column } from "@/components/resource-page";
import { StatusDropdown } from "@/components/page-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Driver } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth";
import { useCreate, useDelete, useList, usePatchStatus, useUpdate } from "@/lib/crud";

export const Route = createFileRoute("/drivers")({
  component: () => (
    <AppLayout roles={["ADMIN", "MANAGER", "DISPATCHER"]}>
      <DriversPage />
    </AppLayout>
  ),
});

const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;
const STATUS_OPTIONS = ["AVAILABLE", "ON_ROUTE", "OFF_DUTY"] as const;

const statusTone = (s: Driver["status"]) =>
  s === "AVAILABLE" ? "green" : s === "ON_ROUTE" ? "blue" : "slate";

function DriversPage() {
  const { role } = useAuth();
  const { data = [], isLoading, error } = useList<Driver>("drivers");
  const create = useCreate<Driver>("drivers", { successMessage: "Driver registered" });
  const update = useUpdate<Driver>("drivers", { successMessage: "Driver updated" });
  const patchStatus = usePatchStatus("drivers");
  const del = useDelete("drivers", { successMessage: "Driver deleted" });

  const columns: Column<Driver>[] = [
    { key: "id", header: "ID", render: (r) => <span className="font-mono text-[11px] font-medium text-slate-400"># {r.id}</span> },
    { key: "fn", header: "First Name", render: (r) => <span className="font-medium text-slate-900">{r.firstName}</span> },
    { key: "ln", header: "Last Name", render: (r) => r.lastName },
    { key: "lic", header: "License #", render: (r) => <span className="font-mono text-xs">{r.licenseNumber}</span> },
    { key: "ph", header: "Phone", render: (r) => <span className="font-mono text-xs">{r.phoneNumber}</span> },
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
      title="Drivers"
      description="Licensed drivers assigned across the fleet."
      data={data}
      isLoading={isLoading}
      error={error}
      columns={columns}
      searchKeys={["firstName", "lastName", "licenseNumber", "phoneNumber", "status"]}
      addLabel="Add Driver"
      drawerTitle="Register driver"
      drawerDescription="Add a new licensed driver to the roster."
      getRowKey={(r) => r.id}
      canDelete={role === "ADMIN" || role === "MANAGER"}
      onDelete={(r) => del.mutate(r.id)}
      deleteDescription={(r) => `This will permanently delete driver ${r.firstName} ${r.lastName}.`}
      renderForm={(close) => (
        <DriverForm
          submitting={create.isPending}
          onSubmit={(payload) => create.mutate(payload, { onSuccess: () => close() })}
        />
      )}
      renderEditForm={(row, close) => (
        <DriverForm
          submitting={update.isPending}
          submitLabel="Save changes"
          initial={row}
          onSubmit={(payload) => update.mutate({ id: row.id, payload }, { onSuccess: () => close() })}
        />
      )}
    />
  );
}

interface DriverPayload {
  firstName: string;
  lastName: string;
  licenseNumber: string;
  phone: string;
  status: Driver["status"];
}

function DriverForm({
  onSubmit,
  submitting,
  initial,
  submitLabel,
}: {
  onSubmit: (d: DriverPayload) => void;
  submitting: boolean;
  initial?: Partial<Driver>;
  submitLabel?: string;
}) {
  const [firstName, setFirstName] = useState(initial?.firstName ?? "");
  const [lastName, setLastName] = useState(initial?.lastName ?? "");
  const [licenseNumber, setLicenseNumber] = useState(initial?.licenseNumber ?? "");
  const [phone, setPhone] = useState(initial?.phoneNumber ?? "");
  const [err, setErr] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !licenseNumber) { setErr("First name, last name, and license are required."); return; }
    if (!PHONE_REGEX.test(phone)) { setErr("Phone must be E.164 format, e.g., +919812345678."); return; }
    onSubmit({ firstName, lastName, licenseNumber, phone, status: initial?.status ?? "AVAILABLE" });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div><Label>First Name</Label><Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Ravi" className="mt-1" /></div>
        <div><Label>Last Name</Label><Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Kumar" className="mt-1" /></div>
      </div>
      <div><Label>License Number</Label><Input value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value.toUpperCase())} placeholder="MH1420180001234" className="mt-1 font-mono" /></div>
      <div><Label>Phone Number</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+919812345678" className="mt-1 font-mono" /></div>
      {err && <p className="text-xs text-red-600">{err}</p>}
      <Button type="submit" disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700">
        {submitting ? "Saving…" : (submitLabel ?? "Register driver")}
      </Button>
    </form>
  );
}
