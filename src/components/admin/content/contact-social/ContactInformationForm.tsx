import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, RotateCcw, Save } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  contactInformationSchema,
  type ContactInformationFormValues,
} from "@/components/admin/content/contact-social/contact-social-schema";
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
import { useUpdateContactInformation } from "@/hooks/useUpdateContactInformation";
import type { ContactInformation } from "@/services/contact-information.service";

interface ContactInformationFormProps {
  data: ContactInformation;
  onSuccess: () => void;
  onDirtyChange?: (dirty: boolean) => void;
}

function buildDefaults(data: ContactInformation): ContactInformationFormValues {
  return {
    primaryPhone: data.primaryPhone,
    secondaryPhone: data.secondaryPhone ?? "",
    whatsappNumber: data.whatsappNumber ?? "",
    reservationPhone: data.reservationPhone ?? "",
    primaryEmail: data.primaryEmail,
    secondaryEmail: data.secondaryEmail ?? "",
    customerSupportEmail: data.customerSupportEmail ?? "",
    streetAddress: data.streetAddress,
    area: data.area ?? "",
    city: data.city,
    state: data.state ?? "",
    country: data.country ?? "",
    postalCode: data.postalCode ?? "",
    googleMapsUrl: data.googleMapsUrl ?? "",
    websiteUrl: data.websiteUrl ?? "",
    businessHoursNote: data.businessHoursNote ?? "",
    emergencyContact: data.emergencyContact ?? "",
    customerServiceMessage: data.customerServiceMessage ?? "",
    responseTimeMessage: data.responseTimeMessage ?? "",
    liveChatEnabled: data.liveChatEnabled,
    reservationContactEnabled: data.reservationContactEnabled,
    whatsappButtonEnabled: data.whatsappButtonEnabled,
    callButtonEnabled: data.callButtonEnabled,
    emailButtonEnabled: data.emailButtonEnabled,
  };
}

export function ContactInformationForm({
  data,
  onSuccess,
  onDirtyChange,
}: ContactInformationFormProps) {
  const { isSubmitting, submit } = useUpdateContactInformation();

  const form = useForm<ContactInformationFormValues>({
    resolver: zodResolver(contactInformationSchema),
    defaultValues: buildDefaults(data),
    mode: "onTouched",
  });

  useEffect(() => { form.reset(buildDefaults(data)); }, [data.updatedAt]);

  const isDirty = form.formState.isDirty;
  useEffect(() => { onDirtyChange?.(isDirty); }, [isDirty, onDirtyChange]);

  async function onSubmit(values: ContactInformationFormValues) {
    const result = await submit({
      primaryPhone: values.primaryPhone,
      secondaryPhone: values.secondaryPhone || null,
      whatsappNumber: values.whatsappNumber || null,
      reservationPhone: values.reservationPhone || null,
      primaryEmail: values.primaryEmail,
      secondaryEmail: values.secondaryEmail || null,
      customerSupportEmail: values.customerSupportEmail || null,
      streetAddress: values.streetAddress,
      area: values.area || null,
      city: values.city,
      state: values.state || null,
      country: values.country || null,
      postalCode: values.postalCode || null,
      googleMapsUrl: values.googleMapsUrl || null,
      websiteUrl: values.websiteUrl || null,
      businessHoursNote: values.businessHoursNote || null,
      emergencyContact: values.emergencyContact || null,
      customerServiceMessage: values.customerServiceMessage || null,
      responseTimeMessage: values.responseTimeMessage || null,
      liveChatEnabled: values.liveChatEnabled,
      reservationContactEnabled: values.reservationContactEnabled,
      whatsappButtonEnabled: values.whatsappButtonEnabled,
      callButtonEnabled: values.callButtonEnabled,
      emailButtonEnabled: values.emailButtonEnabled,
    });

    if (!result.success) { toast.error(result.error.message); return; }
    toast.success("Contact information saved.");
    onSuccess();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-8">

        {/* ── Phone ─────────────────────────────────────────────────── */}
        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Phone Numbers
          </legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField form={form} name="primaryPhone" label="Primary Phone" placeholder="+1 (415) 555 0138" required disabled={isSubmitting} />
            <TextField form={form} name="secondaryPhone" label="Secondary Phone" placeholder="+1 (415) 555 0200" disabled={isSubmitting} />
            <TextField form={form} name="whatsappNumber" label="WhatsApp Number" placeholder="+1 (415) 555 0138" disabled={isSubmitting} />
            <TextField form={form} name="reservationPhone" label="Reservation Phone" placeholder="+1 (415) 555 0199" disabled={isSubmitting} />
          </div>
        </fieldset>

        {/* ── Email ─────────────────────────────────────────────────── */}
        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Email Addresses
          </legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField form={form} name="primaryEmail" label="Primary Email" placeholder="hello@tastehaven.co" type="email" required disabled={isSubmitting} />
            <TextField form={form} name="secondaryEmail" label="Secondary Email" placeholder="info@tastehaven.co" type="email" disabled={isSubmitting} />
            <TextField form={form} name="customerSupportEmail" label="Customer Support Email" placeholder="support@tastehaven.co" type="email" disabled={isSubmitting} />
          </div>
        </fieldset>

        {/* ── Address ───────────────────────────────────────────────── */}
        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Address
          </legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <TextField form={form} name="streetAddress" label="Street Address" placeholder="42 Amber Street" required disabled={isSubmitting} />
            </div>
            <TextField form={form} name="area" label="Area / Neighborhood" placeholder="Downtown District" disabled={isSubmitting} />
            <TextField form={form} name="city" label="City" placeholder="San Francisco" required disabled={isSubmitting} />
            <TextField form={form} name="state" label="State / Province" placeholder="California" disabled={isSubmitting} />
            <TextField form={form} name="country" label="Country" placeholder="United States" disabled={isSubmitting} />
            <TextField form={form} name="postalCode" label="Postal Code" placeholder="94103" disabled={isSubmitting} />
          </div>
        </fieldset>

        {/* ── Links ─────────────────────────────────────────────────── */}
        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Links
          </legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField form={form} name="googleMapsUrl" label="Google Maps URL" placeholder="https://maps.google.com/..." type="url" disabled={isSubmitting} />
            <TextField form={form} name="websiteUrl" label="Website URL" placeholder="https://tastehaven.co" type="url" disabled={isSubmitting} />
          </div>
        </fieldset>

        {/* ── Messaging ─────────────────────────────────────────────── */}
        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Messaging & Notes
          </legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField form={form} name="businessHoursNote" label="Business Hours Note" placeholder="Mon–Sun, 5 PM – 12 AM" disabled={isSubmitting} />
            <TextField form={form} name="emergencyContact" label="Emergency Contact" placeholder="+1 (415) 555 0911" disabled={isSubmitting} />
          </div>
          <TextAreaField form={form} name="customerServiceMessage" label="Customer Service Message" placeholder="We're here to help! Reach us anytime." disabled={isSubmitting} />
          <TextField form={form} name="responseTimeMessage" label="Response Time Message" placeholder="We typically respond within 24 hours." disabled={isSubmitting} />
        </fieldset>

        {/* ── Feature Toggles ───────────────────────────────────────── */}
        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Feature Toggles
          </legend>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {([
              { name: "callButtonEnabled" as const, label: "Call Button", description: "Show a click-to-call button." },
              { name: "emailButtonEnabled" as const, label: "Email Button", description: "Show a mailto email button." },
              { name: "whatsappButtonEnabled" as const, label: "WhatsApp Button", description: "Show a WhatsApp contact button." },
              { name: "reservationContactEnabled" as const, label: "Reservation Contact", description: "Show reservation phone / link." },
              { name: "liveChatEnabled" as const, label: "Live Chat", description: "Indicate live chat availability." },
            ] as const).map(({ name, label, description }) => (
              <FormField
                key={name}
                control={form.control}
                name={name}
                render={({ field }) => (
                  <FormItem className="flex items-start gap-3 space-y-0 rounded-lg border border-border bg-muted/20 p-3">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                        id={`toggle-${name}`}
                      />
                    </FormControl>
                    <div>
                      <FormLabel htmlFor={`toggle-${name}`} className="cursor-pointer text-sm font-medium leading-none">
                        {label}
                      </FormLabel>
                      <FormDescription className="mt-0.5 text-xs">{description}</FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            ))}
          </div>
        </fieldset>

        {/* ── Actions ───────────────────────────────────────────────── */}
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
              <><Save className="size-4" aria-hidden="true" />Save Contact Info</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// ── Field helpers ────────────────────────────────────────────────────────────

interface TextFieldProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
}

function TextField({ form, name, label, placeholder, type = "text", required, disabled }: TextFieldProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }: { field: Record<string, unknown> }) => (
        <FormItem>
          <FormLabel htmlFor={`ci-${name}`}>
            {label}{required && <span className="ml-0.5 text-destructive" aria-hidden="true">*</span>}
          </FormLabel>
          <FormControl>
            <Input id={`ci-${name}`} type={type} placeholder={placeholder} disabled={disabled} {...field as object} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

interface TextAreaFieldProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
  name: string;
  label: string;
  placeholder?: string;
  disabled?: boolean;
}

function TextAreaField({ form, name, label, placeholder, disabled }: TextAreaFieldProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }: { field: Record<string, unknown> }) => (
        <FormItem>
          <FormLabel htmlFor={`ci-${name}`}>{label}</FormLabel>
          <FormControl>
            <Textarea id={`ci-${name}`} placeholder={placeholder} rows={3} disabled={disabled} {...field as object} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
