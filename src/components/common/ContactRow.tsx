interface ContactRowProps {
  icon: string;
  title: string;
}

/**
 * Icon + text row used in the Contact section. Identical markup/classes to
 * the original inline `ContactRow` component.
 */
export function ContactRow({ icon, title }: ContactRowProps) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/15 text-primary">
        <i className={`fa-solid ${icon}`} />
      </span>
      <span>{title}</span>
    </div>
  );
}
