import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";
import gallery4 from "@/assets/gallery-4.jpg";
import gallery5 from "@/assets/gallery-5.jpg";
import gallery6 from "@/assets/gallery-6.jpg";

export const GALLERY: string[] = [gallery1, gallery2, gallery3, gallery4, gallery5, gallery6];

/** Re-exported so other sections (e.g. About) can reuse the same interior shot without a duplicate import path. */
export { gallery1 };
