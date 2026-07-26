import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { StaffDepartment } from "@/services/staff/staff-departments.service";
import type { StaffShift } from "@/services/staff/staff-shifts.service";

// ── StaffSearch ──────────────────────────────────────────────────────────────

export function StaffSearch({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      <Input
        type="search"
        placeholder="Search by name, email, ID, or phone…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 pr-8"
        aria-label="Search staff"
      />
      {value && (
        <button type="button" onClick={() => onChange("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Clear search">
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

// ── StaffFilters ─────────────────────────────────────────────────────────────

export interface StaffFiltersState {
  status: string;
  departmentId: string;
  shiftId: string;
  sortBy: string;
}

interface StaffFiltersProps {
  departments: StaffDepartment[];
  shifts: StaffShift[];
  filters: StaffFiltersState;
  onChange: (f: StaffFiltersState) => void;
}

export function StaffFilters({ departments, shifts, filters, onChange }: StaffFiltersProps) {
  function set(key: keyof StaffFiltersState, value: string) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Select value={filters.status || "all"} onValueChange={(v) => set("status", v === "all" ? "" : v)}>
        <SelectTrigger className="w-36 text-sm"><SelectValue placeholder="All Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="on_leave">On Leave</SelectItem>
          <SelectItem value="probation">Probation</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
          <SelectItem value="suspended">Suspended</SelectItem>
          <SelectItem value="resigned">Resigned</SelectItem>
          <SelectItem value="terminated">Terminated</SelectItem>
          <SelectItem value="retired">Retired</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.departmentId || "all"} onValueChange={(v) => set("departmentId", v === "all" ? "" : v)}>
        <SelectTrigger className="w-40 text-sm"><SelectValue placeholder="All Departments" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Departments</SelectItem>
          {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={filters.shiftId || "all"} onValueChange={(v) => set("shiftId", v === "all" ? "" : v)}>
        <SelectTrigger className="w-36 text-sm"><SelectValue placeholder="All Shifts" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Shifts</SelectItem>
          {shifts.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={filters.sortBy || "newest"} onValueChange={(v) => set("sortBy", v)}>
        <SelectTrigger className="w-36 text-sm"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest First</SelectItem>
          <SelectItem value="oldest">Oldest First</SelectItem>
          <SelectItem value="name_asc">A → Z</SelectItem>
          <SelectItem value="name_desc">Z → A</SelectItem>
          <SelectItem value="joining_asc">Joining Date ↑</SelectItem>
          <SelectItem value="joining_desc">Joining Date ↓</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
