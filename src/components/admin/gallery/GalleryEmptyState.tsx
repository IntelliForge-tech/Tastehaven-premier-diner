import { Image } from "lucide-react";

import { EmptyState } from "@/components/admin/dashboard/EmptyState";

/**
 * Gallery's empty state. A named component per this phase's spec, but
 * deliberately just gallery-specific copy/icon on top of the existing
 * generic EmptyState (already used by Menu and every CMS placeholder
 * page) rather than a second implementation of the same icon+title+
 * description markup.
 */
export function GalleryEmptyState() {
  return (
    <EmptyState
      icon={Image}
      title="No gallery images yet."
      description="Images will appear here once they are uploaded."
    />
  );
}
