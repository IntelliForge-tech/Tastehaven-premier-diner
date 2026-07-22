interface FieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  min?: number;
  max?: number;
  defaultValue?: string | number;
}

/**
 * Labeled input used by the reservation form. Identical markup/classes to
 * the original inline `Field` component.
 */
export function Field(props: FieldProps) {
  const { label, ...rest } = props;
  return (
    <div>
      <label className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">{label}</label>
      <input
        {...rest}
        className="w-full rounded-lg border border-border bg-background/50 px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
      />
    </div>
  );
}
