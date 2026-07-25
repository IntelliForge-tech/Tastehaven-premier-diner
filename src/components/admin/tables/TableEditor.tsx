import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { tableSchema, TABLE_SHAPES, type TableFormValues } from "@/components/admin/tables/table-schema";
import { Button } from "@/components/common/Button";
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { createTable, updateTable } from "@/services/tables.service";
import type { RestaurantTable } from "@/services/tables.service";
import type { Floor } from "@/services/floors.service";

interface TableEditorProps {
  floors: Floor[];
  defaultFloorId?: string;
  table?: RestaurantTable;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TableEditor({ floors, defaultFloorId, table, onSuccess, onCancel }: TableEditorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMountedRef = useRef(true);
  useEffect(() => () => { isMountedRef.current = false; }, []);

  const isEdit = !!table;

  const form = useForm<TableFormValues>({
    resolver: zodResolver(tableSchema),
    defaultValues: table
      ? {
          floorId: table.floorId,
          tableNumber: table.tableNumber,
          tableName: table.tableName ?? "",
          capacity: table.capacity,
          minGuests: table.minGuests ?? undefined,
          maxGuests: table.maxGuests ?? undefined,
          shape: table.shape,
          positionX: table.positionX,
          positionY: table.positionY,
          rotation: table.rotation,
          notes: table.notes ?? "",
          isActive: table.isActive,
        }
      : {
          floorId: defaultFloorId ?? (floors[0]?.id ?? ""),
          tableNumber: "",
          tableName: "",
          capacity: 4,
          shape: "square",
          positionX: 100,
          positionY: 100,
          rotation: 0,
          notes: "",
          isActive: true,
        },
    mode: "onTouched",
  });

  async function onSubmit(values: TableFormValues) {
    setIsSubmitting(true);
    try {
      if (isEdit && table) {
        const result = await updateTable({
          id: table.id,
          floorId: values.floorId,
          tableNumber: values.tableNumber,
          tableName: values.tableName || null,
          capacity: values.capacity,
          minGuests: values.minGuests ?? null,
          maxGuests: values.maxGuests ?? null,
          shape: values.shape,
          positionX: values.positionX,
          positionY: values.positionY,
          rotation: values.rotation,
          notes: values.notes || null,
          isActive: values.isActive,
        });
        if (!result.success) { toast.error(result.error.message); return; }
        toast.success("Table updated.");
      } else {
        const result = await createTable({
          floorId: values.floorId,
          tableNumber: values.tableNumber,
          tableName: values.tableName || null,
          capacity: values.capacity,
          minGuests: values.minGuests ?? null,
          maxGuests: values.maxGuests ?? null,
          shape: values.shape,
          positionX: values.positionX,
          positionY: values.positionY,
          rotation: values.rotation,
          notes: values.notes || null,
          isActive: values.isActive,
        });
        if (!result.success) { toast.error(result.error.message); return; }
        toast.success("Table created.");
      }
      onSuccess();
    } finally {
      if (isMountedRef.current) setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField control={form.control} name="floorId" render={({ field }) => (
            <FormItem>
              <FormLabel>Floor <span className="text-destructive">*</span></FormLabel>
              <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select floor" /></SelectTrigger></FormControl>
                <SelectContent>
                  {floors.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="tableNumber" render={({ field }) => (
            <FormItem>
              <FormLabel>Table Number <span className="text-destructive">*</span></FormLabel>
              <FormControl><Input placeholder="1, A1, T-01…" disabled={isSubmitting} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="tableName" render={({ field }) => (
            <FormItem>
              <FormLabel>Table Name</FormLabel>
              <FormControl><Input placeholder="Window Seat, Bar…" disabled={isSubmitting} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="shape" render={({ field }) => (
            <FormItem>
              <FormLabel>Shape <span className="text-destructive">*</span></FormLabel>
              <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  {TABLE_SHAPES.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="capacity" render={({ field }) => (
            <FormItem>
              <FormLabel>Capacity <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input type="number" min={1} max={50} disabled={isSubmitting}
                  {...field} onChange={(e) => field.onChange(e.target.valueAsNumber)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="minGuests" render={({ field }) => (
            <FormItem>
              <FormLabel>Min Guests</FormLabel>
              <FormControl>
                <Input type="number" min={1} placeholder="Optional" disabled={isSubmitting}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value ? e.target.valueAsNumber : null)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="maxGuests" render={({ field }) => (
            <FormItem>
              <FormLabel>Max Guests</FormLabel>
              <FormControl>
                <Input type="number" min={1} placeholder="Optional" disabled={isSubmitting}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value ? e.target.valueAsNumber : null)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="rotation" render={({ field }) => (
            <FormItem>
              <FormLabel>Rotation (°)</FormLabel>
              <FormControl>
                <Input type="number" min={0} max={360} disabled={isSubmitting}
                  {...field} onChange={(e) => field.onChange(e.target.valueAsNumber)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl><Textarea placeholder="Any special notes for this table…" rows={2} disabled={isSubmitting} {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="isActive" render={({ field }) => (
          <FormItem className="flex items-center gap-3 space-y-0 rounded-lg border border-border bg-muted/20 p-3">
            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} disabled={isSubmitting} /></FormControl>
            <div>
              <FormLabel className="cursor-pointer text-sm font-medium">Active</FormLabel>
              <FormDescription className="text-xs">Inactive tables are hidden from the floor view.</FormDescription>
            </div>
          </FormItem>
        )} />

        <div className="flex justify-end gap-3 border-t border-border pt-4">
          <Button type="button" variant="outline" disabled={isSubmitting} onClick={onCancel} className="px-4 py-2">Cancel</Button>
          <Button type="submit" variant="gold" disabled={isSubmitting} className="inline-flex items-center gap-2 px-5 py-2">
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isEdit ? "Save Changes" : "Create Table"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
