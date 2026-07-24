import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, RotateCcw, Save } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  footerSettingsSchema,
  type FooterSettingsFormValues,
} from "./footer-schema";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useUpdateFooterSettings } from "@/hooks/useUpdateFooterSettings";
import type { FooterSettings } from "@/services/footer.service";

interface FooterSettingsFormProps {
  settings: FooterSettings;
  onSuccess: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

export function FooterSettingsForm({
  settings,
  onSuccess,
  onDirtyChange,
}: FooterSettingsFormProps) {
  const { updateItem, isSubmitting } = useUpdateFooterSettings();

  const defaultValues: FooterSettingsFormValues = {
    restaurantName: settings.restaurantName ?? "Taste Haven",
    tagline: settings.tagline ?? "",
    shortDescription: settings.shortDescription ?? "",
    copyrightText: settings.copyrightText ?? "All rights reserved.",
    copyrightYearAuto: settings.copyrightYearAuto,
    copyrightYearManual: settings.copyrightYearManual ?? "",
    designedByText: settings.designedByText ?? "",
    designedByUrl: settings.designedByUrl ?? "",
    showLogo: settings.showLogo,
    showDescription: settings.showDescription,
    showQuickLinks: settings.showQuickLinks,
    showBusinessInfo: settings.showBusinessInfo,
    showNewsletter: settings.showNewsletter,
    showSocialIcons: settings.showSocialIcons,
    showLegal: settings.showLegal,
    showCopyright: settings.showCopyright,
    footerEnabled: settings.footerEnabled,
    newsletterEnabled: settings.newsletterEnabled,
    newsletterTitle: settings.newsletterTitle ?? "Newsletter",
    newsletterSubtitle: settings.newsletterSubtitle ?? "",
    newsletterPlaceholder: settings.newsletterPlaceholder ?? "you@email.com",
    newsletterButtonText: settings.newsletterButtonText ?? "Join",
    newsletterSuccessMsg: settings.newsletterSuccessMsg ?? "",
    newsletterErrorMsg: settings.newsletterErrorMsg ?? "",
    newsletterConsentText: settings.newsletterConsentText ?? "",
    socialIconSize: (settings.socialIconSize as "sm" | "md" | "lg") ?? "md",
    socialIconShape: (settings.socialIconShape as "circle" | "rounded" | "square") ?? "circle",
    socialIconStyle: (settings.socialIconStyle as "outline" | "filled" | "ghost") ?? "outline",
    socialIconAlignment: (settings.socialIconAlignment as "left" | "center" | "right") ?? "left",
    socialMaxIcons: settings.socialMaxIcons ?? 4,
    privacyPolicyUrl: settings.privacyPolicyUrl ?? "",
    termsUrl: settings.termsUrl ?? "",
    cookiesUrl: settings.cookiesUrl ?? "",
    refundUrl: settings.refundUrl ?? "",
    accessibilityStatement: settings.accessibilityStatement ?? "",
    disclaimer: settings.disclaimer ?? "",
    licenseText: settings.licenseText ?? "",
    footerLayout: (settings.footerLayout as "classic" | "modern" | "minimal") ?? "classic",
    backgroundColor: settings.backgroundColor ?? "",
    textColor: settings.textColor ?? "",
    accentColor: settings.accentColor ?? "",
    borderStyle: (settings.borderStyle as "solid" | "dashed" | "none") ?? "solid",
    showTopBorder: settings.showTopBorder,
    showDivider: settings.showDivider,
    containerWidth: (settings.containerWidth as "xl" | "2xl" | "4xl" | "6xl" | "7xl" | "full") ?? "7xl",
  };

  const form = useForm<FooterSettingsFormValues>({
    resolver: zodResolver(footerSettingsSchema),
    defaultValues,
    mode: "onTouched",
  });

  useEffect(() => {
    form.reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  useEffect(() => {
    onDirtyChange?.(form.formState.isDirty);
  }, [form.formState.isDirty, onDirtyChange]);

  const yearAuto = form.watch("copyrightYearAuto");
  const newsletterEnabled = form.watch("newsletterEnabled");

  async function onSubmit(values: FooterSettingsFormValues) {
    const result = await updateItem({
      restaurantName: values.restaurantName,
      tagline: values.tagline || null,
      shortDescription: values.shortDescription || null,
      copyrightText: values.copyrightText,
      copyrightYearAuto: values.copyrightYearAuto,
      copyrightYearManual: values.copyrightYearManual || null,
      designedByText: values.designedByText || null,
      designedByUrl: values.designedByUrl || null,
      showLogo: values.showLogo,
      showDescription: values.showDescription,
      showQuickLinks: values.showQuickLinks,
      showBusinessInfo: values.showBusinessInfo,
      showNewsletter: values.showNewsletter,
      showSocialIcons: values.showSocialIcons,
      showLegal: values.showLegal,
      showCopyright: values.showCopyright,
      footerEnabled: values.footerEnabled,
      newsletterEnabled: values.newsletterEnabled,
      newsletterTitle: values.newsletterTitle || null,
      newsletterSubtitle: values.newsletterSubtitle || null,
      newsletterPlaceholder: values.newsletterPlaceholder || null,
      newsletterButtonText: values.newsletterButtonText || null,
      newsletterSuccessMsg: values.newsletterSuccessMsg || null,
      newsletterErrorMsg: values.newsletterErrorMsg || null,
      newsletterConsentText: values.newsletterConsentText || null,
      socialIconSize: values.socialIconSize,
      socialIconShape: values.socialIconShape,
      socialIconStyle: values.socialIconStyle,
      socialIconAlignment: values.socialIconAlignment,
      socialMaxIcons: values.socialMaxIcons,
      privacyPolicyUrl: values.privacyPolicyUrl || null,
      termsUrl: values.termsUrl || null,
      cookiesUrl: values.cookiesUrl || null,
      refundUrl: values.refundUrl || null,
      accessibilityStatement: values.accessibilityStatement || null,
      disclaimer: values.disclaimer || null,
      licenseText: values.licenseText || null,
      footerLayout: values.footerLayout,
      backgroundColor: values.backgroundColor || null,
      textColor: values.textColor || null,
      accentColor: values.accentColor || null,
      borderStyle: values.borderStyle,
      showTopBorder: values.showTopBorder,
      showDivider: values.showDivider,
      containerWidth: values.containerWidth,
    });

    if (!result.success) {
      toast.error(result.error.message);
      return;
    }

    toast.success("Footer settings saved successfully.");
    form.reset(values);
    onSuccess();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-8">

        {/* ── Branding ────────────────────────────────────────────── */}
        <Section title="Branding">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <TF control={form.control} name="restaurantName" label="Restaurant Name *" placeholder="Taste Haven" max={100} />
            </div>
            <div className="sm:col-span-2">
              <TF control={form.control} name="tagline" label="Tagline" placeholder="Fresh ingredients, memorable experiences." max={200} />
            </div>
            <div className="sm:col-span-2">
              <FormField
                control={form.control}
                name="shortDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short Description</FormLabel>
                    <FormDescription>Shown under the logo in the footer.</FormDescription>
                    <FormControl>
                      <Textarea placeholder="Fresh ingredients, memorable experiences — since 2012." rows={2} maxLength={500} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <TF control={form.control} name="designedByText" label="Designed By Text" placeholder="Crafted with care in the Downtown District." max={200} />
            <TF control={form.control} name="designedByUrl" label="Designed By URL" placeholder="https://agency.co" max={500} />
          </div>
        </Section>

        <Separator />

        {/* ── Copyright ───────────────────────────────────────────── */}
        <Section title="Copyright">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <TF control={form.control} name="copyrightText" label="Copyright Text *" placeholder="All rights reserved." max={200} />
            </div>
            <Toggle control={form.control} name="copyrightYearAuto" label="Auto Year" description="Automatically uses the current year." />
            {!yearAuto && (
              <TF control={form.control} name="copyrightYearManual" label="Manual Year" placeholder="2024" max={4} />
            )}
          </div>
        </Section>

        <Separator />

        {/* ── Visibility ──────────────────────────────────────────── */}
        <Section title="Section Visibility">
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            <Toggle control={form.control} name="footerEnabled" label="Footer Enabled" />
            <Toggle control={form.control} name="showLogo" label="Show Logo" />
            <Toggle control={form.control} name="showDescription" label="Show Description" />
            <Toggle control={form.control} name="showQuickLinks" label="Show Quick Links" />
            <Toggle control={form.control} name="showBusinessInfo" label="Show Business Info" />
            <Toggle control={form.control} name="showNewsletter" label="Show Newsletter" />
            <Toggle control={form.control} name="showSocialIcons" label="Show Social Icons" />
            <Toggle control={form.control} name="showLegal" label="Show Legal Section" />
            <Toggle control={form.control} name="showCopyright" label="Show Copyright" />
          </div>
        </Section>

        <Separator />

        {/* ── Newsletter ──────────────────────────────────────────── */}
        <Section title="Newsletter">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Toggle control={form.control} name="newsletterEnabled" label="Newsletter Enabled" />
            </div>
            <TF control={form.control} name="newsletterTitle" label="Title" placeholder="Newsletter" max={100} disabled={!newsletterEnabled} />
            <TF control={form.control} name="newsletterButtonText" label="Button Text" placeholder="Join" max={50} disabled={!newsletterEnabled} />
            <div className="sm:col-span-2">
              <TF control={form.control} name="newsletterSubtitle" label="Subtitle" placeholder="Seasonal menus and private events, once a month." max={300} disabled={!newsletterEnabled} />
            </div>
            <TF control={form.control} name="newsletterPlaceholder" label="Input Placeholder" placeholder="you@email.com" max={100} disabled={!newsletterEnabled} />
            <TF control={form.control} name="newsletterSuccessMsg" label="Success Message" placeholder="Subscribed! Welcome." max={300} disabled={!newsletterEnabled} />
            <TF control={form.control} name="newsletterErrorMsg" label="Error Message" placeholder="Something went wrong. Please try again." max={300} disabled={!newsletterEnabled} />
            <div className="sm:col-span-2">
              <TF control={form.control} name="newsletterConsentText" label="Privacy Consent Text" placeholder="By subscribing you agree to our privacy policy." max={300} disabled={!newsletterEnabled} />
            </div>
          </div>
        </Section>

        <Separator />

        {/* ── Social Icons ────────────────────────────────────────── */}
        <Section title="Social Icons">
          <FormDescription className="mb-4 text-sm">
            Social links are read from the Social Links CMS. Configure display settings here.
          </FormDescription>
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
            <SelectField control={form.control} name="socialIconSize" label="Icon Size" options={[{ value: "sm", label: "Small" }, { value: "md", label: "Medium" }, { value: "lg", label: "Large" }]} />
            <SelectField control={form.control} name="socialIconShape" label="Icon Shape" options={[{ value: "circle", label: "Circle" }, { value: "rounded", label: "Rounded" }, { value: "square", label: "Square" }]} />
            <SelectField control={form.control} name="socialIconStyle" label="Icon Style" options={[{ value: "outline", label: "Outline" }, { value: "filled", label: "Filled" }, { value: "ghost", label: "Ghost" }]} />
            <SelectField control={form.control} name="socialIconAlignment" label="Alignment" options={[{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }]} />
            <FormField
              control={form.control}
              name="socialMaxIcons"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Icons Per Row</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      className="h-9"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Section>

        <Separator />

        {/* ── Legal ───────────────────────────────────────────────── */}
        <Section title="Legal Links">
          <div className="grid gap-5 sm:grid-cols-2">
            <TF control={form.control} name="privacyPolicyUrl" label="Privacy Policy URL" placeholder="https://tastehaven.co/privacy" max={500} />
            <TF control={form.control} name="termsUrl" label="Terms & Conditions URL" placeholder="https://tastehaven.co/terms" max={500} />
            <TF control={form.control} name="cookiesUrl" label="Cookies Policy URL" placeholder="https://tastehaven.co/cookies" max={500} />
            <TF control={form.control} name="refundUrl" label="Refund Policy URL" placeholder="https://tastehaven.co/refund" max={500} />
            <div className="sm:col-span-2">
              <FormField
                control={form.control}
                name="accessibilityStatement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Accessibility Statement</FormLabel>
                    <FormControl><Textarea rows={2} maxLength={300} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="sm:col-span-2">
              <FormField
                control={form.control}
                name="disclaimer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Disclaimer</FormLabel>
                    <FormControl><Textarea rows={2} maxLength={500} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="sm:col-span-2">
              <TF control={form.control} name="licenseText" label="License Text" placeholder="Content © 2024 Taste Haven." max={300} />
            </div>
          </div>
        </Section>

        <Separator />

        {/* ── Appearance ──────────────────────────────────────────── */}
        <Section title="Appearance">
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
            <SelectField control={form.control} name="footerLayout" label="Layout" options={[{ value: "classic", label: "Classic" }, { value: "modern", label: "Modern" }, { value: "minimal", label: "Minimal" }]} />
            <SelectField control={form.control} name="borderStyle" label="Border Style" options={[{ value: "solid", label: "Solid" }, { value: "dashed", label: "Dashed" }, { value: "none", label: "None" }]} />
            <SelectField control={form.control} name="containerWidth" label="Container Width" options={[{ value: "xl", label: "XL" }, { value: "2xl", label: "2XL" }, { value: "4xl", label: "4XL" }, { value: "6xl", label: "6XL" }, { value: "7xl", label: "7XL (default)" }, { value: "full", label: "Full Width" }]} />
            <TF control={form.control} name="backgroundColor" label="Background Color" placeholder="#0f0f0f or transparent" max={30} />
            <TF control={form.control} name="textColor" label="Text Color" placeholder="#a1a1aa" max={30} />
            <TF control={form.control} name="accentColor" label="Accent Color" placeholder="#d4af37" max={30} />
            <Toggle control={form.control} name="showTopBorder" label="Show Top Border" />
            <Toggle control={form.control} name="showDivider" label="Show Divider" />
          </div>
        </Section>

        {/* ── Actions ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between border-t border-border pt-6">
          <Button
            type="button"
            variant="outline-gold"
            onClick={() => form.reset(defaultValues)}
            disabled={isSubmitting || !form.formState.isDirty}
            className="gap-2"
          >
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
          <Button type="submit" variant="gold" disabled={isSubmitting} className="gap-2">
            {isSubmitting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Save className="size-3.5" />
            )}
            {isSubmitting ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// ── Reusable micro-components ─────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TF({ control, name, label, placeholder, max, description, disabled }: { control: any; name: any; label: string; placeholder?: string; max?: number; description?: string; disabled?: boolean }) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          {description && <FormDescription>{description}</FormDescription>}
          <FormControl>
            <Input placeholder={placeholder} maxLength={max} disabled={disabled} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Toggle({ control, name, label, description }: { control: any; name: any; label: string; description?: string }) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex items-center justify-between rounded-lg border border-border bg-card/40 px-4 py-3">
          <div>
            <FormLabel className="cursor-pointer text-sm font-normal">{label}</FormLabel>
            {description && <FormDescription className="text-xs">{description}</FormDescription>}
          </div>
          <FormControl>
            <Switch checked={field.value as boolean} onCheckedChange={field.onChange} />
          </FormControl>
        </FormItem>
      )}
    />
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SelectField({ control, name, label, options }: { control: any; name: any; label: string; options: { value: string; label: string }[] }) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <select
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={field.value as string}
              onChange={field.onChange}
            >
              {options.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
