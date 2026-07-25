import { useCallback, useEffect, useRef, useState } from "react";

import {
  assignTable,
  getActiveAssignments,
  releaseTableAssignment,
  type AssignmentError,
  type AssignTableInput,
  type TableAssignment,
} from "@/services/table-assignment.service";

export interface UseTableAssignmentsResult {
  assignments: TableAssignment[];
  isLoading: boolean;
  error: AssignmentError | null;
  refetch: () => void;
  assign: (input: AssignTableInput) => Promise<{ success: boolean; error?: AssignmentError }>;
  release: (assignmentId: string) => Promise<{ success: boolean; error?: AssignmentError }>;
  isSubmitting: boolean;
}

export function useTableAssignments(): UseTableAssignmentsResult {
  const [assignments, setAssignments] = useState<TableAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<AssignmentError | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const isMountedRef = useRef(true);

  useEffect(() => () => { isMountedRef.current = false; }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getActiveAssignments().then((result) => {
      if (cancelled) return;
      if (result.success) {
        setAssignments(result.data);
      } else {
        setError(result.error);
        setAssignments([]);
      }
      setIsLoading(false);
    });

    return () => { cancelled = true; };
  }, [reloadToken]);

  const refetch = useCallback(() => setReloadToken((t) => t + 1), []);

  async function assign(input: AssignTableInput) {
    setIsSubmitting(true);
    try {
      const result = await assignTable(input);
      if (result.success) {
        refetch();
        return { success: true };
      }
      return { success: false, error: result.error };
    } finally {
      if (isMountedRef.current) setIsSubmitting(false);
    }
  }

  async function release(assignmentId: string) {
    setIsSubmitting(true);
    try {
      const result = await releaseTableAssignment(assignmentId);
      if (result.success) {
        refetch();
        return { success: true };
      }
      return { success: false, error: result.error };
    } finally {
      if (isMountedRef.current) setIsSubmitting(false);
    }
  }

  return { assignments, isLoading, error, refetch, assign, release, isSubmitting };
}
