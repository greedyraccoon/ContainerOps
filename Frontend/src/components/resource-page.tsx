import { useMemo, useState, type ReactNode } from "react";
import { Search, Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PageShell, DataCard } from "./page-shell";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface Props<T> {
  title: string;
  description?: string;
  data: T[];
  columns: Column<T>[];
  searchKeys: (keyof T)[];
  addLabel: string;
  drawerTitle: string;
  drawerDescription?: string;
  renderForm: (close: () => void) => ReactNode;
  getRowKey: (row: T) => string;
  isLoading?: boolean;
  error?: unknown;
  renderEditForm?: (row: T, close: () => void) => ReactNode;
  onDelete?: (row: T) => void;
  canDelete?: boolean;
  deleteDescription?: (row: T) => string;
}

export function ResourcePage<T>({
  title,
  description,
  data,
  columns,
  searchKeys,
  addLabel,
  drawerTitle,
  drawerDescription,
  renderForm,
  getRowKey,
  isLoading,
  error,
  renderEditForm,
  onDelete,
  canDelete,
  deleteDescription,
}: Props<T>) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editRow, setEditRow] = useState<T | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null);

  const hasActions = Boolean(renderEditForm || (onDelete && canDelete));
  const colCount = columns.length + (hasActions ? 1 : 0);

  const filtered = useMemo(() => {
    if (!query.trim()) return data;
    const q = query.toLowerCase();
    return data.filter((row) =>
      searchKeys.some((k) => String(row[k] ?? "").toLowerCase().includes(q)),
    );
  }, [data, query, searchKeys]);

  const errMsg =
    error && typeof error === "object"
      ? ((error as { message?: string }).message ?? "Failed to load")
      : null;

  return (
    <PageShell
      title={title}
      description={description}
      actions={
        <Button onClick={() => setOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-1.5 h-4 w-4" />
          {addLabel}
        </Button>
      }
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="border-slate-200 bg-white pl-9"
          />
        </div>
        <div className="text-xs font-medium text-slate-500">
          {filtered.length} of {data.length} records
        </div>
      </div>

      <DataCard>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/60">
                {columns.map((c) => (
                  <th
                    key={c.key}
                    className={`px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 ${c.className ?? ""}`}
                  >
                    {c.header}
                  </th>
                ))}
                {hasActions && (
                  <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 w-16">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={getRowKey(row)} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                  {columns.map((c) => (
                    <td key={c.key} className={`px-4 py-3 text-slate-700 ${c.className ?? ""}`}>
                      {c.render(row)}
                    </td>
                  ))}
                  {hasActions && (
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-[9rem]">
                          {renderEditForm && (
                            <DropdownMenuItem onClick={() => setEditRow(row)}>
                              <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                            </DropdownMenuItem>
                          )}
                          {onDelete && canDelete && renderEditForm && <DropdownMenuSeparator />}
                          {onDelete && canDelete && (
                            <DropdownMenuItem
                              onClick={() => setDeleteTarget(row)}
                              className="text-red-600 focus:text-red-700"
                            >
                              <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  )}
                </tr>
              ))}
              {isLoading && (
                <tr>
                  <td colSpan={colCount} className="px-4 py-12 text-center text-sm text-slate-500">
                    Loading…
                  </td>
                </tr>
              )}
              {!isLoading && errMsg && (
                <tr>
                  <td colSpan={colCount} className="px-4 py-12 text-center text-sm text-red-600">
                    {errMsg}
                  </td>
                </tr>
              )}
              {!isLoading && !errMsg && filtered.length === 0 && (
                <tr>
                  <td colSpan={colCount} className="px-4 py-12 text-center text-sm text-slate-500">
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </DataCard>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{drawerTitle}</SheetTitle>
            {drawerDescription && <SheetDescription>{drawerDescription}</SheetDescription>}
          </SheetHeader>
          <div className="mt-6 px-4 pb-6">{renderForm(() => setOpen(false))}</div>
        </SheetContent>
      </Sheet>

      <Sheet open={editRow !== null} onOpenChange={(o) => !o && setEditRow(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit {title.replace(/s$/, "").toLowerCase()}</SheetTitle>
            <SheetDescription>Update the fields below and save your changes.</SheetDescription>
          </SheetHeader>
          <div className="mt-6 px-4 pb-6">
            {editRow && renderEditForm && renderEditForm(editRow, () => setEditRow(null))}
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={deleteTarget !== null} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this record?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && deleteDescription
                ? deleteDescription(deleteTarget)
                : "This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (deleteTarget && onDelete) onDelete(deleteTarget);
                setDeleteTarget(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  );
}
