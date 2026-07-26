import { Search, X } from "lucide-react";

interface CustomerSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function CustomerSearchBar({
  value,
  onChange,
  placeholder = "Search by name, email or phone…",
}: CustomerSearchBarProps) {
  return (
    <div className="relative">
      <Search
        className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-border bg-muted/30 py-2 pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        aria-label="Search customers"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
