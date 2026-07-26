import { Copy, Loader2, Pencil, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { RoleBadge } from "./RoleBadge";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/ui/input";
import { useRoleMutations, useRoles } from "@/hooks/useRbac";
import type { Role } from "@/services/roles.service";

// ── RoleTable ─────────────────────────────────────────────────────────────────

interface RoleTableProps {
  roles: Role[];
  onEdit: (role: Role) => void;
  onRefetch: () => void;
}

export function RoleTable({ roles, onEdit, onRefetch }: RoleTableProps) {
  const { remove, update, duplicate, isWorking } = useRoleMutations();

  async function handleDelete(role: Role) {
    if (!window.confirm(`Delete role "${role.name}"? This will remove it from all assigned staff.`)) return;
    const result = await remove(role.id);
    if (!result.success) toast.error(result.error.message);
    else { toast.success("Role deleted."); onRefetch(); }
  }

  async function handleToggle(role: Role) {
    const result = await update(role.id, { isActive: !role.isActive });
    if (!result.success) toast.error(result.error.message);
    else { toast.success(`Role ${role.isActive ? "disabled" : "enabled"}.`); onRefetch(); }
  }

  async function handleDuplicate(role: Role) {
    const newName = window.prompt(`Duplicate "${role.name}" as:`, `${role.name} (copy)`);
    if (!newName?.trim()) return;
    const result = await duplicate(role.id, newName.trim());
    if (!result.success) toast.error(result.error.message);
    else { toast.success("Role duplicated."); onRefetch(); }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Role</th>
            <th className="hidden px-4 py-3 text-left text-xs font-medium text-muted-foreground md:table-cell">Description</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Type</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {roles.map((role) => (
            <tr key={role.id} className="group transition-colors hover:bg-muted/30">
              <td className="px-4 py-3">
                <RoleBadge name={role.name} color={role.color} />
              </td>
              <td className="hidden px-4 py-3 text-xs text-muted-foreground md:table-cell">
                {role.description ?? "—"}
              </td>
              <td className="px-4 py-3">
                <span className={`text-xs ${role.isSystem ? "text-muted-foreground" : "text-primary"}`}>
                  {role.isSystem ? "System" : "Custom"}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={`text-xs font-medium ${role.isActive ? "text-green-600" : "text-muted-foreground"}`}>
                  {role.isActive ? "Active" : "Disabled"}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <ActionBtn onClick={() => handleToggle(role)} disabled={isWorking} aria-label={role.isActive ? "Disable" : "Enable"}>
                    {role.isActive ? <ToggleRight className="size-3.5" /> : <ToggleLeft className="size-3.5" />}
                  </ActionBtn>
                  <ActionBtn onClick={() => handleDuplicate(role)} disabled={isWorking} aria-label="Duplicate">
                    <Copy className="size-3.5" />
                  </ActionBtn>
                  <ActionBtn onClick={() => onEdit(role)} disabled={isWorking} aria-label="Edit">
                    <Pencil className="size-3.5" />
                  </ActionBtn>
                  {!role.isSystem && (
                    <ActionBtn
                      onClick={() => handleDelete(role)} disabled={isWorking}
                      aria-label="Delete"
                      className="hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </ActionBtn>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ActionBtn({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors ${className ?? ""}`}
      {...props}
    >
      {children}
    </button>
  );
}

// ── RoleEditor (inline form) ──────────────────────────────────────────────────

interface RoleEditorProps {
  role?: Role | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const COLORS = ["#d4af37", "#7c3aed", "#2563eb", "#16a34a", "#dc2626", "#ea580c", "#0891b2", "#db2777", "#6b7280"];

export function RoleEditor({ role, onSuccess, onCancel }: RoleEditorProps) {
  const { create, update, isWorking } = useRoleMutations();
  const [name, setName] = useState(role?.name ?? "");
  const [description, setDescription] = useState(role?.description ?? "");
  const [color, setColor] = useState(role?.color ?? "#6b7280");

  function makeSlug(n: string) {
    return n.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { toast.error("Role name is required."); return; }

    let result;
    if (role) {
      result = await update(role.id, { name, description: description || null, color });
    } else {
      result = await create({ name, slug: makeSlug(name), description: description || null, color, icon: "shield", priority: 50, displayOrder: 50 });
    }

    if (!result.success) { toast.error(result.error.message); return; }
    toast.success(role ? "Role updated." : "Role created.");
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Role Name *</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Shift Supervisor" maxLength={60} required />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Description</label>
        <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does this role do?" maxLength={200} />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Color</label>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              key={c} type="button"
              onClick={() => setColor(c)}
              className={`size-7 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? "border-foreground scale-110" : "border-transparent"}`}
              style={{ backgroundColor: c }}
              aria-label={`Color ${c}`}
            />
          ))}
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="size-7 cursor-pointer rounded-full border-0 bg-transparent p-0" title="Custom color" />
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="button" variant="outline-gold" onClick={onCancel} className="h-8 px-3 text-xs">Cancel</Button>
        <Button type="submit" variant="gold" disabled={isWorking} className="h-8 gap-1.5 px-3 text-xs">
          {isWorking && <Loader2 className="size-3 animate-spin" />}
          {role ? "Save Changes" : "Create Role"}
        </Button>
      </div>
    </form>
  );
}
