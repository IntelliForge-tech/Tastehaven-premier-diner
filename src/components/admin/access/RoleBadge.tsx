import { cn } from "@/lib/utils";
import type { Role } from "@/services/roles.service";

interface RoleBadgeProps {
  name: string;
  color?: string;
  size?: "sm" | "md";
  className?: string;
}

export function RoleBadge({ name, color = "#6b7280", size = "md", className }: RoleBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium",
        size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs",
        className,
      )}
      style={{
        borderColor: color + "40",
        backgroundColor: color + "15",
        color: color,
      }}
    >
      {name}
    </span>
  );
}

export function RoleBadgeFromRole({ role, size }: { role: Pick<Role, "name" | "color" | "isSystem">; size?: "sm" | "md" }) {
  return (
    <div className="flex items-center gap-1">
      <RoleBadge name={role.name} color={role.color} size={size} />
      {role.isSystem && (
        <span className="text-[10px] text-muted-foreground">system</span>
      )}
    </div>
  );
}
