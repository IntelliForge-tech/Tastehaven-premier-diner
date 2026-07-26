import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { EmployeeStatusBadge } from "@/components/admin/staff/EmployeeStatusBadge";
import { StaffAvatar } from "@/components/admin/staff/StaffAvatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { StaffMember, EmploymentStatus } from "@/services/staff/staff.service";

const STATUS_ACTIONS: Array<{ status: EmploymentStatus; label: string }> = [
  { status: "active", label: "Set Active" },
  { status: "on_leave", label: "Set On Leave" },
  { status: "suspended", label: "Suspend" },
  { status: "inactive", label: "Deactivate" },
];

interface StaffTableProps {
  staff: StaffMember[];
  onEdit: (member: StaffMember) => void;
  onDelete: (member: StaffMember) => void;
  onStatusChange: (id: string, status: EmploymentStatus) => void;
}

export function StaffTable({ staff, onEdit, onDelete, onStatusChange }: StaffTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[700px] text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Employee</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">ID</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Department</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Designation</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Joined</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground w-10" aria-label="Actions" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {staff.map((member) => (
            <tr key={member.id} className="bg-card hover:bg-muted/20 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <StaffAvatar firstName={member.firstName} lastName={member.lastName} photoUrl={member.profilePhotoUrl} size="sm" />
                  <div>
                    <p className="font-medium text-foreground">{member.firstName} {member.lastName}</p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{member.employeeId}</td>
              <td className="px-4 py-3 text-muted-foreground">{member.departmentName ?? "—"}</td>
              <td className="px-4 py-3 text-muted-foreground">{member.designationTitle ?? "—"}</td>
              <td className="px-4 py-3">
                <EmployeeStatusBadge status={member.employmentStatus} />
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {new Date(member.joiningDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </td>
              <td className="px-4 py-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="grid size-7 place-items-center rounded-md border border-border text-muted-foreground hover:bg-muted" aria-label={`Actions for ${member.firstName}`}>
                      <MoreHorizontal className="size-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link to="/admin/staff/$staffId" params={{ staffId: member.id }} className="flex items-center gap-2">
                        <Eye className="size-3.5" />View Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(member)}>
                      <Pencil className="mr-2 size-3.5" />Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {STATUS_ACTIONS.filter((a) => a.status !== member.employmentStatus).map((a) => (
                      <DropdownMenuItem key={a.status} onClick={() => onStatusChange(member.id, a.status)}>
                        {a.label}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onDelete(member)} className="text-destructive focus:text-destructive">
                      <Trash2 className="mr-2 size-3.5" />Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
