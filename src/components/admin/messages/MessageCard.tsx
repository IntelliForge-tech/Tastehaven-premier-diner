import { Archive, Mail, MailOpen } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import {
  type ContactMessage,
  type MessageStatus,
  updateMessageStatus,
} from "@/services/messages.service";

interface MessageCardProps {
  message: ContactMessage;
  onStatusChange: () => void;
}

const STATUS_BADGE: Record<MessageStatus, { label: string; variant: "default" | "secondary" | "outline" }> = {
  unread: { label: "Unread", variant: "default" },
  read: { label: "Read", variant: "secondary" },
  archived: { label: "Archived", variant: "outline" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MessageCard({ message, onStatusChange }: MessageCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const badge = STATUS_BADGE[message.status];

  async function markAs(status: MessageStatus) {
    if (message.status === status || isUpdating) return;
    setIsUpdating(true);
    const result = await updateMessageStatus(message.id, status);
    setIsUpdating(false);
    if (!result.success) { toast.error(result.error.message); return; }
    onStatusChange();
  }

  return (
    <div
      className={[
        "rounded-xl border bg-card transition-colors",
        message.status === "unread"
          ? "border-primary/40 bg-primary/5"
          : "border-border",
      ].join(" ")}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => {
          setExpanded((v) => !v);
          if (message.status === "unread") markAs("read");
        }}
        className="flex w-full items-start gap-4 p-4 text-left"
        aria-expanded={expanded}
      >
        <div className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
          {message.status === "unread"
            ? <Mail className="size-4 text-primary" />
            : <MailOpen className="size-4" />
          }
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="font-medium text-foreground">{message.senderName}</span>
            <span className="text-sm text-muted-foreground">{message.email}</span>
            <Badge variant={badge.variant} className="text-[11px]">{badge.label}</Badge>
          </div>
          {message.subject && (
            <p className="mt-0.5 text-sm font-medium text-foreground/80">{message.subject}</p>
          )}
          <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{message.body}</p>
        </div>

        <time className="shrink-0 text-xs text-muted-foreground" dateTime={message.submittedAt}>
          {formatDate(message.submittedAt)}
        </time>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="border-t border-border px-4 pb-4 pt-3">
          {message.phone && (
            <p className="mb-2 text-xs text-muted-foreground">
              <span className="font-medium">Phone:</span> {message.phone}
            </p>
          )}
          <p className="whitespace-pre-wrap text-sm text-foreground">{message.body}</p>

          {/* Status actions */}
          <div className="mt-4 flex flex-wrap gap-2">
            {message.status !== "read" && (
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => markAs("read")}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-50"
              >
                <MailOpen className="size-3.5" aria-hidden="true" />
                Mark as Read
              </button>
            )}
            {message.status !== "archived" && (
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => markAs("archived")}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-muted disabled:opacity-50"
              >
                <Archive className="size-3.5" aria-hidden="true" />
                Archive
              </button>
            )}
            {message.status === "archived" && (
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => markAs("read")}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-50"
              >
                <MailOpen className="size-3.5" aria-hidden="true" />
                Unarchive
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
