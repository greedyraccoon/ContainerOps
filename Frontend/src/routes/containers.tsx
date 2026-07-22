import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout } from "@/components/app-layout";
import { ResourcePage, type Column } from "@/components/resource-page";
import { StatusDropdown } from "@/components/page-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Container, ContainerType } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth";
import { useCreate, useDelete, useList, usePatchStatus, useUpdate } from "@/lib/crud";

export const Route = createFileRoute("/containers")({
  component: () => (
    <AppLayout roles={["ADMIN", "MANAGER", "DISPATCHER"]}>
      <ContainersPage />
    </AppLayout>
  ),
});

const CONTAINER_REGEX = /^[A-Z]{4}\d{7}$/;
const STATUS_OPTIONS = ["AVAILABLE", "IN_TRANSIT", "MAINTENANCE", "RETIRED"] as const;

const statusTone = (s: Container["status"]) =>
  s === "AVAILABLE" ? "green" : s === "IN_TRANSIT" ? "blue" : s === "MAINTENANCE" ? "amber" : "slate";

const TYPE_OPTIONS: { value: ContainerType; label: string }[] = [
  { value: "STANDARD_20FT", label: "Standard 20ft" },
  { value: "STANDARD_40FT", label: "Standard 40ft" },
  { value: "REFRIGERATED", label: "Refrigerated" },
  { value: "FLAT_RACK", label: "Flat Rack" },
];

function ContainersPage() {
  const { role } = useAuth();
  const { data = [], isLoading, error } = useList<Container>("containers");
  const create = useCreate<Container>("containers", { successMessage: "Container registered" });
  const update = useUpdate<Container>("containers", { successMessage: "Container updated" });
  const patchStatus = usePatchStatus("containers");
  const del = useDelete("containers", { successMessage: "Container deleted" });

  const columns: Column<Container>[] = [
    { key: "id", header: "ID", render: (r) => <span className="font-mono text-[11px] font-medium text-slate-400"># {r.id}</span> },
    { key: "num", header: "Container #", render: (r) => <span className="font-mono text-xs font-semibold text-slate-900">{r.containerNumber}</span> },
    { key: "type", header: "Type", render: (r) => <span className="text-xs font-medium text-slate-600">{r.type.replace("_", " ")}</span> },
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
      title="Containers"
      description="Container inventory across ports and depots."
      data={data}
      isLoading={isLoading}
      error={error}
      columns={columns}
      searchKeys={["containerNumber", "type", "status"]}
      addLabel="Add Container"
      drawerTitle="Register container"
      drawerDescription="Add a container to the inventory pool."
      getRowKey={(r) => r.id}
      canDelete={role === "ADMIN" || role === "MANAGER"}
      onDelete={(r) => del.mutate(r.id)}
      deleteDescription={(r) => `This will permanently delete container ${r.containerNumber}.`}
      renderForm={(close) => (
        <ContainerForm
          submitting={create.isPending}
          onSubmit={(payload) => create.mutate(payload, { onSuccess: () => close() })}
        />
      )}
      renderEditForm={(row, close) => (
        <ContainerForm
          submitting={update.isPending}
          submitLabel="Save changes"
          initial={row}
          onSubmit={(payload) => update.mutate({ id: row.id, payload }, { onSuccess: () => close() })}
        />
      )}
    />
  );
}

interface ContainerPayload {
  containerNumber: string;
  type: ContainerType;
  status: Container["status"];
}

function ContainerForm({
  onSubmit,
  submitting,
  initial,
  submitLabel,
}: {
  onSubmit: (c: ContainerPayload) => void;
  submitting: boolean;
  initial?: Partial<Container>;
  submitLabel?: string;
}) {
  const [containerNumber, setContainerNumber] = useState(initial?.containerNumber ?? "");
  const [type, setType] = useState<ContainerType>(initial?.type ?? "STANDARD_40FT");
  const [err, setErr] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!CONTAINER_REGEX.test(containerNumber)) {
      setErr("Container number must be 4 uppercase letters + 7 digits (e.g., MAEU1234567).");
      return;
    }
    onSubmit({ containerNumber, type, status: initial?.status ?? "AVAILABLE" });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <Label>Container Number</Label>
        <Input value={containerNumber} onChange={(e) => setContainerNumber(e.target.value.toUpperCase())} placeholder="MAEU1234567" className="mt-1 font-mono" />
      </div>
      <div>
        <Label>Type</Label>
        <Select value={type} onValueChange={(v) => setType(v as ContainerType)}>
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
        {submitting ? "Saving…" : (submitLabel ?? "Register container")}
      </Button>
    </form>
  );
}
