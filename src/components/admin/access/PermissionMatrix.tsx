import { Check, Loader2, RotateCcw, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { RoleBadge } from "./RoleBadge";
import { Button } from "@/components/common/Button";
import { usePermissionsData, useRoles, useRolePermissions, useSetRolePermissions } from "@/hooks/useRbac";
import { useAuth } from "@/hooks/useAuth";

/**
 * Full role × permission matrix.
 * Rows = permission groups + their permissions.
 * Columns = roles.
 * Each cell is a checkbox. Saving bulk-replaces all permissions for the selected role.
 */
export function PermissionMatrix() {
  const { roles, isLoading: rolesLoading } = useRoles();
  const { groups, permissions, isLoading: permsLoading } = usePermissionsData();
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const { slugs: grantedSlugs, ids: permIdMap, isLoading: rolePermsLoading, refetch } = useRolePermissions(selectedRoleId);
  const { setPerms, isWorking } = useSetRolePermissions();
  const { user } = useAuth();

  const [localGranted, setLocalGranted] = useState<Set<string>>(new Set());
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (!rolePermsLoading) {
      setLocalGranted(new Set(grantedSlugs));
      setIsDirty(false);
    }
  }, [grantedSlugs, rolePermsLoading]);

  useEffect(() => {
    if (roles.length > 0 && !selectedRoleId) {
      setSelectedRoleId(roles[0]?.id ?? "");
    }
  }, [roles, selectedRoleId]);

  const selectedRole = roles.find((r) => r.id === selectedRoleId);
  const isSystem = selectedRole?.isSystem ?? false;

  function toggle(slug: string) {
    if (isSystem) return;
    setLocalGranted((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug); else next.add(slug);
      return next;
    });
    setIsDirty(true);
  }

  function selectAll() {
    if (isSystem) return;
    setLocalGranted(new Set(permissions.map((p) => p.slug)));
    setIsDirty(true);
  }
  function clearAll() {
    if (isSystem) return;
    setLocalGranted(new Set());
    setIsDirty(true);
  }
  function reset() {
    setLocalGranted(new Set(grantedSlugs));
    setIsDirty(false);
  }

  async function handleSave() {
    if (!selectedRoleId) return;
    // Build permission IDs from slugs
    const permIds = permissions
      .filter((p) => localGranted.has(p.slug))
      .map((p) => p.id);
    const result = await setPerms(selectedRoleId, permIds, user?.id ?? "");
    if (!result.success) { toast.error(result.error.message); return; }
    toast.success("Permissions saved.");
    setIsDirty(false);
    refetch();
  }

  if (rolesLoading || permsLoading) {
    return <div className="h-40 animate-pulse rounded-xl border border-border bg-muted" />;
  }

  return (
    <div className="space-y-4">
      {/* Role selector */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Editing role:</span>
        <div className="flex flex-wrap gap-2">
          {roles.map((role) => (
            <button
              key={role.id}
              type="button"
              onClick={() => setSelectedRoleId(role.id)}
              className={`transition-transform hover:scale-105 ${selectedRoleId === role.id ? "scale-105 ring-2 ring-primary/40 rounded-full" : ""}`}
            >
              <RoleBadge name={role.name} color={role.color} />
            </button>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      {selectedRole && (
        <div className="flex flex-wrap items-center gap-2">
          {!isSystem && (
            <>
              <Button type="button" variant="outline-gold" onClick={selectAll} className="h-7 px-3 text-xs">
                <Check className="size-3 mr-1" /> Select All
              </Button>
              <Button type="button" variant="outline-gold" onClick={clearAll} className="h-7 px-3 text-xs">
                Clear All
              </Button>
              {isDirty && (
                <Button type="button" variant="outline-gold" onClick={reset} className="h-7 gap-1.5 px-3 text-xs">
                  <RotateCcw className="size-3" /> Reset
                </Button>
              )}
            </>
          )}
          {isSystem && (
            <span className="text-xs text-muted-foreground">
              System role — permissions cannot be edited here. Assign a custom role to staff instead.
            </span>
          )}
          <div className="ml-auto">
            {isDirty && !isSystem && (
              <Button type="button" variant="gold" disabled={isWorking} onClick={handleSave} className="h-7 gap-1.5 px-3 text-xs">
                {isWorking ? <Loader2 className="size-3 animate-spin" /> : <Save className="size-3" />}
                Save
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Matrix grid */}
      {rolePermsLoading ? (
        <div className="h-40 animate-pulse rounded-xl border border-border bg-muted" />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          {groups.map((group) => {
            const groupPerms = permissions.filter((p) => p.groupId === group.id);
            if (groupPerms.length === 0) return null;
            const allGranted = groupPerms.every((p) => localGranted.has(p.slug));
            const someGranted = groupPerms.some((p) => localGranted.has(p.slug));

            return (
              <div key={group.id} className="border-b border-border last:border-b-0">
                {/* Group header */}
                <div className="flex items-center gap-3 bg-muted/50 px-4 py-2.5">
                  <button
                    type="button"
                    disabled={isSystem}
                    onClick={() => {
                      if (isSystem) return;
                      const next = new Set(localGranted);
                      if (allGranted) groupPerms.forEach((p) => next.delete(p.slug));
                      else groupPerms.forEach((p) => next.add(p.slug));
                      setLocalGranted(next);
                      setIsDirty(true);
                    }}
                    className={`size-4 rounded border ${allGranted ? "border-primary bg-primary" : someGranted ? "border-primary bg-primary/40" : "border-border bg-background"} flex items-center justify-center transition-colors disabled:cursor-default`}
                    aria-label={`Toggle all ${group.name} permissions`}
                  >
                    {(allGranted || someGranted) && <Check className="size-3 text-white" />}
                  </button>
                  <span className="text-xs font-semibold uppercase tracking-wider">{group.name}</span>
                  <span className="ml-auto text-[10px] text-muted-foreground">
                    {groupPerms.filter((p) => localGranted.has(p.slug)).length}/{groupPerms.length}
                  </span>
                </div>

                {/* Permission rows */}
                {groupPerms.map((perm) => {
                  const granted = localGranted.has(perm.slug);
                  return (
                    <label
                      key={perm.id}
                      className={`flex cursor-pointer items-center gap-3 px-6 py-2 text-sm transition-colors hover:bg-muted/30 ${isSystem ? "cursor-default" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={granted}
                        disabled={isSystem}
                        onChange={() => toggle(perm.slug)}
                        className="rounded border-border"
                      />
                      <span className="flex-1">{perm.name}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">{perm.slug}</span>
                    </label>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
