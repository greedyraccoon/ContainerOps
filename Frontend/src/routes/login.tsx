import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Container, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, type Role } from "@/lib/auth";
import { api } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

const DEMO_PASSWORD = "Password123!";

const roleCreds: { role: Role; label: string; desc: string; email: string; password: string }[] = [
  { role: "ADMIN", label: "Admin", desc: "Full access across all modules", email: "admin@containerops.com", password: DEMO_PASSWORD },
  { role: "MANAGER", label: "Manager", desc: "Fleet, trips, shipments, drivers, customers", email: "manager@containerops.com", password: DEMO_PASSWORD },
  { role: "DISPATCHER", label: "Dispatcher", desc: "Trips, containers, drivers, vehicle dispatch", email: "dispatcher@containerops.com", password: DEMO_PASSWORD },
  { role: "ACCOUNTANT", label: "Accountant", desc: "Invoices, expenses, analytics", email: "accountant@containerops.com", password: DEMO_PASSWORD },
];

function LoginPage() {
  const { role: current, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    if (current) navigate({ to: "/dashboard", replace: true });
  }, [current, navigate]);

  const submitCreds = async (creds: { email: string; password: string }) => {
    setErr(null);
    setLoading(true);
    try {
      const res = await api.post("/api/v1/auth/login", creds);
      const data = res.data ?? {};
      const token: string | undefined = data.token ?? data.accessToken ?? data.jwt;
      const role: Role | undefined =
        (data.role as Role | undefined) ?? (data.user?.role as Role | undefined);
      if (!token) throw new Error("No token in response");
      const matched = roleCreds.find((r) => r.email === creds.email)?.role;
      const resolvedRole: Role = role ?? matched ?? "ADMIN";
      login(resolvedRole, token);
      toast.success(`Signed in as ${resolvedRole}`);
      navigate({ to: "/dashboard", replace: true });
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } }; message?: string })?.response?.data
          ?.message ??
        (e as { message?: string })?.message ??
        "Login failed";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErr("Email and password are required.");
      return;
    }
    void submitCreds({ email, password });
  };

  const autofillAndSubmit = (r: (typeof roleCreds)[number]) => {
    setEmail(r.email);
    setPassword(r.password);
    void submitCreds({ email: r.email, password: r.password });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Container className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-semibold text-slate-900">ContainerOps</div>
            <div className="text-xs text-slate-500">Sign in to your workspace</div>
          </div>
        </div>

        <form ref={formRef} onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@containerops.com"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1"
            />
          </div>
          {err && <p className="text-xs text-red-600">{err}</p>}
          <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Sign In
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Portfolio Demo
          </span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <div className="mb-3 rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
          <ShieldCheck className="mr-1 inline h-3.5 w-3.5" />
          Click a role to autofill credentials and sign in.
        </div>

        <div className="space-y-2">
          {roleCreds.map((r) => (
            <button
              key={r.role}
              type="button"
              disabled={loading}
              onClick={() => autofillAndSubmit(r)}
              className={`flex w-full items-center justify-between rounded-md border px-3 py-2.5 text-left transition-colors disabled:opacity-60 ${
                email === r.email
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div>
                <div className="text-sm font-medium text-slate-900">{r.label}</div>
                <div className="text-xs text-slate-500">{r.desc}</div>
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {r.role}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
