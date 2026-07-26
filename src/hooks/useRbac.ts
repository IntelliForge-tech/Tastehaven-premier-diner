import { useCallback, useEffect, useRef, useState } from "react";

import { getRoles, createRole, updateRole, deleteRole, duplicateRole, type Role, type CreateRoleInput, type UpdateRoleInput } from "@/services/roles.service";
import { getPermissionsWithGroups, getRolePermissions, setRolePermissions, type Permission, type PermissionGroup } from "@/services/permissions.service";
import { getStaffRoles, getAllStaffWithRoles, assignRole, removeRole, type StaffWithRoles, type AssignRoleInput } from "@/services/staff-roles.service";
import { getPermissionAuditLogs, type AuditLogEntry } from "@/services/permission-audit.service";

// ── useRoles ──────────────────────────────────────────────────────────────────

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tok, setTok] = useState(0);
  const refetch = useCallback(() => setTok((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    getRoles().then((r) => {
      if (cancelled) return;
      if (r.success) { setRoles(r.data); setError(null); }
      else setError(r.error.message);
      setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, [tok]);

  return { roles, isLoading, error, refetch };
}

// ── useRoleMutations ──────────────────────────────────────────────────────────

export function useRoleMutations() {
  const [isWorking, setIsWorking] = useState(false);
  const mounted = useRef(true);
  useEffect(() => () => { mounted.current = false; }, []);

  async function create(input: CreateRoleInput) {
    setIsWorking(true);
    try { return await createRole(input); }
    finally { if (mounted.current) setIsWorking(false); }
  }
  async function update(id: string, input: UpdateRoleInput) {
    setIsWorking(true);
    try { return await updateRole(id, input); }
    finally { if (mounted.current) setIsWorking(false); }
  }
  async function remove(id: string) {
    setIsWorking(true);
    try { return await deleteRole(id); }
    finally { if (mounted.current) setIsWorking(false); }
  }
  async function duplicate(id: string, newName: string) {
    setIsWorking(true);
    try { return await duplicateRole(id, newName); }
    finally { if (mounted.current) setIsWorking(false); }
  }

  return { create, update, remove, duplicate, isWorking };
}

// ── usePermissionsData ────────────────────────────────────────────────────────

export function usePermissionsData() {
  const [groups, setGroups] = useState<PermissionGroup[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    getPermissionsWithGroups().then((r) => {
      if (cancelled) return;
      if (r.success) { setGroups(r.groups); setPermissions(r.permissions); setError(null); }
      else setError(r.error.message);
      setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  return { groups, permissions, isLoading, error };
}

// ── useRolePermissions ────────────────────────────────────────────────────────

export function useRolePermissions(roleId: string) {
  const [slugs, setSlugs] = useState<Set<string>>(new Set());
  const [ids, setIds] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [tok, setTok] = useState(0);
  const refetch = useCallback(() => setTok((t) => t + 1), []);

  useEffect(() => {
    if (!roleId) return;
    let cancelled = false;
    setIsLoading(true);
    getRolePermissions(roleId).then((r) => {
      if (cancelled) return;
      if (r.success) { setSlugs(r.slugs); setIds(r.ids); }
      setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, [roleId, tok]);

  return { slugs, ids, isLoading, refetch };
}

export function useSetRolePermissions() {
  const [isWorking, setIsWorking] = useState(false);
  const mounted = useRef(true);
  useEffect(() => () => { mounted.current = false; }, []);

  async function setPerms(roleId: string, permissionIds: string[], grantedBy: string) {
    setIsWorking(true);
    try { return await setRolePermissions(roleId, permissionIds, grantedBy); }
    finally { if (mounted.current) setIsWorking(false); }
  }

  return { setPerms, isWorking };
}

// ── useStaffWithRoles ─────────────────────────────────────────────────────────

export function useStaffWithRoles() {
  const [staff, setStaff] = useState<StaffWithRoles[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tok, setTok] = useState(0);
  const refetch = useCallback(() => setTok((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    getAllStaffWithRoles().then((r) => {
      if (cancelled) return;
      if (r.success) { setStaff(r.data); setError(null); }
      else setError(r.error.message);
      setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, [tok]);

  return { staff, isLoading, error, refetch };
}

export function useStaffRoleAssignment() {
  const [isWorking, setIsWorking] = useState(false);
  const mounted = useRef(true);
  useEffect(() => () => { mounted.current = false; }, []);

  async function assign(input: AssignRoleInput) {
    setIsWorking(true);
    try { return await assignRole(input); }
    finally { if (mounted.current) setIsWorking(false); }
  }
  async function remove(adminUserId: string, roleId: string) {
    setIsWorking(true);
    try { return await removeRole(adminUserId, roleId); }
    finally { if (mounted.current) setIsWorking(false); }
  }

  return { assign, remove, isWorking };
}

// ── usePermissionAudit ────────────────────────────────────────────────────────

export function usePermissionAudit(page = 1) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    getPermissionAuditLogs(page).then((r) => {
      if (cancelled) return;
      if (r.success) { setLogs(r.data); setTotal(r.total); }
      setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, [page]);

  return { logs, total, isLoading };
}
