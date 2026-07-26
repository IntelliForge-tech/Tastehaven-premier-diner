import { Calendar, Mail, MapPin, Phone, Shield, User } from "lucide-react";

import { EmployeeStatusBadge } from "@/components/admin/staff/EmployeeStatusBadge";
import { StaffAvatar } from "@/components/admin/staff/StaffAvatar";
import { Card } from "@/components/common/Card";
import type { StaffMember } from "@/services/staff/staff.service";

interface StaffProfileCardProps {
  member: StaffMember;
}

export function StaffProfileCard({ member: m }: StaffProfileCardProps) {
  const fullAddress = [m.address, m.city, m.country].filter(Boolean).join(", ");

  const yearsServed = Math.floor(
    (Date.now() - new Date(m.joiningDate).getTime()) / (1000 * 60 * 60 * 24 * 365),
  );

  return (
    <Card className="overflow-hidden">
      {/* Header banner */}
      <div className="h-20 bg-gradient-to-r from-primary/20 to-primary/5" aria-hidden="true" />

      <div className="-mt-10 px-5 pb-5">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
          <StaffAvatar
            firstName={m.firstName}
            lastName={m.lastName}
            photoUrl={m.profilePhotoUrl}
            size="xl"
            className="ring-4 ring-background"
          />
          <EmployeeStatusBadge status={m.employmentStatus} />
        </div>

        <div className="mt-3">
          <h2 className="font-display text-xl font-semibold text-foreground">
            {m.firstName} {m.lastName}
          </h2>
          {m.designationTitle && (
            <p className="text-sm text-muted-foreground">{m.designationTitle}</p>
          )}
          {m.departmentName && (
            <p className="text-xs text-muted-foreground">{m.departmentName}</p>
          )}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <InfoRow icon={<User className="size-3.5" />} label="Employee ID" value={m.employeeId} />
          <InfoRow icon={<Mail className="size-3.5" />} label="Email" value={m.email} />
          {m.phone && <InfoRow icon={<Phone className="size-3.5" />} label="Phone" value={m.phone} />}
          {fullAddress && <InfoRow icon={<MapPin className="size-3.5" />} label="Address" value={fullAddress} />}
          <InfoRow
            icon={<Calendar className="size-3.5" />}
            label="Joined"
            value={`${new Date(m.joiningDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} (${yearsServed}yr${yearsServed !== 1 ? "s" : ""})`}
          />
          {m.shiftName && <InfoRow icon={<Shield className="size-3.5" />} label="Shift" value={m.shiftName} />}
        </div>

        {m.emergencyContact && (
          <div className="mt-4 rounded-lg border border-border bg-muted/30 px-4 py-3">
            <p className="text-xs font-medium text-muted-foreground">Emergency Contact</p>
            <p className="text-sm font-medium text-foreground">{m.emergencyContact}</p>
            {m.emergencyPhone && <p className="text-xs text-muted-foreground">{m.emergencyPhone}</p>}
          </div>
        )}
      </div>
    </Card>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 shrink-0 text-muted-foreground">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="break-words text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
