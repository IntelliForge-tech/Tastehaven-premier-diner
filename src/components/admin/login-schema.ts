import { z } from "zod";

/**
 * Client-side validation schema for the admin login form.
 *
 * UI-only for now: this shapes field-level error messages (required,
 * invalid email, minimum password length) so the form can be reviewed
 * end-to-end. There is no server call behind it yet — wiring it to
 * Supabase Auth is separate Phase 4 work.
 */
export const loginSchema = z.object({
  email: z.string().min(1, "Email is required.").email("Enter a valid email address."),
  password: z
    .string()
    .min(1, "Password is required.")
    .min(8, "Password must be at least 8 characters."),
  rememberMe: z.boolean(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
