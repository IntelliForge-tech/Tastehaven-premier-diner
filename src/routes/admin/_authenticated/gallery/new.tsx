import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { GalleryForm } from "@/components/admin/gallery/GalleryForm";
import { Breadcrumbs } from "@/components/admin/page/Breadcrumbs";
import { PageHeader } from "@/components/admin/page/PageHeader";
import { SectionContainer } from "@/components/admin/page/SectionContainer";

export const Route = createFileRoute("/admin/_authenticated/gallery/new")({
  component: AdminNewGalleryItemPage,
  head: () => ({
    meta: [{ title: "Upload Image — Admin — Taste Haven" }],
  }),
});

/**
 * Dedicated create route (Phase 7B), sibling to /admin/gallery rather
 * than nested under it — same reasoning as menu/new.tsx: this page owns
 * only navigation (where "back"/"after success" go), GalleryForm owns
 * the form itself, and useCreateGalleryItem owns everything Supabase-
 * related.
 */
function AdminNewGalleryItemPage() {
  const navigate = useNavigate();

  function goToGalleryList() {
    navigate({ to: "/admin/gallery" });
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs page="Upload Image" />
      <PageHeader title="Upload Image" description="Add a new photo to your restaurant gallery." />
      <SectionContainer>
        <GalleryForm onSuccess={goToGalleryList} onCancel={goToGalleryList} />
      </SectionContainer>
    </div>
  );
}
