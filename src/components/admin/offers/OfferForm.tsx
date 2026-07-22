import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  offerSchema,
  type OfferFormInput,
  type OfferFormValues,
} from "@/components/admin/offers/offer-schema";
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
import { useCreateOffer } from "@/hooks/useCreateOffer";
import { useUpdateOffer } from "@/hooks/useUpdateOffer";

interface OfferFormDefaultValues {
  title: string;
  description: string;
  tag: string;
  icon: string;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  displayOrder: number;
}

type OfferFormProps =
  | {
      mode?: "create";
      defaultValues?: OfferFormDefaultValues;
      onSuccess: () => void;
      onCancel: () => void;
    }
  | {
      mode: "edit";
      /** The id of the offer being edited — passed to submit() in edit mode. */
      offerId: string;
      defaultValues: OfferFormDefaultValues;
      onSuccess: () => void;
      onCancel: () => void;
    };

/**
 * Create/Edit Offer form. Talks only to useCreateOffer() or
 * useUpdateOffer() depending on mode — never Supabase or
 * offers.service.ts directly. One component for both modes; same
 * discriminated-union props pattern as ChefForm.
 */
export function OfferForm(props: OfferFormProps) {
  const { onSuccess, onCancel } = props;
  const defaultValues = props.defaultValues;
  const { isSubmitting: isCreating, submit: submitCreate } = useCreateOffer();
  const { isSubmitting: isUpdating, submit: submitUpdate } = useUpdateOffer();
  const isSubmitting = isCreating || isUpdating;

  const form = useForm<OfferFormInput, unknown, OfferFormValues>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      tag: defaultValues?.tag ?? "",
      icon: defaultValues?.icon ?? "",
      validFrom: defaultValues?.validFrom ?? "",
      validUntil: defaultValues?.validUntil ?? "",
      isActive: defaultValues?.isActive ?? true,
      displayOrder: defaultValues?.displayOrder ?? 0,
    },
    mode: "onTouched",
  });

  async function onSubmit(values: OfferFormValues) {
    const input = {
      title: values.title,
      description: (values.description ?? "").trim() === "" ? null : (values.description ?? ""),
      tag: (values.tag ?? "").trim() === "" ? null : (values.tag ?? ""),
      icon: (values.icon ?? "").trim() === "" ? null : (values.icon ?? ""),
      validFrom: (values.validFrom ?? "").trim() === "" ? null : (values.validFrom ?? ""),
      validUntil: (values.validUntil ?? "").trim() === "" ? null : (values.validUntil ?? ""),
      isActive: values.isActive,
      displayOrder: values.displayOrder,
    };

    if (props.mode === "edit") {
      const result = await submitUpdate(props.offerId, input);
      if (!result.success) {
        toast.error(result.error.message);
        return;
      }
      toast.success("Offer updated successfully.");
      onSuccess();
      return;
    }

    const result = await submitCreate(input);
    if (!result.success) {
      toast.error(result.error.message);
      return;
    }
    toast.success("Offer created successfully.");
    onSuccess();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-6">
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Title <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Happy Hour Special"
                  autoFocus
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the offer…"
                  rows={3}
                  disabled={isSubmitting}
                  className="resize-y"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tag + Icon — side by side on sm+ */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="tag"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tag</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Limited Time" disabled={isSubmitting} {...field} />
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  Short label shown on the offer card.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Icon</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 🎉" disabled={isSubmitting} {...field} />
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  Emoji or icon identifier (not an image upload).
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Valid from / until — side by side on sm+ */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="validFrom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valid From</FormLabel>
                <FormControl>
                  <Input type="date" disabled={isSubmitting} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="validUntil"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valid Until</FormLabel>
                <FormControl>
                  <Input type="date" disabled={isSubmitting} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Display Order */}
        <FormField
          control={form.control}
          name="displayOrder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Order</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  step={1}
                  placeholder="0"
                  disabled={isSubmitting}
                  className="w-32"
                  {...field}
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                Lower numbers appear first. Defaults to 0.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Active */}
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start gap-3 space-y-0">
              <FormControl>
                <Checkbox
                  id="offer-is-active"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isSubmitting}
                />
              </FormControl>
              <div>
                <FormLabel htmlFor="offer-is-active" className="cursor-pointer font-normal">
                  Active
                </FormLabel>
                <p className="text-xs text-muted-foreground">
                  Inactive offers are hidden from site visitors.
                </p>
              </div>
            </FormItem>
          )}
        />

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
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Saving…
              </>
            ) : props.mode === "edit" ? (
              "Save Changes"
            ) : (
              "Create Offer"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
