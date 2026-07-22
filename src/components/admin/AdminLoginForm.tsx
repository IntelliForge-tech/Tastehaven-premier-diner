import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/common/Button";
import { PasswordInput } from "@/components/admin/PasswordInput";
import { loginSchema, type LoginFormValues } from "@/components/admin/login-schema";
import { Checkbox } from "@/components/ui/checkbox";
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
import { signInWithPassword } from "@/services/auth/auth.service";

/**
 * Admin login form, wired to real Supabase Authentication via the
 * dedicated auth service (src/services/auth/auth.service.ts).
 *
 * This component never talks to Supabase directly — it only calls
 * `signInWithPassword` and reacts to the typed result it gets back, so it
 * has no idea Supabase is the thing behind that call.
 *
 * Scope note: on success, authentication is complete but nothing
 * redirects or navigates from here — that's later Phase 4 work (route
 * protection / dashboard). Design/markup below is unchanged from the
 * Login Page UI step.
 */
export function AdminLoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMountedRef = useRef(true);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
    mode: "onTouched",
  });

  // Guards against setting state after the form has unmounted (e.g. the
  // user navigates away while the sign-in request is still in flight).
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  async function onSubmit(values: LoginFormValues) {
    setIsSubmitting(true);

    try {
      const result = await signInWithPassword({
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
      });

      if (!result.success) {
        // Friendly, non-leaking message only — the service layer never
        // hands this component a raw Supabase error.
        toast.error(result.error.message);
        return;
      }

      toast.success("Signed in successfully.");
      // Intentionally no redirect/navigation here (see scope note above).
    } finally {
      if (isMountedRef.current) {
        setIsSubmitting(false);
      }
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        aria-label="Admin login"
        className="space-y-5"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="admin-email">Email</FormLabel>
              <FormControl>
                <Input
                  id="admin-email"
                  type="email"
                  autoComplete="username"
                  autoFocus
                  placeholder="owner@tastehaven.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between gap-4">
                <FormLabel htmlFor="admin-password">Password</FormLabel>
                <ForgotPasswordLink />
              </div>
              <FormControl>
                <PasswordInput
                  id="admin-password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  toggleDisabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormDescription className="sr-only">
                Password must be at least 8 characters.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rememberMe"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-2 space-y-0">
              <FormControl>
                <Checkbox
                  id="admin-remember-me"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel
                htmlFor="admin-remember-me"
                className="cursor-pointer font-normal text-muted-foreground"
              >
                Remember me
              </FormLabel>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          variant="gold"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          aria-live="polite"
          className="flex w-full items-center justify-center gap-2 py-3 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>
    </Form>
  );
}

/**
 * Placeholder only — intentionally does not navigate anywhere or trigger
 * any reset flow. Wiring a real "forgot password" flow is out of scope
 * for this step.
 */
function ForgotPasswordLink() {
  return (
    <button
      type="button"
      aria-disabled="true"
      className="text-xs font-medium text-primary transition-colors hover:underline"
      onClick={(e) => e.preventDefault()}
    >
      Forgot password?
    </button>
  );
}
