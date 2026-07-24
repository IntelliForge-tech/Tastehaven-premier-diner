import type { UseFormReturn } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { SocialLinksFormValues } from "@/components/admin/content/contact-social/contact-social-schema";

interface SocialLinkRowProps {
  index: number;
  form: UseFormReturn<SocialLinksFormValues>;
  disabled?: boolean;
}

export function SocialLinkRow({ index, form, disabled }: SocialLinkRowProps) {
  const link = form.watch(`links.${index}`);
  const isEnabled = link.enabled;

  return (
    <div
      className={[
        "grid grid-cols-1 gap-3 rounded-xl border p-4 transition-colors sm:grid-cols-[1fr_auto_auto]",
        isEnabled
          ? "border-primary/30 bg-primary/5"
          : "border-border bg-muted/20",
      ].join(" ")}
    >
      {/* Platform label + icon */}
      <div className="flex items-center gap-3">
        <div
          className={[
            "grid size-9 shrink-0 place-items-center rounded-full text-lg",
            isEnabled ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
          ].join(" ")}
          aria-hidden="true"
        >
          <i className={`fa-brands ${link.faIcon}`} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">{link.label}</p>
          <FormField
            control={form.control}
            name={`links.${index}.url`}
            render={({ field }) => (
              <FormItem className="mt-1 space-y-0">
                <FormLabel className="sr-only">URL for {link.label}</FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder={`https://${link.platform}.com/tastehaven`}
                    disabled={disabled}
                    className="h-8 text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Open in new tab toggle */}
      <FormField
        control={form.control}
        name={`links.${index}.openInNewTab`}
        render={({ field }) => (
          <FormItem className="flex flex-row items-center gap-2 space-y-0 sm:flex-col sm:items-center sm:justify-center">
            <FormLabel className="cursor-pointer text-xs text-muted-foreground sm:text-center">
              New tab
            </FormLabel>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={disabled}
                aria-label={`Open ${link.label} in new tab`}
              />
            </FormControl>
          </FormItem>
        )}
      />

      {/* Enabled toggle */}
      <FormField
        control={form.control}
        name={`links.${index}.enabled`}
        render={({ field }) => (
          <FormItem className="flex flex-row items-center gap-2 space-y-0 sm:flex-col sm:items-center sm:justify-center">
            <FormLabel className="cursor-pointer text-xs text-muted-foreground sm:text-center">
              Enabled
            </FormLabel>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={disabled}
                aria-label={`Enable ${link.label}`}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}
