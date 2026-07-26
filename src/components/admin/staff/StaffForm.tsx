import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/common/Button";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { createStaffMember, updateStaffMember, type StaffMember } from "@/services/staff/staff.service";
import type { StaffDepartment } from "@/services/staff/staff-departments.service";
import type { StaffShift } from "@/services/staff/staff-shifts.service";

const EMPLOYMENT_STATUSES = ["active","inactive","on_leave","suspended","resigned","terminated","probation","retired"] as const;
const GENDERS = ["Male","Female","Non-binary","Prefer not to say"] as const;

const staffFormSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required.").max(20),
  firstName: z.string().min(1, "First name is required.").max(60),
  lastName: z.string().min(1, "Last name is required.").max(60),
  email: z.string().email("Enter a valid email address."),
  phone: z.string().max(30).default(""),
  dateOfBirth: z.string().default(""),
  gender: z.string().default(""),
  address: z.string().max(200).default(""),
  city: z.string().max(100).default(""),
  country: z.string().max(100).default(""),
  emergencyContact: z.string().max(100).default(""),
  emergencyPhone: z.string().max(30).default(""),
  joiningDate: z.string().min(1, "Joining date is required."),
  employmentStatus: z.enum(EMPLOYMENT_STATUSES),
  departmentId: z.string().default(""),
  designationId: z.string().default(""),
  shiftId: z.string().default(""),
  managerId: z.string().default(""),
  salary: z.number().nullable().optional(),
  notes: z.string().max(1000).default(""),
  isActive: z.boolean().default(true),
});

type StaffFormValues = z.infer<typeof staffFormSchema>;

interface StaffFormProps {
  member?: StaffMember;
  departments: StaffDepartment[];
  shifts: StaffShift[];
  allStaff: StaffMember[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function StaffForm({ member, departments, shifts, allStaff, onSuccess, onCancel }: StaffFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMountedRef = useRef(true);
  useEffect(() => () => { isMountedRef.current = false; }, []);

  const isEdit = !!member;

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: member ? {
      employeeId: member.employeeId, firstName: member.firstName, lastName: member.lastName,
      email: member.email, phone: member.phone ?? "", dateOfBirth: member.dateOfBirth ?? "",
      gender: member.gender ?? "", address: member.address ?? "", city: member.city ?? "",
      country: member.country ?? "", emergencyContact: member.emergencyContact ?? "",
      emergencyPhone: member.emergencyPhone ?? "", joiningDate: member.joiningDate,
      employmentStatus: member.employmentStatus, departmentId: member.departmentId ?? "",
      designationId: member.designationId ?? "", shiftId: member.shiftId ?? "",
      managerId: member.managerId ?? "", salary: member.salary, notes: member.notes ?? "",
      isActive: member.isActive,
    } : {
      employeeId: `EMP-${String(Date.now()).slice(-5)}`,
      joiningDate: new Date().toISOString().slice(0, 10),
      employmentStatus: "active", isActive: true,
    },
    mode: "onTouched",
  });

  async function onSubmit(values: StaffFormValues) {
    setIsSubmitting(true);
    try {
      const payload = {
        employeeId: values.employeeId, firstName: values.firstName, lastName: values.lastName,
        email: values.email, phone: values.phone || null, dateOfBirth: values.dateOfBirth || null,
        gender: values.gender || null, address: values.address || null, city: values.city || null,
        country: values.country || null, emergencyContact: values.emergencyContact || null,
        emergencyPhone: values.emergencyPhone || null, joiningDate: values.joiningDate,
        employmentStatus: values.employmentStatus, departmentId: values.departmentId || null,
        designationId: values.designationId || null, shiftId: values.shiftId || null,
        managerId: values.managerId || null, salary: values.salary ?? null,
        notes: values.notes || null, isActive: values.isActive,
      };

      const result = isEdit && member
        ? await updateStaffMember({ ...payload, id: member.id })
        : await createStaffMember(payload);

      if (!result.success) { toast.error(result.error.message); return; }
      toast.success(isEdit ? "Employee updated." : "Employee added.");
      onSuccess();
    } finally {
      if (isMountedRef.current) setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-6">

        {/* Personal */}
        <fieldset className="space-y-4">
          <legend className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Personal Information</legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <F form={form} name="employeeId" label="Employee ID *" placeholder="EMP-001" disabled={isSubmitting} />
            <F form={form} name="firstName"  label="First Name *"  placeholder="Jane" disabled={isSubmitting} />
            <F form={form} name="lastName"   label="Last Name *"   placeholder="Doe" disabled={isSubmitting} />
            <F form={form} name="email"      label="Email *"       placeholder="jane@tastehaven.co" type="email" disabled={isSubmitting} />
            <F form={form} name="phone"      label="Phone"         placeholder="+1 555 000 1234" disabled={isSubmitting} />
            <F form={form} name="dateOfBirth" label="Date of Birth" type="date" disabled={isSubmitting} />
            <FormField control={form.control} name="gender" render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {GENDERS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormItem>
            )} />
          </div>
        </fieldset>

        {/* Address */}
        <fieldset className="space-y-4">
          <legend className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Address</legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <F form={form} name="address" label="Street Address" placeholder="42 Amber Street" disabled={isSubmitting} />
            </div>
            <F form={form} name="city"    label="City"    placeholder="San Francisco" disabled={isSubmitting} />
            <F form={form} name="country" label="Country" placeholder="United States"  disabled={isSubmitting} />
          </div>
        </fieldset>

        {/* Emergency */}
        <fieldset className="space-y-4">
          <legend className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Emergency Contact</legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <F form={form} name="emergencyContact" label="Contact Name"  placeholder="John Doe" disabled={isSubmitting} />
            <F form={form} name="emergencyPhone"   label="Contact Phone" placeholder="+1 555 000 5678" disabled={isSubmitting} />
          </div>
        </fieldset>

        {/* Employment */}
        <fieldset className="space-y-4">
          <legend className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Employment</legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <F form={form} name="joiningDate" label="Joining Date *" type="date" disabled={isSubmitting} />
            <FormField control={form.control} name="employmentStatus" render={({ field }) => (
              <FormItem>
                <FormLabel>Status *</FormLabel>
                <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {EMPLOYMENT_STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s.replace("_", " ")}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="departmentId" render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <Select value={field.value || "none"} onValueChange={(v) => field.onChange(v === "none" ? "" : v)} disabled={isSubmitting}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormItem>
            )} />
            <FormField control={form.control} name="shiftId" render={({ field }) => (
              <FormItem>
                <FormLabel>Shift</FormLabel>
                <Select value={field.value || "none"} onValueChange={(v) => field.onChange(v === "none" ? "" : v)} disabled={isSubmitting}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {shifts.map((s) => <SelectItem key={s.id} value={s.id}>{s.name} ({s.startTime}–{s.endTime})</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormItem>
            )} />
            <FormField control={form.control} name="managerId" render={({ field }) => (
              <FormItem>
                <FormLabel>Manager</FormLabel>
                <Select value={field.value || "none"} onValueChange={(v) => field.onChange(v === "none" ? "" : v)} disabled={isSubmitting}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {allStaff.filter((s) => s.id !== member?.id).map((s) => <SelectItem key={s.id} value={s.id}>{s.firstName} {s.lastName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormItem>
            )} />
            <FormField control={form.control} name="salary" render={({ field }) => (
              <FormItem>
                <FormLabel>Salary (optional)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} placeholder="Monthly salary" disabled={isSubmitting}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </fieldset>

        {/* Notes */}
        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem>
            <FormLabel>Private Notes</FormLabel>
            <FormControl><Textarea placeholder="Internal management notes (never visible publicly)…" rows={3} disabled={isSubmitting} {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="isActive" render={({ field }) => (
          <FormItem className="flex items-center gap-3 space-y-0 rounded-lg border border-border bg-muted/20 p-3">
            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} disabled={isSubmitting} /></FormControl>
            <FormLabel className="cursor-pointer text-sm font-medium">Active Employee</FormLabel>
          </FormItem>
        )} />

        <div className="flex justify-end gap-3 border-t border-border pt-4">
          <Button type="button" variant="outline" disabled={isSubmitting} onClick={onCancel} className="px-4 py-2">Cancel</Button>
          <Button type="submit" variant="gold" disabled={isSubmitting} className="inline-flex items-center gap-2 px-5 py-2">
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isEdit ? "Save Changes" : "Add Employee"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function F({ form, name, label, placeholder, type = "text", disabled }: { form: ReturnType<typeof useForm>; name: string; label: string; placeholder?: string; type?: string; disabled?: boolean }) {
  return (
    <FormField control={form.control} name={name} render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl><Input type={type} placeholder={placeholder} disabled={disabled} {...field} /></FormControl>
        <FormMessage />
      </FormItem>
    )} />
  );
}
