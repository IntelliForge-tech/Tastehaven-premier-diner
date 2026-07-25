import {
  Calendar,
  Clock,
  Mail,
  Phone,
  Users,
  X,
  Loader2,
  Table,
  Hash,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ReservationStatusBadge } from "./ReservationStatusBadge";
import { ReservationNotesCard } from "./ReservationNotesCard";
import { ReservationHistoryCard } from "./ReservationHistoryCard";
import { Button } from "@/components/common/Button";
import {
  STATUS_LABELS,
  STATUS_TRANSITIONS_V2,
  TERMINAL_STATUSES,
  type ReservationItemV2,
  type ReservationStatusValue,
  updateReservationStatus,
  updateReservationDetail,
} from "@/services/reservations.service";

interface ReservationDetailsDrawerProps {
  reservation: ReservationItemV2;
  adminUserId: string;
  onClose: () => void;
  onRefetch: () => void;
}

export function ReservationDetailsDrawer({
  reservation,
  adminUserId,
  onClose,
  onRefetch,
}: ReservationDetailsDrawerProps) {
  const [isChanging, setIsChanging] = useState(false);
  const [editTable, setEditTable] = useState(reservation.tableNumber ?? "");
  const [editNotes, setEditNotes] = useState(reservation.staffNotes ?? "");
  const [isSavingDetail, setIsSavingDetail] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "notes" | "history">("details");

  const transitions = STATUS_TRANSITIONS_V2[reservation.status as ReservationStatusValue] ?? [];
  const isTerminal = TERMINAL_STATUSES.includes(reservation.status as ReservationStatusValue);

  async function handleStatusChange(newStatus: ReservationStatusValue) {
    if (!window.confirm(`Change status to "${STATUS_LABELS[newStatus]}"?`)) return;
    setIsChanging(true);
    const result = await updateReservationStatus(reservation.id, newStatus);
    setIsChanging(false);
    if (!result.success) {
      toast.error(result.error.message);
    } else {
      toast.success(`Status updated to ${STATUS_LABELS[newStatus]}.`);
      onRefetch();
    }
  }

  async function handleSaveDetail() {
    setIsSavingDetail(true);
    const result = await updateReservationDetail(reservation.id, {
      tableNumber: editTable || null,
      staffNotes: editNotes || null,
    });
    setIsSavingDetail(false);
    if (!result.success) {
      toast.error(result.error.message);
    } else {
      toast.success("Reservation updated.");
      onRefetch();
    }
  }

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col overflow-hidden border-l border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-start gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-semibold">{reservation.customerName}</h2>
              <ReservationStatusBadge status={reservation.status as ReservationStatusValue} />
            </div>
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">{reservation.id}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Quick actions */}
        {!isTerminal && transitions.length > 0 && (
          <div className="shrink-0 border-b border-border bg-muted/30 px-5 py-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Quick Actions</p>
            <div className="flex flex-wrap gap-2">
              {transitions.map((nextStatus) => (
                <Button
                  key={nextStatus}
                  type="button"
                  variant={nextStatus === "cancelled" || nextStatus === "no_show" ? "outline" : "gold"}
                  disabled={isChanging}
                  onClick={() => handleStatusChange(nextStatus)}
                  className={`h-8 px-3 text-xs gap-1.5 ${
                    nextStatus === "cancelled" || nextStatus === "no_show"
                      ? "text-destructive hover:bg-destructive/10"
                      : ""
                  }`}
                >
                  {isChanging && <Loader2 className="size-3 animate-spin" />}
                  {STATUS_LABELS[nextStatus]}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex shrink-0 border-b border-border">
          {(["details", "notes", "history"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 text-xs font-medium capitalize transition-colors ${
                activeTab === tab
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {activeTab === "details" && (
            <div className="space-y-5">
              {/* Core info */}
              <div className="space-y-3">
                <InfoRow icon={<Calendar className="size-3.5" />} label="Date" value={fmt(reservation.reservationDate)} />
                <InfoRow icon={<Clock className="size-3.5" />} label="Time" value={fmtTime(reservation.reservationTime)} />
                <InfoRow icon={<Users className="size-3.5" />} label="Guests" value={`${reservation.partySize} guest${reservation.partySize !== 1 ? "s" : ""}`} />
                <InfoRow icon={<Phone className="size-3.5" />} label="Phone" value={reservation.phone} />
                <InfoRow icon={<Mail className="size-3.5" />} label="Email" value={reservation.email} />
                {reservation.specialRequest && (
                  <InfoRow icon={<Hash className="size-3.5" />} label="Special Request" value={reservation.specialRequest} />
                )}
                <InfoRow icon={<Hash className="size-3.5" />} label="Source" value={reservation.source ?? "website"} />
                <InfoRow
                  icon={<Clock className="size-3.5" />}
                  label="Created"
                  value={new Date(reservation.createdAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                />
              </div>

              {/* Editable fields */}
              <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Staff Details
                </h3>
                <div>
                  <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Table className="size-3" /> Table Number
                  </label>
                  <input
                    value={editTable}
                    onChange={(e) => setEditTable(e.target.value)}
                    placeholder="e.g. Table 4"
                    className="flex h-8 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Staff Notes
                  </label>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Internal notes (not visible to guest)…"
                    rows={3}
                    maxLength={1000}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring resize-none"
                  />
                </div>
                <Button
                  type="button"
                  variant="gold"
                  disabled={isSavingDetail}
                  onClick={handleSaveDetail}
                  className="h-7 gap-1.5 px-3 text-xs"
                >
                  {isSavingDetail && <Loader2 className="size-3 animate-spin" />}
                  Save Details
                </Button>
              </div>
            </div>
          )}

          {activeTab === "notes" && (
            <ReservationNotesCard
              reservationId={reservation.id}
              adminUserId={adminUserId}
            />
          )}

          {activeTab === "history" && (
            <ReservationHistoryCard reservationId={reservation.id} />
          )}
        </div>
      </aside>
    </>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 shrink-0 text-muted-foreground">{icon}</div>
      <div className="min-w-0 flex-1">
        <span className="mr-2 text-xs text-muted-foreground">{label}</span>
        <span className="break-words text-sm font-medium">{value}</span>
      </div>
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
