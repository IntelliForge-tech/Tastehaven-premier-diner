import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Plus, Star, TrendingUp } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

import { EmptyState } from "@/components/admin/dashboard/EmptyState";
import { Breadcrumbs } from "@/components/admin/page/Breadcrumbs";
import { PageHeader } from "@/components/admin/page/PageHeader";
import { SectionContainer } from "@/components/admin/page/SectionContainer";
import { Button } from "@/components/common/Button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { usePerformance } from "@/hooks/usePerformance";
import { useStaff } from "@/hooks/useStaff";
import { createPerformanceRecord, type ReviewPeriod } from "@/services/staff/staff-performance.service";

export const Route = createFileRoute("/admin/_authenticated/staff/performance")({
  component: AdminPerformancePage,
  head: () => ({ meta: [{ title: "Performance — Admin — Taste Haven" }] }),
});

const REVIEW_PERIODS: ReviewPeriod[] = ["monthly", "quarterly", "annual"];

const perfSchema = z.object({
  staffMemberId: z.string().min(1, "Select an employee."),
  reviewPeriod: z.enum(["monthly", "quarterly", "annual"] as const),
  reviewDate: z.string().min(1),
  tasksCompleted: z.number().int().min(0).default(0),
  customerRating: z.number().min(0).max(5).nullable().optional(),
  attendanceScore: z.number().min(0).max(100).nullable().optional(),
  punctualityScore: z.number().min(0).max(100).nullable().optional(),
  overallRating: z.number().min(0).max(5).default(3),
  managerFeedback: z.string().max(1000).default(""),
  achievements: z.string().max(500).default(""),
  areasForImprovement: z.string().max(500).default(""),
  warnings: z.number().int().min(0).default(0),
  awards: z.string().max(300).default(""),
  trainingCompleted: z.string().max(300).default(""),
});
type PerfFormValues = z.infer<typeof perfSchema>;

function ratingColor(rating: number) {
  if (rating >= 4) return "text-emerald-600";
  if (rating >= 3) return "text-blue-600";
  if (rating >= 2) return "text-yellow-600";
  return "text-red-600";
}

function AdminPerformancePage() {
  const { records, isLoading, refetch } = usePerformance();
  const { staff } = useStaff();
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="space-y-6">
      <Breadcrumbs page="Performance" />
      <PageHeader
        title="Performance Reviews"
        description="Track employee performance, ratings, and feedback."
        action={
          <Button type="button" variant="gold" onClick={() => setAddOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 text-sm">
            <Plus className="size-4" />Add Review
          </Button>
        }
      />

      <SectionContainer>
        {isLoading ? (
          <div className="animate-pulse space-y-3">{Array.from({ length: 4 }, (_, i) => <div key={i} className="h-24 rounded-xl bg-muted" />)}</div>
        ) : records.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title="No performance reviews yet."
            description="Start tracking employee performance by adding a review."
            action={
              <Button type="button" variant="gold" onClick={() => setAddOpen(true)} className="inline-flex items-center gap-2 px-5 py-2.5">
                <Plus className="size-4" />Add Review
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {records.map((rec) => (
              <div key={rec.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-foreground">{rec.staffName ?? "—"}</p>
                    <p className="text-xs capitalize text-muted-foreground">{rec.reviewPeriod} review · {rec.reviewDate}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className={`size-4 ${ratingColor(rec.overallRating)}`} aria-hidden="true" />
                    <span className={`font-bold text-lg ${ratingColor(rec.overallRating)}`}>{rec.overallRating.toFixed(1)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-md bg-muted/40 px-2 py-1.5">
                    <p className="text-muted-foreground">Tasks</p>
                    <p className="font-semibold text-foreground">{rec.tasksCompleted}</p>
                  </div>
                  {rec.customerRating !== null && (
                    <div className="rounded-md bg-muted/40 px-2 py-1.5">
                      <p className="text-muted-foreground">Customer Rating</p>
                      <p className="font-semibold text-foreground">{rec.customerRating}/5</p>
                    </div>
                  )}
                  {rec.attendanceScore !== null && (
                    <div className="rounded-md bg-muted/40 px-2 py-1.5">
                      <p className="text-muted-foreground">Attendance</p>
                      <p className="font-semibold text-foreground">{rec.attendanceScore}%</p>
                    </div>
                  )}
                  {rec.warnings > 0 && (
                    <div className="rounded-md bg-red-50 px-2 py-1.5 dark:bg-red-900/20">
                      <p className="text-red-600 dark:text-red-400">Warnings</p>
                      <p className="font-semibold text-red-700 dark:text-red-300">{rec.warnings}</p>
                    </div>
                  )}
                </div>

                {rec.managerFeedback && (
                  <p className="line-clamp-2 text-xs text-muted-foreground">{rec.managerFeedback}</p>
                )}
                {rec.achievements && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">🏆 {rec.achievements}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </SectionContainer>

      <Dialog open={addOpen} onOpenChange={(o) => { if (!o) setAddOpen(false); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Add Performance Review</DialogTitle></DialogHeader>
          <PerfForm staff={staff} onSuccess={() => { setAddOpen(false); refetch(); }} onCancel={() => setAddOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PerfForm({ staff, onSuccess, onCancel }: { staff: ReturnType<typeof useStaff>["staff"]; onSuccess: () => void; onCancel: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMountedRef = useRef(true);
  useEffect(() => () => { isMountedRef.current = false; }, []);

  const form = useForm<PerfFormValues>({
    resolver: zodResolver(perfSchema),
    defaultValues: {
      reviewPeriod: "monthly",
      reviewDate: new Date().toISOString().slice(0, 10),
      tasksCompleted: 0,
      overallRating: 3,
      warnings: 0,
    },
  });

  async function onSubmit(values: PerfFormValues) {
    setIsSubmitting(true);
    const r = await createPerformanceRecord({
      staffMemberId: values.staffMemberId,
      reviewPeriod: values.reviewPeriod,
      reviewDate: values.reviewDate,
      tasksCompleted: values.tasksCompleted,
      customerRating: values.customerRating ?? null,
      attendanceScore: values.attendanceScore ?? null,
      punctualityScore: values.punctualityScore ?? null,
      overallRating: values.overallRating,
      managerFeedback: values.managerFeedback || null,
      achievements: values.achievements || null,
      areasForImprovement: values.areasForImprovement || null,
      warnings: values.warnings,
      awards: values.awards || null,
      trainingCompleted: values.trainingCompleted || null,
    });
    if (isMountedRef.current) setIsSubmitting(false);
    if (!r.success) { toast.error(r.error.message); return; }
    toast.success("Performance review added.");
    onSuccess();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FormField control={form.control} name="staffMemberId" render={({ field }) => (
          <FormItem>
            <FormLabel>Employee *</FormLabel>
            <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger></FormControl>
              <SelectContent>{staff.map((s) => <SelectItem key={s.id} value={s.id}>{s.firstName} {s.lastName}</SelectItem>)}</SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="reviewPeriod" render={({ field }) => (
            <FormItem>
              <FormLabel>Period *</FormLabel>
              <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>{REVIEW_PERIODS.map((p) => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}</SelectContent>
              </Select>
            </FormItem>
          )} />
          <FormField control={form.control} name="reviewDate" render={({ field }) => (
            <FormItem><FormLabel>Review Date *</FormLabel><FormControl><Input type="date" disabled={isSubmitting} {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="overallRating" render={({ field }) => (
            <FormItem><FormLabel>Overall Rating (0–5) *</FormLabel><FormControl><Input type="number" min={0} max={5} step={0.5} disabled={isSubmitting} {...field} onChange={(e) => field.onChange(e.target.valueAsNumber)} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="tasksCompleted" render={({ field }) => (
            <FormItem><FormLabel>Tasks Completed</FormLabel><FormControl><Input type="number" min={0} disabled={isSubmitting} {...field} onChange={(e) => field.onChange(e.target.valueAsNumber)} /></FormControl></FormItem>
          )} />
          <FormField control={form.control} name="customerRating" render={({ field }) => (
            <FormItem><FormLabel>Customer Rating (0–5)</FormLabel><FormControl><Input type="number" min={0} max={5} step={0.5} placeholder="Optional" disabled={isSubmitting} value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value ? e.target.valueAsNumber : null)} /></FormControl></FormItem>
          )} />
          <FormField control={form.control} name="attendanceScore" render={({ field }) => (
            <FormItem><FormLabel>Attendance Score (%)</FormLabel><FormControl><Input type="number" min={0} max={100} placeholder="Optional" disabled={isSubmitting} value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value ? e.target.valueAsNumber : null)} /></FormControl></FormItem>
          )} />
          <FormField control={form.control} name="warnings" render={({ field }) => (
            <FormItem><FormLabel>Warnings</FormLabel><FormControl><Input type="number" min={0} disabled={isSubmitting} {...field} onChange={(e) => field.onChange(e.target.valueAsNumber)} /></FormControl></FormItem>
          )} />
        </div>

        <FormField control={form.control} name="managerFeedback" render={({ field }) => (
          <FormItem><FormLabel>Manager Feedback</FormLabel><FormControl><Textarea placeholder="Overall feedback…" rows={3} disabled={isSubmitting} {...field} /></FormControl></FormItem>
        )} />
        <FormField control={form.control} name="achievements" render={({ field }) => (
          <FormItem><FormLabel>Achievements</FormLabel><FormControl><Input placeholder="e.g. Employee of the month" disabled={isSubmitting} {...field} /></FormControl></FormItem>
        )} />
        <FormField control={form.control} name="areasForImprovement" render={({ field }) => (
          <FormItem><FormLabel>Areas for Improvement</FormLabel><FormControl><Textarea placeholder="What to work on…" rows={2} disabled={isSubmitting} {...field} /></FormControl></FormItem>
        )} />

        <div className="flex justify-end gap-3 border-t border-border pt-4">
          <Button type="button" variant="outline" disabled={isSubmitting} onClick={onCancel} className="px-4 py-2">Cancel</Button>
          <Button type="submit" variant="gold" disabled={isSubmitting} className="inline-flex items-center gap-2 px-5 py-2">
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}Save Review
          </Button>
        </div>
      </form>
    </Form>
  );
}

// Need useEffect import
import { useEffect } from "react";
