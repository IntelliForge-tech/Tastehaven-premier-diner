import { createFileRoute, useBlocker } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Loader2, Plus, RotateCcw, Save, Settings as SettingsIcon, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  restaurantInfoSchema,
  openingHoursSchema,
  socialLinksSchema,
  type RestaurantInfoFormValues,
  type OpeningHoursFormValues,
  type SocialLinksFormValues,
} from "@/components/admin/settings/settings-schema";
import { Breadcrumbs } from "@/components/admin/page/Breadcrumbs";
import { PageHeader } from "@/components/admin/page/PageHeader";
import { SectionContainer } from "@/components/admin/page/SectionContainer";
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
import { useRestaurantSettings } from "@/hooks/useRestaurantSettings";
import {
  updateRestaurantInfo,
  upsertOpeningHours,
  upsertSocialLinks,
  type OpeningHoursEntry,
  type SocialLinkEntry,
} from "@/services/settings.service";

export const Route = createFileRoute("/admin/_authenticated/settings")({
  component: AdminSettingsPage,
  head: () => ({
    meta: [{ title: "Restaurant Settings — Admin — Taste Haven" }],
  }),
});

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Build a full 7-day array from the DB rows, filling gaps with defaults.
function buildHoursDefaults(rows: OpeningHoursEntry[]) {
  return Array.from({ length: 7 }, (_, day) => {
    const found = rows.find((r) => r.dayOfWeek === day);
    return {
      dayOfWeek: day,
      openTime: found?.openTime ?? "17:00",
      closeTime: found?.closeTime ?? "23:00",
      isClosed: found?.isClosed ?? (day === 0), // Sunday closed by default
    };
  });
}

function buildSocialDefaults(rows: SocialLinkEntry[]) {
  return rows.map((l) => ({
    id: l.id,
    platform: l.platform,
    url: l.url,
    icon: l.icon,
    isActive: l.isActive,
  }));
}

function AdminSettingsPage() {
  const { data, isLoading, error, refetch } = useRestaurantSettings();
  const isDirtyRef = useRef(false);

  useBlocker({
    blockerFn: () =>
      window.confirm("You have unsaved settings changes. Leave anyway?"),
    condition: isDirtyRef.current,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs page="Restaurant Settings" />
        <PageHeader title="Restaurant Settings" description="Manage your restaurant's general information." />
        <SettingsSkeleton />
      </div>
    );
  }

  if (error && error.code !== "not_found") {
    return (
      <div className="space-y-6">
        <Breadcrumbs page="Restaurant Settings" />
        <PageHeader title="Restaurant Settings" description="Manage your restaurant's general information." />
        <SectionContainer>
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="grid size-11 place-items-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="size-5" />
            </div>
            <p className="text-sm font-medium">Couldn&apos;t load settings</p>
            <p className="max-w-xs text-sm text-muted-foreground">{error.message}</p>
            <Button type="button" variant="outline-gold" onClick={refetch} className="mt-1 px-4 py-2">Try again</Button>
          </div>
        </SectionContainer>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs page="Restaurant Settings" />
      <PageHeader
        title="Restaurant Settings"
        description="Manage your restaurant's name, contact details, hours, and social links."
      />

      <RestaurantInfoForm
        defaultValues={{
          name: data?.restaurantInfo.name ?? "",
          tagline: data?.restaurantInfo.tagline ?? "",
          description: data?.restaurantInfo.description ?? "",
          address: data?.restaurantInfo.address ?? "",
          phone: data?.restaurantInfo.phone ?? "",
          email: data?.restaurantInfo.email ?? "",
        }}
        onSuccess={refetch}
        onDirtyChange={(d) => { isDirtyRef.current = d; }}
      />

      <OpeningHoursForm
        defaultValues={{ hours: buildHoursDefaults(data?.openingHours ?? []) }}
        onSuccess={refetch}
        onDirtyChange={(d) => { isDirtyRef.current = isDirtyRef.current || d; }}
      />

      <SocialLinksForm
        defaultValues={{ links: buildSocialDefaults(data?.socialLinks ?? []) }}
        onSuccess={refetch}
        onDirtyChange={(d) => { isDirtyRef.current = isDirtyRef.current || d; }}
      />
    </div>
  );
}

// ── Restaurant Info Form ─────────────────────────────────────────────────────

function RestaurantInfoForm({
  defaultValues,
  onSuccess,
  onDirtyChange,
}: {
  defaultValues: RestaurantInfoFormValues;
  onSuccess: () => void;
  onDirtyChange?: (d: boolean) => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RestaurantInfoFormValues>({
    resolver: zodResolver(restaurantInfoSchema),
    defaultValues,
    mode: "onTouched",
  });

  useEffect(() => { form.reset(defaultValues); }, [JSON.stringify(defaultValues)]);

  const isDirty = form.formState.isDirty;
  useEffect(() => { onDirtyChange?.(isDirty); }, [isDirty]);

  async function onSubmit(values: RestaurantInfoFormValues) {
    setIsSubmitting(true);
    const result = await updateRestaurantInfo({
      name: values.name,
      tagline: values.tagline || null,
      description: values.description || null,
      address: values.address || null,
      phone: values.phone || null,
      email: values.email || null,
    });
    setIsSubmitting(false);
    if (!result.success) { toast.error(result.error.message); return; }
    toast.success("Restaurant info saved.");
    onSuccess();
  }

  return (
    <div>
      <h3 className="mb-3 text-sm font-medium text-muted-foreground">General Information</h3>
      <SectionContainer>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel htmlFor="ri-name">Restaurant Name <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input id="ri-name" placeholder="Taste Haven" disabled={isSubmitting} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="tagline" render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel htmlFor="ri-tagline">Tagline</FormLabel>
                  <FormControl><Input id="ri-tagline" placeholder="A haven for the curious palate." disabled={isSubmitting} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel htmlFor="ri-desc">Description</FormLabel>
                  <FormControl><Textarea id="ri-desc" rows={3} placeholder="Short description for footer / SEO…" disabled={isSubmitting} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel htmlFor="ri-address">Address</FormLabel>
                  <FormControl><Input id="ri-address" placeholder="42 Amber Street, Downtown District, CA 94103" disabled={isSubmitting} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="ri-phone">Phone</FormLabel>
                  <FormControl><Input id="ri-phone" type="tel" placeholder="+1 (415) 555 0138" disabled={isSubmitting} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="ri-email">Email</FormLabel>
                  <FormControl><Input id="ri-email" type="email" placeholder="hello@tastehaven.co" disabled={isSubmitting} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="flex justify-end gap-3 border-t border-border pt-4">
              <Button type="button" variant="outline" disabled={isSubmitting || !isDirty} onClick={() => form.reset()} className="inline-flex items-center gap-2 px-4 py-2">
                <RotateCcw className="size-4" /> Reset
              </Button>
              <Button type="submit" variant="gold" disabled={isSubmitting || !isDirty} className="inline-flex items-center gap-2 px-5 py-2">
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                <Save className="size-4" /> Save Info
              </Button>
            </div>
          </form>
        </Form>
      </SectionContainer>
    </div>
  );
}

// ── Opening Hours Form ───────────────────────────────────────────────────────

function OpeningHoursForm({
  defaultValues,
  onSuccess,
  onDirtyChange,
}: {
  defaultValues: OpeningHoursFormValues;
  onSuccess: () => void;
  onDirtyChange?: (d: boolean) => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OpeningHoursFormValues>({
    resolver: zodResolver(openingHoursSchema),
    defaultValues,
    mode: "onTouched",
  });

  const { fields } = useFieldArray({ control: form.control, name: "hours" });
  const isDirty = form.formState.isDirty;
  useEffect(() => { onDirtyChange?.(isDirty); }, [isDirty]);
  useEffect(() => { form.reset(defaultValues); }, [JSON.stringify(defaultValues)]);

  async function onSubmit(values: OpeningHoursFormValues) {
    setIsSubmitting(true);
    const result = await upsertOpeningHours(values.hours);
    setIsSubmitting(false);
    if (!result.success) { toast.error(result.error.message); return; }
    toast.success("Opening hours saved.");
    onSuccess();
  }

  const closedValues = form.watch("hours").map((h) => h.isClosed);

  return (
    <div>
      <h3 className="mb-3 text-sm font-medium text-muted-foreground">Opening Hours</h3>
      <SectionContainer>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-[100px_1fr] items-center gap-4 sm:grid-cols-[140px_1fr]">
                <span className="text-sm font-medium text-foreground">{DAY_NAMES[index]}</span>
                <div className="flex flex-wrap items-center gap-3">
                  <FormField control={form.control} name={`hours.${index}.isClosed`} render={({ field: f }) => (
                    <FormItem className="flex items-center gap-2 space-y-0">
                      <FormControl><Switch checked={f.value} onCheckedChange={f.onChange} disabled={isSubmitting} id={`closed-${index}`} /></FormControl>
                      <FormLabel htmlFor={`closed-${index}`} className="cursor-pointer text-xs text-muted-foreground">Closed</FormLabel>
                    </FormItem>
                  )} />

                  {!closedValues[index] && (
                    <>
                      <FormField control={form.control} name={`hours.${index}.openTime`} render={({ field: f }) => (
                        <FormItem className="space-y-0">
                          <FormLabel className="sr-only">Open time</FormLabel>
                          <FormControl>
                            <Input type="time" disabled={isSubmitting} className="w-32 text-sm" value={f.value ?? ""} onChange={f.onChange} />
                          </FormControl>
                        </FormItem>
                      )} />
                      <span className="text-muted-foreground">–</span>
                      <FormField control={form.control} name={`hours.${index}.closeTime`} render={({ field: f }) => (
                        <FormItem className="space-y-0">
                          <FormLabel className="sr-only">Close time</FormLabel>
                          <FormControl>
                            <Input type="time" disabled={isSubmitting} className="w-32 text-sm" value={f.value ?? ""} onChange={f.onChange} />
                          </FormControl>
                        </FormItem>
                      )} />
                    </>
                  )}
                </div>
              </div>
            ))}

            <div className="flex justify-end gap-3 border-t border-border pt-4">
              <Button type="button" variant="outline" disabled={isSubmitting || !isDirty} onClick={() => form.reset()} className="inline-flex items-center gap-2 px-4 py-2">
                <RotateCcw className="size-4" /> Reset
              </Button>
              <Button type="submit" variant="gold" disabled={isSubmitting || !isDirty} className="inline-flex items-center gap-2 px-5 py-2">
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                <Save className="size-4" /> Save Hours
              </Button>
            </div>
          </form>
        </Form>
      </SectionContainer>
    </div>
  );
}

// ── Social Links Form ────────────────────────────────────────────────────────

function SocialLinksForm({
  defaultValues,
  onSuccess,
  onDirtyChange,
}: {
  defaultValues: SocialLinksFormValues;
  onSuccess: () => void;
  onDirtyChange?: (d: boolean) => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SocialLinksFormValues>({
    resolver: zodResolver(socialLinksSchema),
    defaultValues,
    mode: "onTouched",
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "links" });
  const isDirty = form.formState.isDirty;
  useEffect(() => { onDirtyChange?.(isDirty); }, [isDirty]);
  useEffect(() => { form.reset(defaultValues); }, [JSON.stringify(defaultValues)]);

  async function onSubmit(values: SocialLinksFormValues) {
    setIsSubmitting(true);
    const result = await upsertSocialLinks(values.links);
    setIsSubmitting(false);
    if (!result.success) { toast.error(result.error.message); return; }
    toast.success("Social links saved.");
    onSuccess();
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Social Links</h3>
        {fields.length < 10 && (
          <Button type="button" variant="outline" onClick={() => append({ platform: "", url: "", icon: null, isActive: true })} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs">
            <Plus className="size-3.5" /> Add Link
          </Button>
        )}
      </div>
      <SectionContainer>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-3">
            {fields.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">No social links yet. Click "Add Link" to add your first.</p>
            )}
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-[1fr_1fr_auto_auto] items-start gap-3 rounded-lg border border-border bg-muted/20 p-3">
                <FormField control={form.control} name={`links.${index}.platform`} render={({ field: f }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs">Platform</FormLabel>
                    <FormControl><Input placeholder="instagram" disabled={isSubmitting} className="text-sm" {...f} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name={`links.${index}.url`} render={({ field: f }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs">URL</FormLabel>
                    <FormControl><Input type="url" placeholder="https://instagram.com/…" disabled={isSubmitting} className="text-sm" {...f} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name={`links.${index}.isActive`} render={({ field: f }) => (
                  <FormItem className="flex flex-col items-center gap-1 space-y-0 pt-1">
                    <FormLabel className="text-xs text-muted-foreground">Active</FormLabel>
                    <FormControl><Switch checked={f.value} onCheckedChange={f.onChange} disabled={isSubmitting} /></FormControl>
                  </FormItem>
                )} />
                <button type="button" onClick={() => remove(index)} disabled={isSubmitting} aria-label="Remove link" className="mt-6 grid size-8 place-items-center rounded-full border border-destructive/30 text-destructive hover:bg-destructive/10">
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}

            <div className="flex justify-end gap-3 border-t border-border pt-4">
              <Button type="button" variant="outline" disabled={isSubmitting || !isDirty} onClick={() => form.reset()} className="inline-flex items-center gap-2 px-4 py-2">
                <RotateCcw className="size-4" /> Reset
              </Button>
              <Button type="submit" variant="gold" disabled={isSubmitting || !isDirty} className="inline-flex items-center gap-2 px-5 py-2">
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                <Save className="size-4" /> Save Links
              </Button>
            </div>
          </form>
        </Form>
      </SectionContainer>
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="h-4 w-40 rounded bg-muted" />
          {[1, 2, 3].map((j) => (
            <div key={j} className="space-y-2">
              <div className="h-3.5 w-28 rounded bg-muted" />
              <div className="h-10 w-full rounded-lg bg-muted" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
