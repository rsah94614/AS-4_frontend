import { Label } from "@/components/ui/label";
import { ChevronDown } from "lucide-react";


export function SelectField({ id, label, value, onChange, options, placeholder, required }: {
    id: string; label: string; value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { value: string; label: string }[];
    placeholder: string; required?: boolean;
}) {
    return (
        <div className="space-y-1.5">
            <Label htmlFor={id} className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                {label} {required && <span className="text-destructive">*</span>}
            </Label>
            <div className="relative">
                <select id={id} value={value} onChange={onChange}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white appearance-none pr-9
                        focus:outline-none focus:ring-2 focus:ring-ring/10 focus:border-primary/40 font-medium transition-all text-foreground">
                    <option value="">{placeholder}</option>
                    {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
        </div>
    );
}
