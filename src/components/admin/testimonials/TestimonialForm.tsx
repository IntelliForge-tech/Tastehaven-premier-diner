import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  testimonialSchema,
  type TestimonialFormValues,
} from "@/components/admin/testimonials/testimonial-schema";
import { Button } from "@/components/common/Button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateTestimonial } from "@/hooks/useCreateTestimonial";
import { useUpdateTestimonial } from "@/hooks/useUpdateTestimonial";

interface TestimonialFormDefaultValues {
  customerName: string;
  roleOrLocation: string;
  rating: number;
  reviewText: string;
  isFeatured: boolean;
  isVisible: boolean;
  displayOrder: number;
}

interface TestimonialFormProps {
  /**
   * "create" (default) inserts a new testimonial via useCreateTestimonial().
   * "edit" updates an existing one via useUpdateTestimonial() — requires
   * `testimonialId` and typically `defaultValues` too.
   */
  mode?: "create" | "edit";
  /** Required when mode is "edit". */
  testimonialId?: string;
  /** Pre-fills the form. Used when mode="edit". */
  defaultValues?: TestimonialFormDefaultValues;
  /** Called after a successful save — the page decides where "back" goes. */
  onSuccess: () => void;
  /** Called when the admin cancels. No save is attempted. */
  onCancel: () => void;
}

/**
 * Create/Edit Testimonial form. Talks only to useCreateTestimonial() or
 * useUpdateTestimonial() — never Supabase, never testimonials.service.ts
 * directly. One component for both modes, mirroring MenuForm and
 * GalleryForm's mode pattern: only which hook gets called and what the
 * form starts populated with differ between modes.
 */
export function TestimonialForm({
  mode = "create",
  testimonialId,
  defaultValues,
  onSuccess,
  onCancel,
}: TestimonialFormProps) {
  const { isSubmitting: isCreating, submit } = useCreateTestimonial();
  const { isSubmitting: isUpdating, update } = useUpdateTestimonial();
  const isSubmitting = mode === "edit" ? isUpdating : isCreating;

  const form = useForm<TestimonialFormValues>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      customerName: defaultValues?.customerName ?? "",
      roleOrLocation: defaultValues?.roleOrLocation ?? "",
      rating: defaultValues?.rating ?? (undefined as unknown as number),
      reviewText: defaultValues?.reviewText ?? "",
      isFeatured: defaultValues?.isFeatured ?? false,
      isVisible: defaultValues?.isVisible ?? true,
      displayOrder: defaultValues?.displayOrder ?? 0,
    },
    mode: "onTouched",
  });

  async function onSubmit(values: TestimonialFormValues) {
    const input = {
      customerName: values.customerName,
      roleOrLocation: values.roleOrLocation?.trim() === "" ? null : (values.roleOrLocation ?? null),
      rating: values.rating,
      reviewText: values.reviewText,
      isFeatured: values.isFeatured,
      isVisible: values.isVisible,
      displayOrder: values.displayOrder,
    };

    const result =
      mode === "edit" && testimonialId
        ? await update(testimonialId, input)
        : await submit(input);

    if (!result.success) {
      toast.error(result.error.message);
      return;
    }

    toast.success(
      mode === "edit"
        ? "Testimonial updated."
        : `Testimonial from "${values.customerName}" added.`,
    );
    onSuccess();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        aria-label={mode === "edit" ? "Edit testimonial" : "Add testimonial"}
        className="space-y-5"
      >
        {/* Customer Name */}
        <FormField
          control={form.control}
          name="customerName"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="testimonial-customer-name">
                Customer Name <span aria-hidden="true">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  id="testimonial-customer-name"
                  autoFocus
                  placeholder="Jane Smith"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Role / Location */}
        <FormField
          control={form.control}
          name="roleOrLocation"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="testimonial-role">Role / Location</FormLabel>
              <FormControl>
                <Input
                  id="testimonial-role"
                  placeholder="e.g. Food Blogger, New York"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Rating */}
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="testimonial-rating">
                Rating <span aria-hidden="true">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  id="testimonial-rating"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={5}
                  step={1}
                  placeholder="5"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Review Text */}
        <FormField
          control={form.control}
          name="reviewText"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="testimonial-review">
                Review <span aria-hidden="true">*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  id="testimonial-review"
                  rows={4}
                  placeholder="Share what this customer said…"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Display Order */}
        <FormField
          control={form.control}
          name="displayOrder"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="testimonial-display-order">Display Order</FormLabel>
              <FormControl>
                <Input
                  id="testimonial-display-order"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1}
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Checkboxes */}
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
          <FormField
            control={form.control}
            name="isFeatured"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox
                    id="testimonial-featured"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormLabel htmlFor="testimonial-featured" className="cursor-pointer font-normal">
                  Featured
                </FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isVisible"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox
                    id="testimonial-visible"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormLabel htmlFor="testimonial-visible" className="cursor-pointer font-normal">
                  Visible
                </FormLabel>
              </FormItem>
            )}
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={onCancel}
            className="px-5 py-2.5"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="gold"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            aria-live="polite"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Saving…
              </>
            ) : mode === "edit" ? (
              "Save Changes"
            ) : (
              "Add Testimonial"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
