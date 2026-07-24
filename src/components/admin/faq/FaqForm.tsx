import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { faqSchema, type FaqFormInput, type FaqFormValues } from "@/components/admin/faq/faq-schema";
import { Button } from "@/components/common/Button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useCreateFaq } from "@/hooks/useCreateFaq";
import { useUpdateFaq } from "@/hooks/useUpdateFaq";
import type { FaqItem } from "@/services/faq.service";

type FaqFormProps =
  | {
      mode: "create";
      nextDisplayOrder: number;
      onSuccess: () => void;
      onCancel: () => void;
    }
  | {
      mode: "edit";
      item: FaqItem;
      onSuccess: () => void;
      onCancel: () => void;
    };

export function FaqForm(props: FaqFormProps) {
  const { onSuccess, onCancel } = props;
  const { isSubmitting: isCreating, submit: create } = useCreateFaq();
  const { isSubmitting: isUpdating, submit: update } = useUpdateFaq();
  const isSubmitting = isCreating || isUpdating;

  const form = useForm<FaqFormInput, unknown, FaqFormValues>({
    resolver: zodResolver(faqSchema),
    defaultValues:
      props.mode === "edit"
        ? {
            question: props.item.question,
            answer: props.item.answer,
            displayOrder: props.item.displayOrder,
            isActive: props.item.isActive,
          }
        : {
            question: "",
            answer: "",
            displayOrder: props.nextDisplayOrder,
            isActive: true,
          },
    mode: "onTouched",
  });

  async function onSubmit(values: FaqFormValues) {
    if (props.mode === "create") {
      const result = await create({
        question: values.question,
        answer: values.answer,
        isActive: values.isActive,
        displayOrder: values.displayOrder,
      });
      if (!result.success) { toast.error(result.error.message); return; }
      toast.success("FAQ added.");
    } else {
      const result = await update({
        id: props.item.id,
        question: values.question,
        answer: values.answer,
        isActive: values.isActive,
        displayOrder: values.displayOrder,
      });
      if (!result.success) { toast.error(result.error.message); return; }
      toast.success("FAQ updated.");
    }
    onSuccess();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-5">
        <FormField
          control={form.control}
          name="question"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="faq-question">
                Question <span aria-hidden="true" className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input id="faq-question" placeholder="Do I need a reservation?" disabled={isSubmitting} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="answer"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="faq-answer">
                Answer <span aria-hidden="true" className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Textarea id="faq-answer" placeholder="Yes, reservations are recommended…" rows={4} disabled={isSubmitting} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="displayOrder"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="faq-order">Display Order</FormLabel>
                <FormControl>
                  <Input
                    id="faq-order"
                    type="number"
                    min={0}
                    disabled={isSubmitting}
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormDescription className="text-xs">Lower numbers appear first.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-col justify-end gap-2 pb-0.5">
                <FormLabel htmlFor="faq-active">Visible on site</FormLabel>
                <FormControl>
                  <Switch id="faq-active" checked={field.value} onCheckedChange={field.onChange} disabled={isSubmitting} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-3 border-t border-border pt-4">
          <Button type="button" variant="outline" disabled={isSubmitting} onClick={onCancel} className="px-4 py-2">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="gold"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2"
          >
            {isSubmitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {props.mode === "create" ? "Add FAQ" : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
