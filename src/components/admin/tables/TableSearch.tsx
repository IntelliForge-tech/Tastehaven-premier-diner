import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Floor } from "@/services/floors.service";
import type { TableShape, TableStatus } from "@/services/tables.service";

// ── TableSearch ──────────────────────────────────────────────────────────────

interface TableSearchProps {
  value: string;
  onChange: (v: string) => void;
}

export function TableSearch({ value, onChange }: TableSearchProps) {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      <Input
        type="search"
        placeholder="Search by table number, name, or notes…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 pr-8"
        aria-label="Search tables"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

// ── TableFilters ─────────────────────────────────────────────────────────────

export interface TableFiltersState {
  floorId: string;
  status: string;
  shape: string;
  minCapacity: string;
}

interface TableFiltersProps {
  floors: Floor[];
  filters: TableFiltersState;
  onChange: (filters: TableFiltersState) => void;
}

export function TableFilters({ floors, filters, onChange }: TableFiltersProps) {
  function set(key: keyof TableFiltersState, value: string) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Select value={filters.floorId || "all"} onValueChange={(v) => set("floorId", v === "all" ? "" : v)}>
        <SelectTrigger className="w-40 text-sm" aria-label="Filter by floor">
          <SelectValue placeholder="All Floors" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Floors</SelectItem>
          {floors.map((f) => (
            <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.status || "all"} onValueChange={(v) => set("status", v === "all" ? "" : v)}>
        <SelectTrigger className="w-40 text-sm" aria-label="Filter by status">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="available">Available</SelectItem>
          <SelectItem value="reserved">Reserved</SelectItem>
          <SelectItem value="occupied">Occupied</SelectItem>
          <SelectItem value="cleaning">Cleaning</SelectItem>
          <SelectItem value="maintenance">Maintenance</SelectItem>
          <SelectItem value="disabled">Disabled</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.shape || "all"} onValueChange={(v) => set("shape", v === "all" ? "" : v)}>
        <SelectTrigger className="w-36 text-sm" aria-label="Filter by shape">
          <SelectValue placeholder="Any Shape" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Any Shape</SelectItem>
          <SelectItem value="square">Square</SelectItem>
          <SelectItem value="rectangle">Rectangle</SelectItem>
          <SelectItem value="circle">Circle</SelectItem>
          <SelectItem value="oval">Oval</SelectItem>
          <SelectItem value="booth">Booth</SelectItem>
          <SelectItem value="custom">Custom</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.minCapacity || "any"} onValueChange={(v) => set("minCapacity", v === "any" ? "" : v)}>
        <SelectTrigger className="w-36 text-sm" aria-label="Filter by capacity">
          <SelectValue placeholder="Any Capacity" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">Any Capacity</SelectItem>
          <SelectItem value="2">2+ seats</SelectItem>
          <SelectItem value="4">4+ seats</SelectItem>
          <SelectItem value="6">6+ seats</SelectItem>
          <SelectItem value="8">8+ seats</SelectItem>
          <SelectItem value="10">10+ seats</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
