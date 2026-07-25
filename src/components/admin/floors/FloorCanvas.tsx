import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

import { STATUS_CONFIG } from "@/components/admin/tables/TableStatusBadge";
import { updateTablePosition } from "@/services/tables.service";
import type { RestaurantTable } from "@/services/tables.service";

const GRID_SIZE = 20;
const TABLE_W = 80;
const TABLE_H = 60;

function snap(v: number) {
  return Math.round(v / GRID_SIZE) * GRID_SIZE;
}

interface FloorCanvasProps {
  tables: RestaurantTable[];
  onSelect: (table: RestaurantTable) => void;
  onRefetch: () => void;
  readOnly?: boolean;
}

const SHAPE_RADIUS: Record<RestaurantTable["shape"], string> = {
  square: "rounded-md",
  rectangle: "rounded-md",
  circle: "rounded-full",
  oval: "rounded-full",
  booth: "rounded-t-full rounded-b-none",
  custom: "rounded-lg",
};

export function FloorCanvas({ tables, onSelect, onRefetch, readOnly = false }: FloorCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  const dragOffset = useRef({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const getPosition = useCallback((table: RestaurantTable) => {
    const override = positions[table.id];
    return { x: override?.x ?? table.positionX, y: override?.y ?? table.positionY };
  }, [positions]);

  function handleDragStart(e: React.DragEvent, table: RestaurantTable) {
    if (readOnly) return;
    e.dataTransfer.effectAllowed = "move";
    setDraggingId(table.id);
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    if (!draggingId || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const rawX = (e.clientX - rect.left) / zoom - dragOffset.current.x;
    const rawY = (e.clientY - rect.top) / zoom - dragOffset.current.y;
    const x = Math.max(0, snap(rawX));
    const y = Math.max(0, snap(rawY));

    setPositions((prev) => ({ ...prev, [draggingId]: { x, y } }));
    setDraggingId(null);
  }

  async function handleSaveLayout() {
    const toSave = Object.entries(positions);
    if (toSave.length === 0) { toast.info("No position changes to save."); return; }

    const results = await Promise.all(
      toSave.map(([id, pos]) => {
        const table = tables.find((t) => t.id === id);
        return updateTablePosition(id, pos.x, pos.y, table?.rotation ?? 0);
      }),
    );

    const failed = results.filter((r) => !r.success);
    if (failed.length > 0) {
      toast.error("Some positions couldn't be saved. Please try again.");
    } else {
      toast.success("Floor layout saved.");
      setPositions({});
      onRefetch();
    }
  }

  function handleReset() {
    setPositions({});
  }

  const hasPendingChanges = Object.keys(positions).length > 0;

  return (
    <div className="space-y-3">
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full border border-border bg-muted/40 p-1">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
              className="grid size-7 place-items-center rounded-full text-sm text-muted-foreground hover:bg-background hover:text-foreground"
              aria-label="Zoom out"
            >
              −
            </button>
            <span className="w-10 text-center text-xs text-muted-foreground">{Math.round(zoom * 100)}%</span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
              className="grid size-7 place-items-center rounded-full text-sm text-muted-foreground hover:bg-background hover:text-foreground"
              aria-label="Zoom in"
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={() => setZoom(1)}
            className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:bg-muted"
          >
            Reset Zoom
          </button>
          {hasPendingChanges && (
            <>
              <button
                type="button"
                onClick={handleReset}
                className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:bg-muted"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handleSaveLayout}
                className="rounded-full border border-primary bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20"
              >
                Save Layout
              </button>
            </>
          )}
          <p className="ml-2 text-xs text-muted-foreground">
            {readOnly ? "Read-only view." : "Drag tables to reposition. Click a table to view details."}
          </p>
        </div>
      )}

      <div
        ref={canvasRef}
        className="relative overflow-auto rounded-xl border border-border bg-muted/20"
        style={{ height: 560, cursor: readOnly ? "default" : "crosshair" }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        role="region"
        aria-label="Floor plan canvas"
      >
        {/* Grid lines */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
            `,
            backgroundSize: `${GRID_SIZE * zoom}px ${GRID_SIZE * zoom}px`,
          }}
          aria-hidden="true"
        />

        {/* Tables */}
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "top left",
            position: "relative",
            width: `${100 / zoom}%`,
            height: `${100 / zoom}%`,
          }}
        >
          {tables.filter((t) => t.isActive).map((table) => {
            const { x, y } = getPosition(table);
            const statusCfg = STATUS_CONFIG[table.status];
            const isDragging = draggingId === table.id;

            return (
              <div
                key={table.id}
                draggable={!readOnly}
                onDragStart={(e) => handleDragStart(e, table)}
                onClick={() => onSelect(table)}
                role="button"
                tabIndex={0}
                aria-label={`Table ${table.tableNumber}, ${table.status}, ${table.capacity} seats`}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(table); } }}
                style={{
                  position: "absolute",
                  left: x,
                  top: y,
                  width: TABLE_W,
                  height:
                    table.shape === "rectangle" ? TABLE_H * 1.4
                    : table.shape === "circle" || table.shape === "oval" ? TABLE_H
                    : TABLE_H,
                  transform: `rotate(${table.rotation}deg)`,
                  opacity: isDragging ? 0.4 : 1,
                  cursor: readOnly ? "pointer" : "grab",
                  zIndex: isDragging ? 10 : 1,
                }}
                className={[
                  "flex flex-col items-center justify-center border-2 shadow-sm transition-opacity select-none",
                  SHAPE_RADIUS[table.shape],
                  statusCfg.dot === "bg-emerald-500" ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20" :
                  statusCfg.dot === "bg-blue-500" ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20" :
                  statusCfg.dot === "bg-red-500" ? "border-red-400 bg-red-50 dark:bg-red-900/20" :
                  statusCfg.dot === "bg-yellow-500" ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20" :
                  statusCfg.dot === "bg-orange-500" ? "border-orange-400 bg-orange-50 dark:bg-orange-900/20" :
                  "border-border bg-muted",
                ].join(" ")}
              >
                <span className="text-[11px] font-bold leading-none text-foreground">
                  {table.tableNumber}
                </span>
                <span className="mt-0.5 text-[9px] leading-none text-muted-foreground">
                  {table.capacity} seats
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
