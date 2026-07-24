import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, RotateCcw, Save } from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  socialLinksFormSchema,
  type SocialLinksFormValues,
} from "@/components/admin/content/contact-social/contact-social-schema";
import { SocialLinkRow } from "@/components/admin/content/contact-social/SocialLinkRow";
import { Button } from "@/components/common/Button";
import { Form } from "@/components/ui/form";
import { useUpdateContactSocialLinks } from "@/hooks/useUpdateContactSocialLinks";
import {
  buildDefaultSocialLinks,
  type SocialLinksData,
} from "@/services/social-links.service";

interface SocialLinksFormProps {
  data: SocialLinksData | null;
  onSuccess: () => void;
  onDirtyChange?: (dirty: boolean) => void;
}

function buildDefaults(data: SocialLinksData | null): SocialLinksFormValues {
  const links = data?.links ?? buildDefaultSocialLinks();
  return {
    links: links.map((l) => ({
      platform: l.platform,
      label: l.label,
      url: l.url,
      enabled: l.enabled,
      openInNewTab: l.openInNewTab,
      displayOrder: l.displayOrder,
      icon: l.icon,
      faIcon: l.faIcon,
    })),
  };
}

export function SocialLinksForm({ data, onSuccess, onDirtyChange }: SocialLinksFormProps) {
  const { isSubmitting, submit } = useUpdateContactSocialLinks();

  const form = useForm<SocialLinksFormValues>({
    resolver: zodResolver(socialLinksFormSchema),
    defaultValues: buildDefaults(data),
    mode: "onTouched",
  });

  const { fields } = useFieldArray({ control: form.control, name: "links" });

  useEffect(() => { form.reset(buildDefaults(data)); }, [data?.updatedAt]);

  const isDirty = form.formState.isDirty;
  useEffect(() => { onDirtyChange?.(isDirty); }, [isDirty, onDirtyChange]);

  async function onSubmit(values: SocialLinksFormValues) {
    const result = await submit({ links: values.links });
    if (!result.success) { toast.error(result.error.message); return; }
    toast.success("Social links saved.");
    onSuccess();
  }

  const enabledCount = form.watch("links").filter((l) => l.enabled && l.url).length;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {enabledCount} platform{enabledCount !== 1 ? "s" : ""} enabled.{" "}
            Toggle platforms on/off and enter their profile URLs.
          </p>
        </div>

        <div className="space-y-2">
          {fields.map((field, index) => (
            <SocialLinkRow
              key={field.id}
              index={index}
              form={form}
              disabled={isSubmitting}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting || !isDirty}
            onClick={() => form.reset()}
            className="inline-flex items-center gap-2 px-5 py-2.5"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Reset Changes
          </Button>
          <Button
            type="submit"
            variant="gold"
            disabled={isSubmitting || !isDirty}
            aria-busy={isSubmitting}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5"
          >
            {isSubmitting ? (
              <><Loader2 className="size-4 animate-spin" aria-hidden="true" />Saving…</>
            ) : (
              <><Save className="size-4" aria-hidden="true" />Save Social Links</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
