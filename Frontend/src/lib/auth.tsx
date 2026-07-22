import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";

export type Role = "ADMIN" | "MANAGER" | "DISPATCHER" | "ACCOUNTANT";

interface AuthState {
  role: Role | null;
  token: string | null;
  login: (role: Role, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const r = window.localStorage.getItem("co_role") as Role | null;
    const t = window.localStorage.getItem("jwt_token");
    if (r) setRole(r);
    if (t) setToken(t);
  }, []);

  const login = (r: Role, t: string) => {
    window.localStorage.setItem("co_role", r);
    window.localStorage.setItem("jwt_token", t);
    setRole(r);
    setToken(t);
  };

  const logout = () => {
    window.localStorage.removeItem("co_role");
    window.localStorage.removeItem("jwt_token");
    setRole(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ role, token, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function RequireRole({
  roles,
  children,
}: {
  roles: Role[];
  children: ReactNode;
}) {
  const { role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!role) {
      navigate({ to: "/login" });
    }
  }, [role, navigate]);

  if (!role) return null;
  if (!roles.includes(role)) {
    return (
      <div className="flex flex-1 items-center justify-center p-10">
        <div className="max-w-sm rounded-md border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Access denied</h2>
          <p className="mt-1 text-sm text-slate-500">
            Your role ({role}) does not have permission to view this page.
          </p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
