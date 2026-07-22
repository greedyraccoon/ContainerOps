import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

const toErr = (err: unknown) =>
  (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data
    ?.message ??
  (err as { message?: string })?.message ??
  "Request failed";

/** Fetch a list resource from the Spring Boot backend. */
export function useList<T>(resource: string) {
  return useQuery<T[]>({
    queryKey: [resource],
    queryFn: async () => {
      const res = await api.get(`/api/v1/${resource}`);
      const data = res.data;
      if (Array.isArray(data)) return data as T[];
      if (Array.isArray(data?.content)) return data.content as T[];
      if (Array.isArray(data?.data)) return data.data as T[];
      if (Array.isArray(data?.items)) return data.items as T[];
      if (Array.isArray(data?.results)) return data.results as T[];
      if (Array.isArray(data?.[resource])) return data[resource] as T[];
      return [] as T[];
    },
  });
}

/** POST /api/v1/<resource> */
export function useCreate<T, P = Partial<T>>(resource: string, opts?: { successMessage?: string }) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: P) => {
      const res = await api.post(`/api/v1/${resource}`, payload);
      return res.data as T;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [resource] });
      if (opts?.successMessage) toast.success(opts.successMessage);
    },
    onError: (err) => toast.error(toErr(err)),
  });
}

/** PUT /api/v1/<resource>/{id} */
export function useUpdate<T, P = Partial<T>>(resource: string, opts?: { successMessage?: string }) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: P }) => {
      const res = await api.put(`/api/v1/${resource}/${id}`, payload);
      return res.data as T;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [resource] });
      toast.success(opts?.successMessage ?? "Updated");
    },
    onError: (err) => toast.error(toErr(err)),
  });
}

/** PATCH /api/v1/<resource>/{id}/status?status=NEW */
export function usePatchStatus(resource: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await api.patch(`/api/v1/${resource}/${id}/status`, null, { params: { status } });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [resource] });
      toast.success("Status updated");
    },
    onError: (err) => toast.error(toErr(err)),
  });
}

/** PATCH /api/v1/customers/{id}/status?isActive=<boolean> */
export function usePatchCustomerStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await api.patch(`/api/v1/customers/${id}/status`, null, { params: { isActive } });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Status updated");
    },
    onError: (err) => toast.error(toErr(err)),
  });
}

/** PATCH /api/v1/trips/{id}/status?status=NEW&currentOdometer=... */
export function usePatchTripStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, currentOdometer }: { id: string; status: string; currentOdometer?: number }) => {
      const params: Record<string, string | number> = { status };
      if (currentOdometer !== undefined && currentOdometer !== null && !Number.isNaN(currentOdometer)) {
        params.currentOdometer = currentOdometer;
      }
      const res = await api.patch(`/api/v1/trips/${id}/status`, null, { params });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trips"] });
      toast.success("Status updated");
    },
    onError: (err) => toast.error(toErr(err)),
  });
}


/** DELETE /api/v1/<resource>/{id} */
export function useDelete(resource: string, opts?: { successMessage?: string }) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/v1/${resource}/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [resource] });
      toast.success(opts?.successMessage ?? "Deleted");
    },
    onError: (err) => toast.error(toErr(err)),
  });
}
