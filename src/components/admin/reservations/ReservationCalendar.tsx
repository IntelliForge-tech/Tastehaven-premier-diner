import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

import { ReservationStatusBadge } from "./ReservationStatusBadge";
import { Button } from "@/components/common/Button";
import type { ReservationItemV2, ReservationStatusValue } from "@/services/reservations.service";

interface ReservationCalendarProps {
  reservations: ReservationItemV2[];
  onSelectReservation: (r: ReservationItemV2) => void;
}

type CalendarView = "month" | "week" | "day";

export function ReservationCalendar({
  reservations,
  onSelectReservation,
}: ReservationCalendarProps) {
  const [view, setView] = useState<CalendarView>("month");
  const [cursor, setCursor] = useState(new Date());

  // ── Navigation ────────────────────────────────────────────────────────
  function advance(dir: 1 | -1) {
    const d = new Date(cursor);
    if (view === "month") d.setMonth(d.getMonth() + dir);
    else if (view === "week") d.setDate(d.getDate() + 7 * dir);
    else d.setDate(d.getDate() + dir);
    setCursor(d);
  }

  // ── Helper: reservations for a given YYYY-MM-DD ───────────────────────
  function resByDate(dateStr: string) {
    return reservations.filter((r) => r.reservationDate === dateStr);
  }

  // ── Month grid ────────────────────────────────────────────────────────
  function renderMonth() {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayStr = new Date().toISOString().split("T")[0];

    const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
    const weeks: (number | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7).concat(Array(7 - (cells.slice(i, i + 7).length)).fill(null)));
    }

    return (
      <div className="overflow-hidden rounded-xl border border-border">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-border bg-muted/30">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="py-2 text-center text-xs font-medium text-muted-foreground">
              {d}
            </div>
          ))}
        </div>

        {/* Weeks */}
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 divide-x divide-border border-b border-border last:border-b-0">
            {week.map((day, di) => {
              if (!day) return <div key={di} className="min-h-[80px] bg-muted/10 p-1" />;
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const dayRes = resByDate(dateStr);
              const isToday = dateStr === todayStr;

              return (
                <div key={di} className={`min-h-[80px] p-1 ${isToday ? "bg-primary/5" : ""}`}>
                  <div className={`mb-1 flex size-6 items-center justify-center rounded-full text-xs font-medium ${isToday ? "bg-primary text-primary-foreground" : ""}`}>
                    {day}
                  </div>
                  <div className="space-y-0.5">
                    {dayRes.slice(0, 3).map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => onSelectReservation(r)}
                        className="flex w-full items-center gap-1 truncate rounded px-1 py-0.5 text-left text-[10px] hover:bg-muted"
                      >
                        <span className="truncate font-medium">{r.customerName.split(" ")[0]}</span>
                        <ReservationStatusBadge status={r.status as ReservationStatusValue} size="sm" />
                      </button>
                    ))}
                    {dayRes.length > 3 && (
                      <p className="px-1 text-[10px] text-muted-foreground">+{dayRes.length - 3} more</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  // ── Week view ─────────────────────────────────────────────────────────
  function renderWeek() {
    const startOfWeek = new Date(cursor);
    startOfWeek.setDate(cursor.getDate() - cursor.getDay());
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      return d;
    });
    const todayStr = new Date().toISOString().split("T")[0];

    return (
      <div className="overflow-hidden rounded-xl border border-border">
        <div className="grid grid-cols-7 divide-x divide-border">
          {days.map((d) => {
            const dateStr = d.toISOString().split("T")[0];
            const dayRes = resByDate(dateStr).sort((a, b) => a.reservationTime.localeCompare(b.reservationTime));
            const isToday = dateStr === todayStr;

            return (
              <div key={dateStr} className={`min-h-[200px] ${isToday ? "bg-primary/5" : ""}`}>
                <div className={`border-b border-border p-2 text-center ${isToday ? "bg-primary/10" : "bg-muted/30"}`}>
                  <div className="text-xs text-muted-foreground">{d.toLocaleDateString("en-US", { weekday: "short" })}</div>
                  <div className={`text-lg font-bold ${isToday ? "text-primary" : ""}`}>{d.getDate()}</div>
                </div>
                <div className="space-y-1 p-1">
                  {dayRes.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => onSelectReservation(r)}
                      className="w-full rounded-md border border-border bg-card p-1.5 text-left text-xs hover:bg-muted transition-colors"
                    >
                      <div className="font-medium truncate">{r.customerName}</div>
                      <div className="text-muted-foreground">{fmtTime(r.reservationTime)} · {r.partySize}p</div>
                      <ReservationStatusBadge status={r.status as ReservationStatusValue} size="sm" />
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Day view ──────────────────────────────────────────────────────────
  function renderDay() {
    const dateStr = cursor.toISOString().split("T")[0];
    const dayRes = resByDate(dateStr).sort((a, b) => a.reservationTime.localeCompare(b.reservationTime));
    const hours = Array.from({ length: 16 }, (_, i) => i + 8); // 8 AM – 11 PM

    const resByHour = (hour: number) =>
      dayRes.filter((r) => {
        const h = parseInt(r.reservationTime.split(":")[0], 10);
        return h === hour;
      });

    return (
      <div className="overflow-hidden rounded-xl border border-border">
        {hours.map((h) => {
          const hRes = resByHour(h);
          const label = `${h > 12 ? h - 12 : h === 0 ? 12 : h}:00 ${h >= 12 ? "PM" : "AM"}`;
          return (
            <div key={h} className="flex items-start border-b border-border last:border-b-0">
              <div className="w-20 shrink-0 py-3 pr-3 text-right text-xs text-muted-foreground">
                {label}
              </div>
              <div className={`flex-1 min-h-[48px] border-l border-border p-2 ${hRes.length ? "bg-primary/5" : ""}`}>
                <div className="flex flex-wrap gap-2">
                  {hRes.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => onSelectReservation(r)}
                      className="rounded-lg border border-border bg-card px-3 py-2 text-left text-xs hover:bg-muted transition-colors"
                    >
                      <div className="font-medium">{r.customerName}</div>
                      <div className="text-muted-foreground">{fmtTime(r.reservationTime)} · {r.partySize} guests</div>
                      <ReservationStatusBadge status={r.status as ReservationStatusValue} size="sm" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ── Title ─────────────────────────────────────────────────────────────
  function title() {
    if (view === "month") {
      return cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    }
    if (view === "week") {
      const start = new Date(cursor);
      start.setDate(cursor.getDate() - cursor.getDay());
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    }
    return cursor.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => advance(-1)} className="grid size-8 place-items-center rounded-md border border-border hover:bg-muted">
            <ChevronLeft className="size-4" />
          </button>
          <span className="min-w-[200px] px-3 text-center text-sm font-medium">{title()}</span>
          <button type="button" onClick={() => advance(1)} className="grid size-8 place-items-center rounded-md border border-border hover:bg-muted">
            <ChevronRight className="size-4" />
          </button>
        </div>

        <Button type="button" variant="outline-gold" onClick={() => setCursor(new Date())} className="h-8 px-3 text-xs">
          Today
        </Button>

        <div className="ml-auto flex overflow-hidden rounded-lg border border-border">
          {(["month", "week", "day"] as CalendarView[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`px-3 py-1.5 text-xs capitalize transition-colors ${
                view === v ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar grid */}
      {view === "month" && renderMonth()}
      {view === "week" && renderWeek()}
      {view === "day" && renderDay()}
    </div>
  );
}

function fmtTime(t: string): string {
  const [hStr, mStr] = t.split(":");
  const h = parseInt(hStr, 10);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${mStr ?? "00"} ${suffix}`;
}
