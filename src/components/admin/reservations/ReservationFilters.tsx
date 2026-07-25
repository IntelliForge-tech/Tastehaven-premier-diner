import { Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/common/Button";
import { STATUS_LABELS, type ReservationFilters, type ReservationStatusValue } from "@/services/reservations.service";

const ALL_STATUSES: ReservationStatusValue[] = [
  "pending", "confirmed", "checked_in", "seated", "completed", "cancelled", "no_show",
];

interface ReservationSearchProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function ReservationSearch({ value, onChange, placeholder = "Search by name, email, phone…" }: ReservationSearchProps) {
  const [local, setLocal] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onChange(local), 300);
    return () => clearTimeout(timer.current);
  }, [local, onChange]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        className="h-9 pl-9 pr-9 text-sm"
      />
      {local && (
        <button
          type="button"
          onClick={() => { setLocal(""); onChange(""); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}

interface ReservationFiltersBarProps {
  filters: ReservationFilters;
  onChange: (f: ReservationFilters) => void;
}

export function ReservationFiltersBar({ filters, onChange }: ReservationFiltersBarProps) {
  const [open, setOpen] = useState(false);
  const hasActive = !!(filters.status && filters.status !== "all") || !!filters.dateFrom || !!filters.dateTo || !!filters.minGuests;

  function update(partial: Partial<ReservationFilters>) {
    onChange({ ...filters, ...partial });
  }

  function reset() {
    onChange({ status: "all" });
    setOpen(false);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant={hasActive ? "gold" : "outline-gold"}
          onClick={() => setOpen((o) => !o)}
          className="h-9 gap-2 px-3 text-sm"
        >
          <SlidersHorizontal className="size-3.5" />
          Filters
          {hasActive && (
            <span className="grid size-4 place-items-center rounded-full bg-white/20 text-[10px] font-bold">
              !
            </span>
          )}
        </Button>

        {/* Status quick-select pills */}
        <div className="flex flex-wrap gap-1.5">
          {["all", ...ALL_STATUSES].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => update({ status: s === "all" ? "all" : (s as ReservationStatusValue) })}
              className={`rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors ${
                (filters.status ?? "all") === s
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              {s === "all" ? "All" : STATUS_LABELS[s as ReservationStatusValue]}
            </button>
          ))}
        </div>

        {hasActive && (
          <button
            type="button"
            onClick={reset}
            className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="size-3" /> Clear
          </button>
        )}
      </div>

      {/* Expanded filters panel */}
      {open && (
        <div className="rounded-xl border border-border bg-card/60 p-4">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Date From
              </label>
              <Input
                type="date"
                value={filters.dateFrom ?? ""}
                onChange={(e) => update({ dateFrom: e.target.value || undefined })}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Date To
              </label>
              <Input
                type="date"
                value={filters.dateTo ?? ""}
                onChange={(e) => update({ dateTo: e.target.value || undefined })}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Min Guests
              </label>
              <Input
                type="number"
                min={1}
                value={filters.minGuests ?? ""}
                onChange={(e) => update({ minGuests: e.target.value ? Number(e.target.value) : undefined })}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Max Guests
              </label>
              <Input
                type="number"
                min={1}
                value={filters.maxGuests ?? ""}
                onChange={(e) => update({ maxGuests: e.target.value ? Number(e.target.value) : undefined })}
                className="h-8 text-sm"
              />
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <Button type="button" variant="outline-gold" onClick={reset} className="h-7 px-3 text-xs">
              Reset
            </Button>
            <Button type="button" variant="gold" onClick={() => setOpen(false)} className="h-7 px-3 text-xs">
              Apply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
