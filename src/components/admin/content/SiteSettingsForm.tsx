import { zodResolver } from "@hookform/resolvers/zod";
import {
  Globe,
  ImagePlus,
  Loader2,
  RotateCcw,
  Save,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  siteSettingsSchema,
  type SiteSettingsFormInput,
  type SiteSettingsFormValues,
} from "@/components/admin/content/site-settings-schema";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateSiteSettings, type AssetReplacements } from "@/hooks/useUpdateSiteSettings";
import type { SiteSettings, UpdateSiteSettingsInput } from "@/services/site-settings.service";

interface SiteSettingsFormProps {
  settings: SiteSettings;
  onSuccess: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

/**
 * Site Settings form — Phase 12C.
 *
 * Uses shadcn/ui Tabs to split the large field set into eight logical groups:
 * General, SEO, Open Graph, Branding, Analytics, Search Engine, PWA, and
 * Features. Follows the same React Hook Form + Zod + Sonner pattern as
 * HeroForm and AboutForm.
 */
export function SiteSettingsForm({ settings, onSuccess, onDirtyChange }: SiteSettingsFormProps) {
  const { updateItem, isSubmitting } = useUpdateSiteSettings();

  const toDefault = (s: SiteSettings): SiteSettingsFormInput => ({
    websiteName: s.websiteName,
    websiteTagline: s.websiteTagline ?? "",
    websiteDescription: s.websiteDescription ?? "",
    websiteUrl: s.websiteUrl ?? "",
    defaultLanguage: s.defaultLanguage,
    timezone: s.timezone,
    businessCurrency: s.businessCurrency,
    themeColor: s.themeColor ?? "",
    primaryBrandColor: s.primaryBrandColor ?? "",
    secondaryBrandColor: s.secondaryBrandColor ?? "",
    accentColor: s.accentColor ?? "",

    metaTitle: s.metaTitle,
    metaDescription: s.metaDescription,
    metaKeywords: s.metaKeywords ?? "",
    canonicalUrl: s.canonicalUrl ?? "",
    author: s.author ?? "",
    publisher: s.publisher ?? "",
    robotsMeta: s.robotsMeta,
    googleVerification: s.googleVerification ?? "",
    bingVerification: s.bingVerification ?? "",
    yandexVerification: s.yandexVerification ?? "",
    facebookAppId: s.facebookAppId ?? "",
    twitterUsername: s.twitterUsername ?? "",
    ogTitle: s.ogTitle ?? "",
    ogDescription: s.ogDescription ?? "",
    ogImageUrl: s.ogImageUrl ?? "",
    twitterCardType: s.twitterCardType,
    ogSiteName: s.ogSiteName ?? "",
    ogType: s.ogType,
    ogLocale: s.ogLocale,

    faviconUrl: s.faviconUrl ?? "",
    appleTouchIconUrl: s.appleTouchIconUrl ?? "",
    browserThemeColor: s.browserThemeColor ?? "",
    backgroundColor: s.backgroundColor ?? "",

    googleAnalyticsId: s.googleAnalyticsId ?? "",
    googleAnalyticsEnabled: s.googleAnalyticsEnabled,
    googleTagManagerId: s.googleTagManagerId ?? "",
    googleTagManagerEnabled: s.googleTagManagerEnabled,
    metaPixelId: s.metaPixelId ?? "",
    metaPixelEnabled: s.metaPixelEnabled,
    microsoftClarityId: s.microsoftClarityId ?? "",
    microsoftClarityEnabled: s.microsoftClarityEnabled,
    hotjarId: s.hotjarId ?? "",
    hotjarEnabled: s.hotjarEnabled,
    customHeaderScript: s.customHeaderScript ?? "",
    customBodyScript: s.customBodyScript ?? "",
    customFooterScript: s.customFooterScript ?? "",

    allowIndexing: s.allowIndexing,
    generateRobotsTxt: s.generateRobotsTxt,
    generateSitemap: s.generateSitemap,
    enableStructuredData: s.enableStructuredData,
    enableLocalBusinessSchema: s.enableLocalBusinessSchema,
    enableFaqSchema: s.enableFaqSchema,
    enableOrganizationSchema: s.enableOrganizationSchema,

    enablePwa: s.enablePwa,
    pwaAppName: s.pwaAppName ?? "",
    pwaShortName: s.pwaShortName ?? "",
    pwaThemeColor: s.pwaThemeColor ?? "",
    pwaBackgroundColor: s.pwaBackgroundColor ?? "",
    pwaStartUrl: s.pwaStartUrl,
    pwaDisplayMode: s.pwaDisplayMode,
    pwaOfflineSupport: s.pwaOfflineSupport,

    enableAnimations: s.enableAnimations,
    enableScrollToTop: s.enableScrollToTop,
    enableCookieBanner: s.enableCookieBanner,
    enableNewsletter: s.enableNewsletter,
    enableReservationSystem: s.enableReservationSystem,
    enableContactForm: s.enableContactForm,
    enableGallery: s.enableGallery,
    enableTestimonials: s.enableTestimonials,
    enableChefSection: s.enableChefSection,
    enableOffers: s.enableOffers,

    maintenanceMode: s.maintenanceMode,
    maintenanceTitle: s.maintenanceTitle ?? "",
    maintenanceMessage: s.maintenanceMessage ?? "",
    maintenanceImageUrl: s.maintenanceImageUrl ?? "",
    maintenanceExpectedReturn: s.maintenanceExpectedReturn ?? "",
    allowSearchEnginesDuringMaintenance: s.allowSearchEnginesDuringMaintenance,

    faviconFile: null,
    faviconCleared: false,
    appleTouchIconFile: null,
    appleTouchIconCleared: false,
    ogImageFile: null,
    ogImageCleared: false,
    maintenanceImageFile: null,
    maintenanceImageCleared: false,
  });

  const form = useForm<SiteSettingsFormInput, unknown, SiteSettingsFormValues>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: toDefault(settings),
    mode: "onTouched",
  });

  useEffect(() => {
    form.reset(toDefault(settings));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  const isDirty = form.formState.isDirty;
  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  async function onSubmit(values: SiteSettingsFormValues) {
    const assets: AssetReplacements = {
      faviconFile: values.faviconFile ?? null,
      faviconCleared: values.faviconCleared ?? false,
      appleTouchIconFile: values.appleTouchIconFile ?? null,
      appleTouchIconCleared: values.appleTouchIconCleared ?? false,
      ogImageFile: values.ogImageFile ?? null,
      ogImageCleared: values.ogImageCleared ?? false,
      maintenanceImageFile: values.maintenanceImageFile ?? null,
      maintenanceImageCleared: values.maintenanceImageCleared ?? false,
    };

    // Build the input, stripping asset file fields.
    const input: UpdateSiteSettingsInput = {
      websiteName: values.websiteName,
      websiteTagline: values.websiteTagline?.trim() || null,
      websiteDescription: values.websiteDescription?.trim() || null,
      websiteUrl: values.websiteUrl?.trim() || null,
      defaultLanguage: values.defaultLanguage?.trim() || "en",
      timezone: values.timezone?.trim() || "UTC",
      businessCurrency: values.businessCurrency?.trim() || "USD",
      themeColor: values.themeColor?.trim() || null,
      primaryBrandColor: values.primaryBrandColor?.trim() || null,
      secondaryBrandColor: values.secondaryBrandColor?.trim() || null,
      accentColor: values.accentColor?.trim() || null,

      metaTitle: values.metaTitle,
      metaDescription: values.metaDescription,
      metaKeywords: values.metaKeywords?.trim() || null,
      canonicalUrl: values.canonicalUrl?.trim() || null,
      author: values.author?.trim() || null,
      publisher: values.publisher?.trim() || null,
      robotsMeta: values.robotsMeta?.trim() || "index, follow",
      googleVerification: values.googleVerification?.trim() || null,
      bingVerification: values.bingVerification?.trim() || null,
      yandexVerification: values.yandexVerification?.trim() || null,
      facebookAppId: values.facebookAppId?.trim() || null,
      twitterUsername: values.twitterUsername?.trim() || null,
      ogTitle: values.ogTitle?.trim() || null,
      ogDescription: values.ogDescription?.trim() || null,
      // ogImageUrl resolved by updateItem via assets
      ogImageUrl: settings.ogImageUrl,
      twitterCardType: values.twitterCardType?.trim() || "summary_large_image",
      ogSiteName: values.ogSiteName?.trim() || null,
      ogType: values.ogType?.trim() || "website",
      ogLocale: values.ogLocale?.trim() || "en_US",

      // resolved by updateItem
      faviconUrl: settings.faviconUrl,
      appleTouchIconUrl: settings.appleTouchIconUrl,
      browserThemeColor: values.browserThemeColor?.trim() || null,
      backgroundColor: values.backgroundColor?.trim() || null,

      googleAnalyticsId: values.googleAnalyticsId?.trim() || null,
      googleAnalyticsEnabled: values.googleAnalyticsEnabled,
      googleTagManagerId: values.googleTagManagerId?.trim() || null,
      googleTagManagerEnabled: values.googleTagManagerEnabled,
      metaPixelId: values.metaPixelId?.trim() || null,
      metaPixelEnabled: values.metaPixelEnabled,
      microsoftClarityId: values.microsoftClarityId?.trim() || null,
      microsoftClarityEnabled: values.microsoftClarityEnabled,
      hotjarId: values.hotjarId?.trim() || null,
      hotjarEnabled: values.hotjarEnabled,
      customHeaderScript: values.customHeaderScript?.trim() || null,
      customBodyScript: values.customBodyScript?.trim() || null,
      customFooterScript: values.customFooterScript?.trim() || null,

      allowIndexing: values.allowIndexing,
      generateRobotsTxt: values.generateRobotsTxt,
      generateSitemap: values.generateSitemap,
      enableStructuredData: values.enableStructuredData,
      enableLocalBusinessSchema: values.enableLocalBusinessSchema,
      enableFaqSchema: values.enableFaqSchema,
      enableOrganizationSchema: values.enableOrganizationSchema,

      enablePwa: values.enablePwa,
      pwaAppName: values.pwaAppName?.trim() || null,
      pwaShortName: values.pwaShortName?.trim() || null,
      pwaThemeColor: values.pwaThemeColor?.trim() || null,
      pwaBackgroundColor: values.pwaBackgroundColor?.trim() || null,
      pwaStartUrl: values.pwaStartUrl?.trim() || "/",
      pwaDisplayMode: values.pwaDisplayMode?.trim() || "standalone",
      pwaOfflineSupport: values.pwaOfflineSupport,

      enableAnimations: values.enableAnimations,
      enableScrollToTop: values.enableScrollToTop,
      enableCookieBanner: values.enableCookieBanner,
      enableNewsletter: values.enableNewsletter,
      enableReservationSystem: values.enableReservationSystem,
      enableContactForm: values.enableContactForm,
      enableGallery: values.enableGallery,
      enableTestimonials: values.enableTestimonials,
      enableChefSection: values.enableChefSection,
      enableOffers: values.enableOffers,

      maintenanceMode: values.maintenanceMode,
      maintenanceTitle: values.maintenanceTitle?.trim() || null,
      maintenanceMessage: values.maintenanceMessage?.trim() || null,
      // maintenanceImageUrl resolved by updateItem
      maintenanceImageUrl: settings.maintenanceImageUrl,
      maintenanceExpectedReturn: values.maintenanceExpectedReturn?.trim() || null,
      allowSearchEnginesDuringMaintenance: values.allowSearchEnginesDuringMaintenance,
    };

    const result = await updateItem(input, assets, settings);
    if (!result.success) {
      toast.error(result.error.message);
      return;
    }
    toast.success("Site settings updated.");
    onSuccess();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-6 flex h-auto flex-wrap gap-1 bg-transparent p-0">
            {TABS.map((t) => (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className="rounded-full border border-border px-3 py-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary"
              >
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── General ─────────────────────────────────────────── */}
          <TabsContent value="general" className="space-y-5">
            <SectionHeading>Website Identity</SectionHeading>
            <TwoCol>
              <TextField form={form} name="websiteName" label="Website Name" required disabled={isSubmitting} />
              <TextField form={form} name="websiteTagline" label="Tagline" disabled={isSubmitting} />
            </TwoCol>
            <TextField form={form} name="websiteDescription" label="Description" disabled={isSubmitting} multiline />
            <TwoCol>
              <TextField form={form} name="websiteUrl" label="Website URL" placeholder="https://tastehaven.co" disabled={isSubmitting} />
              <TextField form={form} name="defaultLanguage" label="Language" placeholder="en" disabled={isSubmitting} />
            </TwoCol>
            <TwoCol>
              <TextField form={form} name="timezone" label="Timezone" placeholder="America/Los_Angeles" disabled={isSubmitting} />
              <TextField form={form} name="businessCurrency" label="Currency" placeholder="USD" disabled={isSubmitting} />
            </TwoCol>
            <SectionHeading>Brand Colors</SectionHeading>
            <p className="text-xs text-muted-foreground">CSS color values (hex, rgb, hsl, or named colors).</p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <TextField form={form} name="primaryBrandColor" label="Primary" placeholder="#D4AF37" disabled={isSubmitting} />
              <TextField form={form} name="secondaryBrandColor" label="Secondary" placeholder="#1a1a1a" disabled={isSubmitting} />
              <TextField form={form} name="accentColor" label="Accent" placeholder="#F5F5DC" disabled={isSubmitting} />
              <TextField form={form} name="themeColor" label="Theme" placeholder="#0a0a0a" disabled={isSubmitting} />
            </div>
          </TabsContent>

          {/* ── SEO ─────────────────────────────────────────────── */}
          <TabsContent value="seo" className="space-y-5">
            <SectionHeading>Core SEO</SectionHeading>
            <TextField form={form} name="metaTitle" label="Default Meta Title" required disabled={isSubmitting}
              desc="Max 60 characters. Shown in browser tab and search results." />
            <TextField form={form} name="metaDescription" label="Default Meta Description" required disabled={isSubmitting} multiline
              desc="Max 160 characters. Shown in search result snippets." />
            <TextField form={form} name="metaKeywords" label="Meta Keywords" placeholder="restaurant, dining, San Francisco" disabled={isSubmitting} />
            <TwoCol>
              <TextField form={form} name="canonicalUrl" label="Canonical URL" placeholder="https://tastehaven.co" disabled={isSubmitting} />
              <TextField form={form} name="robotsMeta" label="Robots Meta" placeholder="index, follow" disabled={isSubmitting} />
            </TwoCol>
            <TwoCol>
              <TextField form={form} name="author" label="Author" disabled={isSubmitting} />
              <TextField form={form} name="publisher" label="Publisher" disabled={isSubmitting} />
            </TwoCol>
            <SectionHeading>Social Media SEO</SectionHeading>
            <TwoCol>
              <TextField form={form} name="twitterUsername" label="Twitter/X Username" placeholder="@tastehaven" disabled={isSubmitting} />
              <TextField form={form} name="facebookAppId" label="Facebook App ID" disabled={isSubmitting} />
            </TwoCol>
            <SectionHeading>Search Engine Verification</SectionHeading>
            <TwoCol>
              <TextField form={form} name="googleVerification" label="Google Verification Code" disabled={isSubmitting} />
              <TextField form={form} name="bingVerification" label="Bing Verification Code" disabled={isSubmitting} />
            </TwoCol>
            <TextField form={form} name="yandexVerification" label="Yandex Verification Code" disabled={isSubmitting} />
          </TabsContent>

          {/* ── Open Graph ──────────────────────────────────────── */}
          <TabsContent value="og" className="space-y-5">
            <SectionHeading>Open Graph / Social Sharing</SectionHeading>
            <TwoCol>
              <TextField form={form} name="ogTitle" label="OG Title" disabled={isSubmitting} />
              <TextField form={form} name="ogSiteName" label="OG Site Name" disabled={isSubmitting} />
            </TwoCol>
            <TextField form={form} name="ogDescription" label="OG Description" disabled={isSubmitting} multiline />
            <TwoCol>
              <TextField form={form} name="ogType" label="OG Type" placeholder="website" disabled={isSubmitting} />
              <TextField form={form} name="ogLocale" label="OG Locale" placeholder="en_US" disabled={isSubmitting} />
            </TwoCol>
            <TwoCol>
              <TextField form={form} name="twitterCardType" label="Twitter Card Type" placeholder="summary_large_image" disabled={isSubmitting} />
            </TwoCol>
            <SectionHeading>OG Image</SectionHeading>
            <AssetUploadField
              form={form}
              urlFieldName="ogImageUrl"
              fileFieldName="ogImageFile"
              clearedFieldName="ogImageCleared"
              label="Open Graph Image"
              existingUrl={settings.ogImageUrl}
              desc="Recommended: 1200×630 px. Shown when sharing on Facebook, Twitter, etc."
              disabled={isSubmitting}
            />
          </TabsContent>

          {/* ── Branding ────────────────────────────────────────── */}
          <TabsContent value="branding" className="space-y-5">
            <SectionHeading>Favicon</SectionHeading>
            <AssetUploadField
              form={form}
              urlFieldName="faviconUrl"
              fileFieldName="faviconFile"
              clearedFieldName="faviconCleared"
              label="Favicon"
              existingUrl={settings.faviconUrl}
              desc="ICO, PNG, or SVG · Recommended: 32×32 or 64×64 px."
              disabled={isSubmitting}
            />
            <SectionHeading>Apple / Mobile Icons</SectionHeading>
            <AssetUploadField
              form={form}
              urlFieldName="appleTouchIconUrl"
              fileFieldName="appleTouchIconFile"
              clearedFieldName="appleTouchIconCleared"
              label="Apple Touch Icon"
              existingUrl={settings.appleTouchIconUrl}
              desc="PNG · Recommended: 180×180 px."
              disabled={isSubmitting}
            />
            <SectionHeading>Browser Theme</SectionHeading>
            <TwoCol>
              <TextField form={form} name="browserThemeColor" label="Browser Theme Color" placeholder="#0a0a0a" disabled={isSubmitting}
                desc="Chrome address bar color on Android." />
              <TextField form={form} name="backgroundColor" label="Background Color" placeholder="#0a0a0a" disabled={isSubmitting}
                desc="Splash screen background color." />
            </TwoCol>
          </TabsContent>

          {/* ── Analytics ───────────────────────────────────────── */}
          <TabsContent value="analytics" className="space-y-5">
            <SectionHeading>Analytics & Tracking</SectionHeading>
            <AnalyticsRow form={form} idName="googleAnalyticsId" enabledName="googleAnalyticsEnabled"
              label="Google Analytics" placeholder="G-XXXXXXXXXX" disabled={isSubmitting} />
            <AnalyticsRow form={form} idName="googleTagManagerId" enabledName="googleTagManagerEnabled"
              label="Google Tag Manager" placeholder="GTM-XXXXXXX" disabled={isSubmitting} />
            <AnalyticsRow form={form} idName="metaPixelId" enabledName="metaPixelEnabled"
              label="Meta Pixel" placeholder="XXXXXXXXXXXXXXXXXX" disabled={isSubmitting} />
            <AnalyticsRow form={form} idName="microsoftClarityId" enabledName="microsoftClarityEnabled"
              label="Microsoft Clarity" placeholder="xxxxxxxxxx" disabled={isSubmitting} />
            <AnalyticsRow form={form} idName="hotjarId" enabledName="hotjarEnabled"
              label="Hotjar" placeholder="XXXXXXX" disabled={isSubmitting} />
            <SectionHeading>Custom Scripts</SectionHeading>
            <p className="text-xs text-muted-foreground">Raw HTML snippets injected at the specified position. Use with caution.</p>
            <TextField form={form} name="customHeaderScript" label="Header Script" placeholder="<!-- inside <head> -->" disabled={isSubmitting} multiline />
            <TextField form={form} name="customBodyScript" label="Body Script (top)" placeholder="<!-- after <body> -->" disabled={isSubmitting} multiline />
            <TextField form={form} name="customFooterScript" label="Footer Script" placeholder="<!-- before </body> -->" disabled={isSubmitting} multiline />
          </TabsContent>

          {/* ── Search Engine ───────────────────────────────────── */}
          <TabsContent value="search" className="space-y-4">
            <SectionHeading>Crawling & Indexing</SectionHeading>
            <ToggleRow form={form} name="allowIndexing" label="Allow Indexing" desc="Sets robots meta to index, follow when on." disabled={isSubmitting} />
            <ToggleRow form={form} name="generateRobotsTxt" label="Generate robots.txt" desc="Automatically serve a /robots.txt file." disabled={isSubmitting} />
            <ToggleRow form={form} name="generateSitemap" label="Generate sitemap.xml" desc="Automatically serve a /sitemap.xml file." disabled={isSubmitting} />
            <SectionHeading>Structured Data</SectionHeading>
            <ToggleRow form={form} name="enableStructuredData" label="Enable Structured Data" desc="Inject JSON-LD into page head." disabled={isSubmitting} />
            <ToggleRow form={form} name="enableLocalBusinessSchema" label="Local Business Schema" disabled={isSubmitting} />
            <ToggleRow form={form} name="enableOrganizationSchema" label="Organization Schema" disabled={isSubmitting} />
            <ToggleRow form={form} name="enableFaqSchema" label="FAQ Schema (when FAQ section is active)" disabled={isSubmitting} />
          </TabsContent>

          {/* ── PWA ─────────────────────────────────────────────── */}
          <TabsContent value="pwa" className="space-y-5">
            <SectionHeading>Progressive Web App</SectionHeading>
            <ToggleRow form={form} name="enablePwa" label="Enable PWA" desc="Generates a web manifest and service worker." disabled={isSubmitting} />
            <TwoCol>
              <TextField form={form} name="pwaAppName" label="App Name" placeholder="Taste Haven" disabled={isSubmitting} />
              <TextField form={form} name="pwaShortName" label="Short Name" placeholder="Haven" disabled={isSubmitting} />
            </TwoCol>
            <TwoCol>
              <TextField form={form} name="pwaThemeColor" label="Theme Color" placeholder="#0a0a0a" disabled={isSubmitting} />
              <TextField form={form} name="pwaBackgroundColor" label="Background Color" placeholder="#0a0a0a" disabled={isSubmitting} />
            </TwoCol>
            <TwoCol>
              <TextField form={form} name="pwaStartUrl" label="Start URL" placeholder="/" disabled={isSubmitting} />
              <TextField form={form} name="pwaDisplayMode" label="Display Mode" placeholder="standalone" disabled={isSubmitting}
                desc="standalone, fullscreen, minimal-ui, or browser." />
            </TwoCol>
            <ToggleRow form={form} name="pwaOfflineSupport" label="Offline Support" desc="Caches key assets for offline browsing." disabled={isSubmitting} />
          </TabsContent>

          {/* ── Features ────────────────────────────────────────── */}
          <TabsContent value="features" className="space-y-4">
            <SectionHeading>Global Section Toggles</SectionHeading>
            <p className="text-xs text-muted-foreground">Hide entire homepage sections without deleting their content.</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <ToggleRow form={form} name="enableAnimations" label="Animations" disabled={isSubmitting} />
              <ToggleRow form={form} name="enableScrollToTop" label="Scroll to Top Button" disabled={isSubmitting} />
              <ToggleRow form={form} name="enableCookieBanner" label="Cookie Banner" disabled={isSubmitting} />
              <ToggleRow form={form} name="enableNewsletter" label="Newsletter (Footer)" disabled={isSubmitting} />
              <ToggleRow form={form} name="enableReservationSystem" label="Reservation System" disabled={isSubmitting} />
              <ToggleRow form={form} name="enableContactForm" label="Contact Form" disabled={isSubmitting} />
              <ToggleRow form={form} name="enableGallery" label="Gallery Section" disabled={isSubmitting} />
              <ToggleRow form={form} name="enableTestimonials" label="Testimonials Section" disabled={isSubmitting} />
              <ToggleRow form={form} name="enableChefSection" label="Chefs Section" disabled={isSubmitting} />
              <ToggleRow form={form} name="enableOffers" label="Offers Section" disabled={isSubmitting} />
            </div>

            <SectionHeading>Maintenance Mode</SectionHeading>
            <ToggleRow form={form} name="maintenanceMode" label="Enable Maintenance Mode"
              desc="Replaces the public website with the maintenance page." disabled={isSubmitting} />
            <TwoCol>
              <TextField form={form} name="maintenanceTitle" label="Maintenance Title" placeholder="We'll be back soon" disabled={isSubmitting} />
              <TextField form={form} name="maintenanceExpectedReturn" label="Expected Return Time" placeholder="Monday 9 AM PST" disabled={isSubmitting} />
            </TwoCol>
            <TextField form={form} name="maintenanceMessage" label="Maintenance Message" multiline disabled={isSubmitting} />
            <ToggleRow form={form} name="allowSearchEnginesDuringMaintenance"
              label="Allow Search Engines During Maintenance" disabled={isSubmitting} />
            <SectionHeading>Maintenance Image</SectionHeading>
            <AssetUploadField
              form={form}
              urlFieldName="maintenanceImageUrl"
              fileFieldName="maintenanceImageFile"
              clearedFieldName="maintenanceImageCleared"
              label="Maintenance Page Image"
              existingUrl={settings.maintenanceImageUrl}
              desc="Background or illustration shown on the maintenance page."
              disabled={isSubmitting}
            />
          </TabsContent>
        </Tabs>

        {/* ── Actions ─────────────────────────────────────────────── */}
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
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? (
              <><Loader2 className="size-4 animate-spin" aria-hidden="true" />Saving…</>
            ) : (
              <><Save className="size-4" aria-hidden="true" />Save Changes</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// ── Tab config ────────────────────────────────────────────────────────────

const TABS = [
  { value: "general", label: "General" },
  { value: "seo", label: "SEO" },
  { value: "og", label: "Open Graph" },
  { value: "branding", label: "Branding" },
  { value: "analytics", label: "Analytics" },
  { value: "search", label: "Search Engine" },
  { value: "pwa", label: "PWA" },
  { value: "features", label: "Features" },
];

// ── Sub-components ────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </h3>
  );
}

function TwoCol({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>;
}

import type { UseFormReturn } from "react-hook-form";
import type React from "react";

interface TextFieldProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  multiline?: boolean;
  desc?: string;
}

function TextField({ form, name, label, placeholder, required, disabled, multiline, desc }: TextFieldProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel htmlFor={`ss-${name}`}>
            {label}{required && <span aria-hidden="true" className="ml-0.5 text-destructive">*</span>}
          </FormLabel>
          <FormControl>
            {multiline ? (
              <Textarea id={`ss-${name}`} placeholder={placeholder} rows={3} disabled={disabled} {...field} />
            ) : (
              <Input id={`ss-${name}`} placeholder={placeholder} disabled={disabled} {...field} />
            )}
          </FormControl>
          {desc && <FormDescription className="text-xs">{desc}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

interface ToggleRowProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
  name: string;
  label: string;
  desc?: string;
  disabled?: boolean;
}

function ToggleRow({ form, name, label, desc, disabled }: ToggleRowProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-center gap-3 space-y-0 rounded-lg border border-border bg-muted/30 p-3">
          <FormControl>
            <Switch id={`ss-${name}`} checked={field.value} onCheckedChange={field.onChange} disabled={disabled} />
          </FormControl>
          <div>
            <FormLabel htmlFor={`ss-${name}`} className="cursor-pointer text-sm font-medium">{label}</FormLabel>
            {desc && <FormDescription className="text-xs">{desc}</FormDescription>}
          </div>
        </FormItem>
      )}
    />
  );
}

interface AnalyticsRowProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
  idName: string;
  enabledName: string;
  label: string;
  placeholder?: string;
  disabled?: boolean;
}

function AnalyticsRow({ form, idName, enabledName, label, placeholder, disabled }: AnalyticsRowProps) {
  return (
    <div className="rounded-xl border border-border bg-card/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <FormField
          control={form.control}
          name={enabledName}
          render={({ field }) => (
            <FormItem className="flex items-center gap-2 space-y-0">
              <FormLabel className="text-xs text-muted-foreground">Enabled</FormLabel>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} disabled={disabled} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
      <TextField form={form} name={idName} label="Tracking ID" placeholder={placeholder} disabled={disabled} />
    </div>
  );
}

// ── AssetUploadField ──────────────────────────────────────────────────────

interface AssetUploadFieldProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
  urlFieldName: string;
  fileFieldName: string;
  clearedFieldName: string;
  label: string;
  existingUrl: string | null;
  desc?: string;
  disabled?: boolean;
}

function AssetUploadField({
  form,
  urlFieldName: _urlFieldName,
  fileFieldName,
  clearedFieldName,
  label,
  existingUrl,
  desc,
  disabled,
}: AssetUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const fileValue = form.watch(fileFieldName) as File | null | undefined;
  const isCleared = form.watch(clearedFieldName) as boolean;
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!fileValue) { setPreviewUrl(null); return; }
    const url = URL.createObjectURL(fileValue);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [fileValue]);

  const displayUrl = previewUrl ?? (isCleared ? null : existingUrl);
  const hasNewFile = !!fileValue;

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">{label}</p>
      {displayUrl ? (
        <div className="relative inline-block">
          <img src={displayUrl} alt="" className="max-h-24 rounded-lg border border-border object-contain" />
          <div className="absolute bottom-1 left-1 rounded bg-background/80 px-1.5 py-0.5 text-[10px] text-foreground">
            {hasNewFile ? "New" : "Current"}
          </div>
          {hasNewFile && (
            <button
              type="button"
              onClick={() => { form.setValue(fileFieldName, null, { shouldDirty: true }); if (inputRef.current) inputRef.current.value = ""; }}
              disabled={disabled}
              aria-label="Remove selected file"
              className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-background shadow border border-border hover:bg-secondary"
            >
              <X className="size-3" />
            </button>
          )}
        </div>
      ) : (
        <div className="flex h-20 w-32 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-muted-foreground">
          <Globe className="size-6" />
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <label
          className={[
            "inline-flex cursor-pointer items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary",
            disabled ? "cursor-not-allowed opacity-50" : "",
          ].join(" ")}
        >
          <ImagePlus className="size-3" />
          {displayUrl ? "Replace" : "Upload"}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            disabled={disabled}
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              form.setValue(fileFieldName, file, { shouldDirty: true });
              form.setValue(clearedFieldName, false, { shouldDirty: true });
            }}
          />
        </label>
        {existingUrl && !hasNewFile && !isCleared && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => { form.setValue(fileFieldName, null, { shouldDirty: true }); form.setValue(clearedFieldName, true, { shouldDirty: true }); }}
            className="inline-flex items-center gap-2 rounded-full border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="size-3" />Remove
          </button>
        )}
        {isCleared && !hasNewFile && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => form.setValue(clearedFieldName, false, { shouldDirty: true })}
            className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RotateCcw className="size-3" />Restore
          </button>
        )}
      </div>
      {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
    </div>
  );
}
