import { cn } from "@/lib/utils";

interface StaffAvatarProps {
  firstName: string;
  lastName: string;
  photoUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZE_CLASSES = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-14 text-lg",
  xl: "size-20 text-2xl",
};

export function StaffAvatar({ firstName, lastName, photoUrl, size = "md", className }: StaffAvatarProps) {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={`${firstName} ${lastName}`}
        className={cn("rounded-full object-cover", SIZE_CLASSES[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-primary/15 font-semibold text-primary",
        SIZE_CLASSES[size],
        className,
      )}
      aria-label={`${firstName} ${lastName}`}
    >
      {initials}
    </div>
  );
}
