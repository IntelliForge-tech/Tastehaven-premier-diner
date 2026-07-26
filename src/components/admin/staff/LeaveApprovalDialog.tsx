import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/common/Button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { updateLeaveStatus, type LeaveRequest } from "@/services/staff/staff-leave.service";

interface LeaveApprovalDialogProps {
  request: LeaveRequest | null;
  action: "approve" | "reject" | null;
  onClose: () => void;
  onSuccess: () => void;
}

const LEAVE_TYPE_LABELS: Record<string, string> = {
  sick: "Sick Leave", casual: "Casual Leave", paid: "Paid Leave",
  emergency: "Emergency Leave", maternity: "Maternity Leave", paternity: "Paternity Leave",
  vacation: "Vacation", unpaid: "Unpaid Leave",
};

export function LeaveApprovalDialog({ request, action, onClose, onSuccess }: LeaveApprovalDialogProps) {
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (!request || !action) return;
    setIsSubmitting(true);
    const result = await updateLeaveStatus(
      request.id,
      action === "approve" ? "approved" : "rejected",
      null,
      action === "reject" ? note || null : null,
    );
    setIsSubmitting(false);
    if (!result.success) { toast.error(result.error.message); return; }
    toast.success(action === "approve" ? "Leave request approved." : "Leave request rejected.");
    setNote("");
    onSuccess();
    onClose();
  }

  return (
    <Dialog open={!!request && !!action} onOpenChange={(o) => { if (!o && !isSubmitting) { setNote(""); onClose(); } }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{action === "approve" ? "Approve" : "Reject"} Leave Request</DialogTitle>
          <DialogDescription>
            {request && `${request.staffName ?? "Employee"} — ${LEAVE_TYPE_LABELS[request.leaveType] ?? request.leaveType} — ${request.startDate} to ${request.endDate} (${request.totalDays} day${request.totalDays !== 1 ? "s" : ""})`}
          </DialogDescription>
        </DialogHeader>

        {action === "reject" && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Rejection Reason (optional)</label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Explain why this request is being rejected…"
              rows={3}
              disabled={isSubmitting}
            />
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => { setNote(""); onClose(); }} className="px-4 py-2">Cancel</Button>
          <Button
            type="button"
            variant="gold"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className={`inline-flex items-center gap-2 px-5 py-2 ${action === "reject" ? "bg-destructive border-destructive text-white hover:bg-destructive/90" : ""}`}
          >
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {action === "approve" ? "Approve" : "Reject"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
