import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function PageShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-5">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h1>
          {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </header>
      <div className="flex-1 overflow-auto p-8">{children}</div>
    </div>
  );
}

export function DataCard({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      {children}
    </div>
  );
}

export type Tone = "green" | "blue" | "amber" | "red" | "slate";

const toneMap: Record<Tone, string> = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  blue: "bg-blue-50 text-blue-700 ring-blue-600/20",
  amber: "bg-amber-50 text-amber-700 ring-amber-600/20",
  red: "bg-red-50 text-red-700 ring-red-600/20",
  slate: "bg-slate-100 text-slate-700 ring-slate-500/20",
};

export function StatusBadge({ status, tone }: { status: string; tone: Tone }) {
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${toneMap[tone]}`}
    >
      {status}
    </span>
  );
}

export function StatusDropdown({
  value,
  tone,
  options,
  onChange,
  disabled,
}: {
  value: string;
  tone: Tone;
  options: readonly string[];
  onChange: (next: string) => void;
  disabled?: boolean;
}) {
  const label = value.replace(/_/g, " ");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled}
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
      >
        <span
          className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium ring-1 ring-inset transition hover:brightness-95 ${toneMap[tone]}`}
        >
          {label}
          <ChevronDown className="h-3 w-3 opacity-60" />
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[10rem]">
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt}
            onClick={() => opt !== value && onChange(opt)}
            className={opt === value ? "font-semibold text-blue-600" : ""}
          >
            {opt.replace(/_/g, " ")}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
