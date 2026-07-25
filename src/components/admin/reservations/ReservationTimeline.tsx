import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

import { ReservationStatusBadge } from "./ReservationStatusBadge";
import type { ReservationItemV2, ReservationStatusValue } from "@/services/reservations.service";

interface ReservationTimelineProps {
  reservations: ReservationItemV2[];
  onSelectReservation: (r: ReservationItemV2) => void;
}

const HOURS = Array.from({ length: 16 }, (_, i) => i + 8); // 8 AM – 11 PM

export function ReservationTimeline({
  reservations,
  onSelectReservation,
}: ReservationTimelineProps) {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const dayRes = reservations
    .filter((r) => r.reservationDate === date)
    .sort((a, b) => a.reservationTime.localeCompare(b.reservationTime));

  function resByHour(h: number) {
    return dayRes.filter((r) => parseInt(r.reservationTime.split(":")[0], 10) === h);
  }

  function advance(dir: 1 | -1) {
    const d = new Date(date);
    d.setDate(d.getDate() + dir);
    setDate(d.toISOString().split("T")[0]);
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const displayDate = new Date(date + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-4">
      {/* Date nav */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => advance(-1)}
          className="grid size-8 place-items-center rounded-md border border-border hover:bg-muted"
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="min-w-[260px] text-center text-sm font-medium">{displayDate}</span>
        <button
          type="button"
          onClick={() => advance(1)}
          className="grid size-8 place-items-center rounded-md border border-border hover:bg-muted"
        >
          <ChevronRight className="size-4" />
        </button>
        {date !== todayStr && (
          <button
            type="button"
            onClick={() => setDate(todayStr)}
            className="ml-2 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            Today
          </button>
        )}
        <div className="ml-auto text-sm text-muted-foreground">
          {dayRes.length} reservation{dayRes.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Timeline grid */}
      <div className="overflow-hidden rounded-xl border border-border">
        {HOURS.map((h) => {
          const hRes = resByHour(h);
          const label = `${h > 12 ? h - 12 : h === 0 ? 12 : h}:00 ${h >= 12 ? "PM" : "AM"}`;
          const hasItems = hRes.length > 0;

          return (
            <div
              key={h}
              className={`flex border-b border-border last:border-b-0 ${hasItems ? "bg-primary/3" : ""}`}
            >
              {/* Hour label */}
              <div className="flex w-20 shrink-0 items-start justify-end py-3 pr-4 text-xs text-muted-foreground">
                {label}
              </div>

              {/* Reservations in this hour */}
              <div className={`flex-1 border-l border-border ${hasItems ? "min-h-[60px]" : "min-h-[40px]"} p-2`}>
                {hasItems ? (
                  <div className="flex flex-wrap gap-2">
                    {hRes.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => onSelectReservation(r)}
                        className="group relative flex flex-col gap-1 rounded-lg border border-border bg-card px-3 py-2 text-left text-xs transition-colors hover:bg-muted hover:shadow-sm min-w-[160px]"
                      >
                        <div className="flex items-center gap-2 justify-between">
                          <span className="font-semibold truncate">{r.customerName}</span>
                          <ReservationStatusBadge status={r.status as ReservationStatusValue} size="sm" />
                        </div>
                        <div className="text-muted-foreground">
                          {fmtTime(r.reservationTime)} · {r.partySize} guest{r.partySize !== 1 ? "s" : ""}
                          {r.tableNumber && ` · ${r.tableNumber}`}
                        </div>
                        {r.specialRequest && (
                          <div className="truncate text-muted-foreground italic">{r.specialRequest}</div>
                        )}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {dayRes.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No reservations for this day.
        </p>
      )}
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
