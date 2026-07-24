import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Mail, RefreshCw } from "lucide-react";
import { useState } from "react";

import { MessageCard } from "@/components/admin/messages/MessageCard";
import { EmptyState } from "@/components/admin/dashboard/EmptyState";
import { ActionBar } from "@/components/admin/page/ActionBar";
import { Breadcrumbs } from "@/components/admin/page/Breadcrumbs";
import { PageHeader } from "@/components/admin/page/PageHeader";
import { SectionContainer } from "@/components/admin/page/SectionContainer";
import { Button } from "@/components/common/Button";
import { useMessages } from "@/hooks/useMessages";
import type { MessageStatus } from "@/services/messages.service";

export const Route = createFileRoute("/admin/_authenticated/messages")({
  component: AdminMessagesPage,
  head: () => ({
    meta: [{ title: "Contact Messages — Admin — Taste Haven" }],
  }),
});

type Filter = "all" | MessageStatus;

const FILTER_TABS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "read", label: "Read" },
  { value: "archived", label: "Archived" },
];

function AdminMessagesPage() {
  const { items, isLoading, error, refetch } = useMessages();
  const [filter, setFilter] = useState<Filter>("all");

  const filtered =
    filter === "all" ? items : items.filter((m) => m.status === filter);

  const unreadCount = items.filter((m) => m.status === "unread").length;

  return (
    <div className="space-y-6">
      <Breadcrumbs page="Contact Messages" />
      <PageHeader
        title={unreadCount > 0 ? `Contact Messages (${unreadCount} unread)` : "Contact Messages"}
        description="View messages submitted through your public contact form."
        action={
          <ActionBar
            label="Refresh"
            icon={RefreshCw}
            onClick={refetch}
          />
        }
      />

      <SectionContainer>
        {/* Filter tabs */}
        {!isLoading && !error && items.length > 0 && (
          <div className="mb-5 flex gap-1 rounded-lg border border-border bg-muted/40 p-1">
            {FILTER_TABS.map((tab) => {
              const count =
                tab.value === "all"
                  ? items.length
                  : items.filter((m) => m.status === tab.value).length;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setFilter(tab.value)}
                  className={[
                    "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    filter === tab.value
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  {tab.label}
                  {count > 0 && (
                    <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-xs">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {isLoading ? (
          <MessagesSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="grid size-11 place-items-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="size-5" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium">Couldn&apos;t load messages</p>
            <p className="max-w-xs text-sm text-muted-foreground">{error.message}</p>
            <Button type="button" variant="outline-gold" onClick={refetch} className="mt-1 px-4 py-2">
              Try again
            </Button>
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={Mail}
            title="No messages yet."
            description="Messages submitted through your public contact form will appear here."
          />
        ) : filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No {filter} messages.
          </p>
        ) : (
          <div className="space-y-3">
            {filtered.map((message) => (
              <MessageCard
                key={message.id}
                message={message}
                onStatusChange={refetch}
              />
            ))}
          </div>
        )}
      </SectionContainer>
    </div>
  );
}

function MessagesSkeleton() {
  return (
    <div className="space-y-3 animate-pulse" aria-busy="true">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-start gap-4 rounded-xl border border-border bg-card p-4">
          <div className="size-9 shrink-0 rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 rounded bg-muted" />
            <div className="h-3 w-2/3 rounded bg-muted" />
            <div className="h-3 w-1/2 rounded bg-muted" />
          </div>
          <div className="h-3 w-20 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}
