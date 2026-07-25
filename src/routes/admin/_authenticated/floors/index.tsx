import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, LayoutTemplate, Plus } from "lucide-react";
import { useState } from "react";

import { EmptyState } from "@/components/admin/dashboard/EmptyState";
import { FloorEditor } from "@/components/admin/floors/FloorEditor";
import { FloorCanvas } from "@/components/admin/floors/FloorCanvas";
import { FloorSelector } from "@/components/admin/floors/FloorSelector";
import { TableEditor } from "@/components/admin/tables/TableEditor";
import { Breadcrumbs } from "@/components/admin/page/Breadcrumbs";
import { PageHeader } from "@/components/admin/page/PageHeader";
import { SectionContainer } from "@/components/admin/page/SectionContainer";
import { Button } from "@/components/common/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useFloors } from "@/hooks/useFloors";
import { useTables } from "@/hooks/useTables";
import type { RestaurantTable } from "@/services/tables.service";

export const Route = createFileRoute("/admin/_authenticated/floors/")({
  component: AdminFloorsPage,
  head: () => ({
    meta: [{ title: "Floor Plans — Admin — Taste Haven" }],
  }),
});

function AdminFloorsPage() {
  const { floors, isLoading: floorsLoading, error: floorsError, refetch: refetchFloors } = useFloors();
  const [selectedFloorId, setSelectedFloorId] = useState<string | null>(null);
  const activeFloorId = selectedFloorId ?? floors[0]?.id ?? null;

  const { tables, isLoading: tablesLoading, refetch: refetchTables } = useTables(activeFloorId ?? undefined);
  const [addTableOpen, setAddTableOpen] = useState(false);
  const [editTable, setEditTable] = useState<RestaurantTable | null>(null);
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);

  function handleRefetchAll() {
    refetchFloors();
    refetchTables();
  }

  if (floorsLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs page="Floor Plans" />
        <PageHeader title="Floor Plans" description="Manage dining areas and interactive floor layouts." />
        <FloorPlanSkeleton />
      </div>
    );
  }

  if (floorsError) {
    return (
      <div className="space-y-6">
        <Breadcrumbs page="Floor Plans" />
        <PageHeader title="Floor Plans" description="Manage dining areas and interactive floor layouts." />
        <SectionContainer>
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="grid size-11 place-items-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="size-5" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium">Couldn&apos;t load floors</p>
            <p className="max-w-xs text-sm text-muted-foreground">{floorsError.message}</p>
            <Button type="button" variant="outline-gold" onClick={refetchFloors} className="mt-1 px-4 py-2">
              Try again
            </Button>
          </div>
        </SectionContainer>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs page="Floor Plans" />
      <PageHeader
        title="Floor Plans"
        description="Manage dining areas, drag tables to reposition, and edit the interactive floor layout."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
        {/* Left panel — Floor list + editor */}
        <div className="space-y-4">
          <SectionContainer>
            <FloorEditor floors={floors} onRefetch={refetchFloors} />
          </SectionContainer>
        </div>

        {/* Right panel — Canvas */}
        <div className="space-y-4">
          {floors.length === 0 ? (
            <SectionContainer>
              <EmptyState
                icon={LayoutTemplate}
                title="No floors yet."
                description="Create your first dining floor to start placing tables."
              />
            </SectionContainer>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <FloorSelector
                  floors={floors}
                  selectedId={activeFloorId}
                  onSelect={(id) => setSelectedFloorId(id)}
                  showAll={false}
                />
                <Button
                  type="button"
                  variant="gold"
                  disabled={!activeFloorId}
                  onClick={() => setAddTableOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm"
                >
                  <Plus className="size-4" aria-hidden="true" />
                  Add Table
                </Button>
              </div>

              <SectionContainer className="overflow-hidden p-0">
                {tablesLoading ? (
                  <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                    Loading tables…
                  </div>
                ) : (
                  <div className="p-4">
                    <FloorCanvas
                      tables={tables}
                      onSelect={(t) => setSelectedTable(t)}
                      onRefetch={refetchTables}
                      readOnly={false}
                    />
                  </div>
                )}
              </SectionContainer>
            </>
          )}
        </div>
      </div>

      {/* Add table dialog */}
      <Dialog open={addTableOpen} onOpenChange={(o) => { if (!o) setAddTableOpen(false); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Table</DialogTitle>
          </DialogHeader>
          <TableEditor
            floors={floors}
            defaultFloorId={activeFloorId ?? undefined}
            onSuccess={() => { setAddTableOpen(false); refetchTables(); }}
            onCancel={() => setAddTableOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit table dialog */}
      <Dialog open={!!editTable} onOpenChange={(o) => { if (!o) setEditTable(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Table {editTable?.tableNumber}</DialogTitle>
          </DialogHeader>
          {editTable && (
            <TableEditor
              floors={floors}
              table={editTable}
              onSuccess={() => { setEditTable(null); refetchTables(); }}
              onCancel={() => setEditTable(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Table detail panel */}
      {selectedTable && (
        <TableDetailPanel
          table={selectedTable}
          floors={floors}
          onClose={() => setSelectedTable(null)}
          onEdit={(t) => { setSelectedTable(null); setEditTable(t); }}
        />
      )}
    </div>
  );
}

// ── Table detail side panel (inline) ────────────────────────────────────────

import { X } from "lucide-react";
import { TableStatusBadge } from "@/components/admin/tables/TableStatusBadge";
import { TableCapacityBadge } from "@/components/admin/tables/TableCapacityBadge";
import type { Floor } from "@/services/floors.service";

interface TableDetailPanelProps {
  table: RestaurantTable;
  floors: Floor[];
  onClose: () => void;
  onEdit: (table: RestaurantTable) => void;
}

function TableDetailPanel({ table, floors, onClose, onEdit }: TableDetailPanelProps) {
  const floor = floors.find((f) => f.id === table.floorId);

  return (
    <div
      className="fixed bottom-4 right-4 z-40 w-72 rounded-2xl border border-border bg-card shadow-2xl"
      role="dialog"
      aria-label={`Table ${table.tableNumber} details`}
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="font-display text-base font-semibold">
          Table {table.tableNumber}
          {table.tableName && <span className="ml-1.5 text-sm text-muted-foreground">· {table.tableName}</span>}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="grid size-7 place-items-center rounded-full text-muted-foreground hover:bg-muted"
          aria-label="Close"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex flex-wrap gap-2">
          <TableStatusBadge status={table.status} />
          <TableCapacityBadge capacity={table.capacity} minGuests={table.minGuests} maxGuests={table.maxGuests} />
        </div>

        <div className="space-y-1.5 text-sm">
          {floor && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Floor</span>
              <span className="font-medium">{floor.name}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shape</span>
            <span className="font-medium capitalize">{table.shape}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Position</span>
            <span className="font-medium">({table.positionX}, {table.positionY})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Rotation</span>
            <span className="font-medium">{table.rotation}°</span>
          </div>
        </div>

        {table.notes && (
          <p className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">{table.notes}</p>
        )}

        <Button
          type="button"
          variant="outline"
          onClick={() => onEdit(table)}
          className="w-full px-4 py-2 text-sm"
        >
          Edit Table
        </Button>
      </div>
    </div>
  );
}

// ── Skeleton ─────────────────────────────────────────────────────────────────

function FloorPlanSkeleton() {
  return (
    <div className="grid animate-pulse grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
      <div className="space-y-3 rounded-2xl border border-border bg-card p-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 rounded-lg bg-muted" />
        ))}
      </div>
      <div className="h-[560px] rounded-2xl border border-border bg-muted" />
    </div>
  );
}
