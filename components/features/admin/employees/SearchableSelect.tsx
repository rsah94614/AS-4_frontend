import { cn } from "@/lib/utils";
import { ChevronDown, Search } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useState, useRef, useEffect } from "react";

export function SearchableSelect({ id, label, value, onChange, options, placeholder, required }: {
    id: string; label: string; value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    placeholder: string; required?: boolean;
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const ref = useRef<HTMLDivElement>(null);

    const selected = options.find((o) => o.value === value);
    const filtered = options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()));

    useEffect(() => {
        function handler(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div className="space-y-1.5" ref={ref}>
            <Label htmlFor={id} className="text-[12px] font-bold text-muted-foreground uppercase tracking-widest">
                {label} {required && <span className="text-destructive">*</span>}
            </Label>
            <div className="relative">
                <button type="button" id={id}
                    onClick={() => { setOpen((o) => !o); setQuery(""); }}
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-white text-left flex items-center justify-between
                        focus:outline-none focus:ring-2 focus:ring-ring/10 focus:border-primary/40 transition-all">
                    <span className={selected ? "text-foreground font-medium" : "text-muted-foreground"}>
                        {selected ? selected.label : placeholder}
                    </span>
                    <ChevronDown size={14} className={cn("text-muted-foreground transition-transform shrink-0", open && "rotate-180")} />
                </button>

                {open && (
                    <div className="absolute z-200 w-full mt-1 bg-white border border-border rounded-lg shadow-lg overflow-hidden">
                        <div className="p-2 border-b border-gray-100">
                            <div className="relative">
                                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    autoFocus
                                    placeholder="Search…"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="w-full pl-7 pr-3 py-1.5 text-sm border border-border rounded-md focus:outline-none focus:border-primary/40"
                                />
                            </div>
                        </div>
                        <div className="max-h-44 overflow-y-auto">
                            <button type="button"
                                onClick={() => { onChange(""); setOpen(false); }}
                                className="w-full px-3 py-2 text-sm text-left text-muted-foreground hover:bg-muted transition-colors">
                                {placeholder}
                            </button>
                            {filtered.length === 0 ? (
                                <p className="px-3 py-2 text-sm text-muted-foreground">No results</p>
                            ) : filtered.map((o) => (
                                <button type="button" key={o.value}
                                    onClick={() => { onChange(o.value); setOpen(false); setQuery(""); }}
                                    className={cn(
                                        "w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors",
                                        o.value === value ? "font-semibold text-primary bg-blue-50/50" : "text-foreground"
                                    )}>
                                    {o.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}