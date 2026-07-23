/**
 * Generated-style Supabase database types.
 *
 * This file is hand-authored to mirror the three approved migrations
 * (initial schema, RLS, storage) exactly, so the app has typed table access
 * from day one. Once the project is linked and reachable from this
 * environment, replace it with the real generator output:
 *
 *   supabase gen types typescript --linked > src/lib/supabase/database.types.ts
 *
 * Re-running that command after future migrations is how this file should
 * be kept in sync going forward — it should not normally be hand-edited
 * again after the first real generation.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AdminRole = "owner" | "staff";

export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

export interface Database {
  public: {
    Tables: {
      admin_users: {
        Row: {
          id: string;
          full_name: string;
          role: AdminRole;
          avatar_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          role?: AdminRole;
          avatar_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["admin_users"]["Insert"]>;
        Relationships: [];
      };

      menu_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["menu_categories"]["Insert"]>;
        Relationships: [];
      };

      menu_items: {
        Row: {
          id: string;
          category_id: string;
          name: string;
          description: string | null;
          price: number;
          rating: number | null;
          image_url: string | null;
          is_available: boolean;
          is_featured: boolean;
          display_order: number;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          name: string;
          description?: string | null;
          price: number;
          rating?: number | null;
          image_url?: string | null;
          is_available?: boolean;
          is_featured?: boolean;
          display_order?: number;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["menu_items"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey";
            columns: ["category_id"];
            referencedRelation: "menu_categories";
            referencedColumns: ["id"];
          },
        ];
      };

      special_offers: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          tag: string | null;
          icon: string | null;
          valid_from: string | null;
          valid_until: string | null;
          is_active: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          tag?: string | null;
          icon?: string | null;
          valid_from?: string | null;
          valid_until?: string | null;
          is_active?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["special_offers"]["Insert"]>;
        Relationships: [];
      };

      gallery_categories: {
        Row: {
          id: string;
          name: string;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["gallery_categories"]["Insert"]>;
        Relationships: [];
      };

      gallery_images: {
        Row: {
          id: string;
          category_id: string | null;
          image_url: string;
          alt_text: string;
          caption: string | null;
          is_featured: boolean;
          display_order: number;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          image_url: string;
          alt_text: string;
          caption?: string | null;
          is_featured?: boolean;
          display_order?: number;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["gallery_images"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "gallery_images_category_id_fkey";
            columns: ["category_id"];
            referencedRelation: "gallery_categories";
            referencedColumns: ["id"];
          },
        ];
      };

      testimonials: {
        Row: {
          id: string;
          customer_name: string;
          role_or_location: string | null;
          rating: number;
          review_text: string;
          is_featured: boolean;
          is_visible: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_name: string;
          role_or_location?: string | null;
          rating: number;
          review_text: string;
          is_featured?: boolean;
          is_visible?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["testimonials"]["Insert"]>;
        Relationships: [];
      };

      chefs: {
        Row: {
          id: string;
          name: string;
          position: string;
          bio: string | null;
          years_experience: number | null;
          image_url: string | null;
          social_links: Json;
          is_active: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          position: string;
          bio?: string | null;
          years_experience?: number | null;
          image_url?: string | null;
          social_links?: Json;
          is_active?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["chefs"]["Insert"]>;
        Relationships: [];
      };

      faqs: {
        Row: {
          id: string;
          question: string;
          answer: string;
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          question: string;
          answer: string;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["faqs"]["Insert"]>;
        Relationships: [];
      };

      reservations: {
        Row: {
          id: string;
          customer_name: string;
          email: string;
          phone: string;
          party_size: number;
          reservation_date: string;
          reservation_time: string;
          special_request: string | null;
          status: ReservationStatus;
          admin_notes: string | null;
          confirmed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_name: string;
          email: string;
          phone: string;
          party_size: number;
          reservation_date: string;
          reservation_time: string;
          special_request?: string | null;
          status?: ReservationStatus;
          admin_notes?: string | null;
          confirmed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["reservations"]["Insert"]>;
        Relationships: [];
      };

      reservation_status_log: {
        Row: {
          id: string;
          reservation_id: string;
          previous_status: ReservationStatus | null;
          new_status: ReservationStatus;
          changed_by: string;
          changed_at: string;
        };
        Insert: {
          id?: string;
          reservation_id: string;
          previous_status?: ReservationStatus | null;
          new_status: ReservationStatus;
          changed_by: string;
          changed_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["reservation_status_log"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "reservation_status_log_reservation_id_fkey";
            columns: ["reservation_id"];
            referencedRelation: "reservations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reservation_status_log_changed_by_fkey";
            columns: ["changed_by"];
            referencedRelation: "admin_users";
            referencedColumns: ["id"];
          },
        ];
      };

      hero_settings: {
        Row: {
          id: string;
          headline: string;
          /** Phase 12A: highlighted word(s) rendered in gold on the second heading line. */
          headline_highlight: string | null;
          /** Phase 12A: plain text after the highlighted word on the second line. */
          headline_suffix: string | null;
          /** Phase 12A: small badge text shown above the heading. */
          badge_text: string | null;
          /** Phase 12A: description paragraph beneath the heading. */
          description: string | null;
          /** Phase 12A: primary CTA button label. */
          primary_button_text: string | null;
          /** Phase 12A: primary CTA target (anchor id or URL). */
          primary_button_link: string | null;
          /** Phase 12A: secondary CTA button label. */
          secondary_button_text: string | null;
          /** Phase 12A: secondary CTA target (anchor id or URL). */
          secondary_button_link: string | null;
          background_image_url: string | null;
          /** Phase 12A: gradient overlay darkness 0–100. */
          overlay_opacity: number;
          /** Phase 12A: when false the entire Hero section is hidden. */
          is_visible: boolean;
          updated_at: string;
          // Legacy columns kept for backward compatibility:
          subheadline: string | null;
          cta_text: string | null;
          cta_link: string | null;
        };
        Insert: {
          id?: string;
          headline: string;
          headline_highlight?: string | null;
          headline_suffix?: string | null;
          badge_text?: string | null;
          description?: string | null;
          primary_button_text?: string | null;
          primary_button_link?: string | null;
          secondary_button_text?: string | null;
          secondary_button_link?: string | null;
          background_image_url?: string | null;
          overlay_opacity?: number;
          is_visible?: boolean;
          updated_at?: string;
          subheadline?: string | null;
          cta_text?: string | null;
          cta_link?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["hero_settings"]["Insert"]>;
        Relationships: [];
      };

      about_settings: {
        Row: {
          id: string;
          headline: string;
          /** Phase 12B: small uppercase kicker above the heading — e.g. "Our Story". */
          section_title: string | null;
          description: string | null;
          image_url: string | null;
          /** jsonb array of { icon, title, description } objects. */
          features: Json;
          /** Phase 12B: year shown in the decorative badge overlay — e.g. "2012". */
          badge_year: string | null;
          /** Phase 12B: subtitle shown in the decorative badge overlay. */
          badge_text: string | null;
          /** Phase 12B: when false the entire About section is hidden on the public site. */
          is_visible: boolean;
          updated_at: string;
        };
        Insert: {
          id?: string;
          headline: string;
          section_title?: string | null;
          description?: string | null;
          image_url?: string | null;
          features?: Json;
          badge_year?: string | null;
          badge_text?: string | null;
          is_visible?: boolean;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["about_settings"]["Insert"]>;
        Relationships: [];
      };

      restaurant_info: {
        Row: {
          id: string;
          name: string;
          tagline: string | null;
          description: string | null;
          address: string | null;
          phone: string | null;
          email: string | null;
          logo_url: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          tagline?: string | null;
          description?: string | null;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          logo_url?: string | null;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["restaurant_info"]["Insert"]>;
        Relationships: [];
      };

      footer_settings: {
        Row: {
          id: string;
          copyright_text: string | null;
          tagline: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          copyright_text?: string | null;
          tagline?: string | null;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["footer_settings"]["Insert"]>;
        Relationships: [];
      };

      opening_hours: {
        Row: {
          id: string;
          day_of_week: number;
          open_time: string | null;
          close_time: string | null;
          is_closed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          day_of_week: number;
          open_time?: string | null;
          close_time?: string | null;
          is_closed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["opening_hours"]["Insert"]>;
        Relationships: [];
      };

      social_links: {
        Row: {
          id: string;
          platform: string;
          url: string;
          icon: string | null;
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          platform: string;
          url: string;
          icon?: string | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["social_links"]["Insert"]>;
        Relationships: [];
      };

      seo_settings: {
        Row: {
          id: string;
          page_identifier: string;
          meta_title: string;
          meta_description: string;
          keywords: string[] | null;
          og_image_url: string | null;
          canonical_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          page_identifier: string;
          meta_title: string;
          meta_description: string;
          keywords?: string[] | null;
          og_image_url?: string | null;
          canonical_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["seo_settings"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      admin_role: AdminRole;
      reservation_status: ReservationStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
