import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Merge, Plus, UtensilsCrossed } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/admin/dashboard/EmptyState";
import { TableCard } from "@/components/admin/tables/TableCard";
import { TableEditor } from "@/components/admin/tables/TableEditor";
import { TableMergeDialog } from "@/components/admin/tables/TableMergeDialog";
import { TableSearch, TableFilters } from "@/components/admin/tables/TableSearch";
import type { TableFiltersState } from "@/components/admin/tables/TableSearch";
import { FloorSelector } from "@/components/admin/floors/FloorSelector";
import { Breadcrumbs } from "@/components/admin/page/Breadcrumbs";
import { PageHeader } from "@/components/admin/page/PageHeader";
import { SectionContainer } from "@/components/admin/page/SectionContainer";
import { Button } from "@/components/common/Button";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useFloors } from "@/hooks/useFloors";
import { useTables } from "@/hooks/useTables";
import { deleteTable } from "@/services/tables.service";
import type { RestaurantTable } from "@/services/tables.service";

export const Route = createFileRoute("/admin/_authenticated/tables/")({
  component: AdminTablesPage,
  head: () => ({
    meta: [{ title: "Tables — Admin — Taste Haven" }],
  }),
});

function AdminTablesPage() {
  const { floors, isLoading: floorsLoading } = useFloors();
  const { tables, isLoading: tablesLoading, error, refetch } = useTables();

  const [selectedFloorId, setSelectedFloorId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<TableFiltersState>({
    floorId: "",
    status: "",
    shape: "",
    minCapacity: "",
  });

  const [addOpen, setAddOpen] = useState(false);
  const [editTable, setEditTable] = useState<RestaurantTable | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RestaurantTable | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [mergeOpen, setMergeOpen] = useState(false);

  // Effective floor filter: tab selector OR dropdown filter
  const effectiveFloorId = selectedFloorId ?? filters.floorId || null;

  const filtered = useMemo(() => {
    let result = tables;

    if (effectiveFloorId) result = result.filter((t) => t.floorId === effectiveFloorId);
    if (filters.status) result = result.filter((t) => t.status === filters.status);
    if (filters.shape) result = result.filter((t) => t.shape === filters.shape);
    if (filters.minCapacity) result = result.filter((t) => t.capacity >= Number(filters.minCapacity));

    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (t) =>
          t.tableNumber.toLowerCase().includes(q) ||
          (t.tableName ?? "").toLowerCase().includes(q) ||
          (t.notes ?? "").toLowerCase().includes(q),
      );
    }

    return result;
  }, [tables, effectiveFloorId, filters, search]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const result = await deleteTable(deleteTarget.id);
    setIsDeleting(false);
    if (!result.success) { toast.error(result.error.message); return; }
    toast.success("Table deleted.");
    setDeleteTarget(null);
    refetch();
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const isLoading = floorsLoading || tablesLoading;

  return (
    <div className="space-y-6">
      <Breadcrumbs page="Tables" />
      <PageHeader
        title="Tables"
        description="Manage all restaurant tables, capacities, shapes, and status."
        action={
          <div className="flex gap-2">
            {selectedIds.size >= 2 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setMergeOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm"
              >
                <Merge className="size-4" />
                Merge ({selectedIds.size})
              </Button>
            )}
            <Button
              type="button"
              variant="gold"
              onClick={() => setAddOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm"
            >
              <Plus className="size-4" />
              Add Table
            </Button>
          </div>
        }
      />

      {/* Floor tab selector */}
      {!floorsLoading && floors.length > 0 && (
        <FloorSelector
          floors={floors}
          selectedId={selectedFloorId}
          onSelect={setSelectedFloorId}
          showAll
        />
      )}

      {/* Search + filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <TableSearch value={search} onChange={setSearch} />
        <TableFilters
          floors={floors}
          filters={filters}
          onChange={setFilters}
        />
      </div>

      {/* Table count + multi-select hint */}
      {!isLoading && !error && (
        <p className="text-xs text-muted-foreground">
          {filtered.length} table{filtered.length !== 1 ? "s" : ""}
          {selectedIds.size > 0 && ` · ${selectedIds.size} selected`}
          {selectedIds.size === 0 && filtered.length > 1 && " · Click cards to select for bulk actions"}
        </p>
      )}

      <SectionContainer>
        {isLoading ? (
          <TableGridSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="grid size-11 place-items-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="size-5" />
            </div>
            <p className="text-sm font-medium">Couldn&apos;t load tables</p>
            <p className="max-w-xs text-sm text-muted-foreground">{error.message}</p>
            <Button type="button" variant="outline-gold" onClick={refetch} className="mt-1 px-4 py-2">
              Try again
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          tables.length === 0 ? (
            <EmptyState
              icon={UtensilsCrossed}
              title="No tables yet."
              description="Add your first table to start managing seating."
              action={
                <Button type="button" variant="gold" onClick={() => setAddOpen(true)} className="inline-flex items-center gap-2 px-5 py-2.5">
                  <Plus className="size-4" />Add Table
                </Button>
              }
            />
          ) : (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No tables match your current filters.
            </p>
          )
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((table) => {
              const floor = floors.find((f) => f.id === table.floorId);
              return (
                <div
                  key={table.id}
                  className={`cursor-pointer rounded-xl outline-2 outline-offset-2 transition-all ${selectedIds.has(table.id) ? "outline outline-primary" : "outline-transparent"}`}
                  onClick={() => toggleSelect(table.id)}
                  role="checkbox"
                  aria-checked={selectedIds.has(table.id)}
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === " ") { e.preventDefault(); toggleSelect(table.id); } }}
                >
                  <TableCard
                    table={table}
                    floor={floor}
                    onEdit={(t) => { e: void 0; setEditTable(t); }}
                    onDelete={(t) => setDeleteTarget(t)}
                    onStatusChange={refetch}
                  />
                </div>
              );
            })}
          </div>
        )}
      </SectionContainer>

      {/* Add dialog */}
      <Dialog open={addOpen} onOpenChange={(o) => { if (!o) setAddOpen(false); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add Table</DialogTitle></DialogHeader>
          <TableEditor
            floors={floors}
            defaultFloorId={effectiveFloorId ?? undefined}
            onSuccess={() => { setAddOpen(false); refetch(); }}
            onCancel={() => setAddOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editTable} onOpenChange={(o) => { if (!o) setEditTable(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit Table {editTable?.tableNumber}</DialogTitle></DialogHeader>
          {editTable && (
            <TableEditor
              floors={floors}
              table={editTable}
              onSuccess={() => { setEditTable(null); refetch(); }}
              onCancel={() => setEditTable(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o && !isDeleting) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Table {deleteTarget?.tableNumber}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes the table and all its assignment history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete Table
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Merge dialog */}
      <TableMergeDialog
        open={mergeOpen}
        tables={tables}
        selectedIds={[...selectedIds]}
        onClose={() => setMergeOpen(false)}
        onSuccess={() => { setSelectedIds(new Set()); refetch(); }}
      />
    </div>
  );
}

function TableGridSkeleton() {
  return (
    <div className="grid animate-pulse grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-muted" />
            <div className="h-4 w-24 rounded bg-muted" />
          </div>
          <div className="h-5 w-20 rounded-full bg-muted" />
          <div className="h-3 w-full rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}
