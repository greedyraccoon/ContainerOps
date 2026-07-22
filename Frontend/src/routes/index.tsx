import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!role) {
      navigate({ to: "/login", replace: true });
    } else {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [role, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
      Loading ContainerOps…
    </div>
  );
}
