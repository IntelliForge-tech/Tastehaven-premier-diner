import { Link } from "@tanstack/react-router";
import { ShieldOff } from "lucide-react";

/**
 * Shown when a user navigates to a route they don't have permission to access.
 * Provides a friendly 403 UI with a "Back to Dashboard" escape hatch.
 */
export function ForbiddenPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 text-center">
      <div className="grid size-16 place-items-center rounded-full bg-destructive/10 text-destructive">
        <ShieldOff className="size-8" />
      </div>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="max-w-xs text-sm text-muted-foreground">
          You don't have permission to view this page. Contact your administrator if you believe this is an error.
        </p>
      </div>
      <Link
        to="/admin"
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-4 text-sm font-medium transition-colors hover:bg-muted"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
