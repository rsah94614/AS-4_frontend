import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";

export function StatusBadge({ isActive }: { isActive: boolean }) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 text-[12px] font-semibold whitespace-nowrap",
                isActive ? "text-emerald-600" : "text-rose-600"
            )}
        >
            {isActive ? <CheckCircle2 size={9} /> : <XCircle size={9} />}
            {isActive ? "Active" : "Inactive"}
        </span>
    );
}