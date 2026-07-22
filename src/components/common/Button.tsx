import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "gold" | "outline-gold" | "outline";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  gold: "btn-gold",
  "outline-gold": "btn-outline-gold",
  outline: "border border-border text-foreground hover:btn-gold hover:border-transparent",
};

/**
 * Generic pill-button primitive built on the project's existing `btn-gold` /
 * `btn-outline-gold` design-system classes.
 *
 * NOTE: none of the existing sections use this yet. Every button in the
 * current UI has its own bespoke class string (padding, gap, font-weight
 * all vary slightly per instance), and retrofitting them here risked
 * subtle visual drift, which conflicts with the "must look 100% identical"
 * constraint of this refactor. This component is provided as a ready
 * building block for new UI (e.g. an upcoming backend-driven checkout or
 * admin flow) rather than a replacement for the current markup.
 */
export function Button({ variant = "gold", className, ...rest }: ButtonProps) {
  return <button className={cn("rounded-full text-sm font-semibold", VARIANT_CLASSES[variant], className)} {...rest} />;
}
