"use client";

import { Search, X } from "lucide-react";

interface AdminSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

// Only allow letters, numbers, spaces, hyphens, and underscores
const ALLOWED = /^[a-zA-Z0-9 _-]*$/;

export function AdminSearchBar({
  value,
  onChange,
  placeholder = "Search by name or code…",
  className = "",
}: AdminSearchBarProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.trimStart();
    if (ALLOWED.test(raw)) {
      onChange(raw);
    }
    // silently reject any input containing special characters
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    onChange(e.target.value.trim());
  };

  return (
    <div className={`relative flex-1 min-w-[200px] max-w-sm ${className}`}>
      <Search
        size={13}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
      />
      <input
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 rounded-lg border border-border bg-muted text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/10 focus:border-primary/40 transition-all"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center w-4 h-4 rounded-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}