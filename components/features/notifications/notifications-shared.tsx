import { useState, type CSSProperties, type ReactNode } from "react";
import { AlertCircle, Bell, CheckCircle2, ChevronDown, ChevronUp, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { NotificationType } from "@/types/notification-types";

const TYPE_META: Record<
    NotificationType,
    { label: string; textClass: string; bgClass: string }
> = {
    REVIEW: { label: "Review", textClass: "text-[#004C8F]", bgClass: "bg-[#EEF4FB]" },
    REWARD: { label: "Reward", textClass: "text-[#004C8F]", bgClass: "bg-[#FEF2F2]" },
    SYSTEM: { label: "System", textClass: "text-[#004C8F]", bgClass: "bg-[#F3F4F6]" },
    CELEBRATION: { label: "Celebration", textClass: "text-[#004C8F]", bgClass: "bg-[#FDF2F8]" },
    ANNOUNCEMENT: { label: "Announcement", textClass: "text-[#004C8F]", bgClass: "bg-[#EEF4FB]" },
};

export const inputClass =
    "w-full min-w-0 rounded-sm border border-input bg-white px-3 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground transition focus:outline-none focus:ring-1 focus:ring-ring";

export const inputFocus = {} as CSSProperties;

export function formatRelativeTime(iso: string): string {
    const date = new Date(iso);
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60_000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function formatWeekLabel(iso: string): string {
    return new Date(iso).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

export function toIsoDatetime(dateStr: string): string {
    if (!dateStr) return dateStr;
    if (dateStr.includes("T")) return dateStr;
    return `${dateStr}T00:00:00Z`;
}

export function TypeBadge({ type }: { type: NotificationType }) {
    const meta = TYPE_META[type] ?? TYPE_META.SYSTEM;

    return (
        <span
            className={`inline-flex items-center whitespace-nowrap rounded-sm px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-widest ${meta.textClass} ${meta.bgClass}`}
        >
            {meta.label}
        </span>
    );
}

export function LoadingSkeleton() {
    return (
        <div className="space-y-0 divide-y divide-slate-50">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-4 px-5 py-4">
                    <Skeleton className="mt-2 h-2 w-2 shrink-0 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-[18px] w-20 rounded-sm" />
                            <Skeleton className="ml-auto h-3 w-12 rounded" />
                        </div>
                        <Skeleton className="h-[14px] w-3/4 rounded" />
                        <Skeleton className="h-3 w-1/2 rounded" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center px-8 py-20 text-center">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#EEF4FB]">
                <Bell className="h-6 w-6 text-primary" />
            </div>
            <p className="text-[15px] font-semibold text-foreground">All caught up</p>
            <p className="mt-1.5 max-w-[220px] text-[13px] text-muted-foreground">
                No notifications yet. Check back later.
            </p>
        </div>
    );
}

export function ResultBanner({
    type,
    message,
    onDismiss,
}: {
    type: "success" | "error";
    message: string;
    onDismiss: () => void;
}) {
    const isSuccess = type === "success";

    return (
        <div
            className="mb-4 flex items-start gap-3 rounded-sm px-4 py-3 text-[13px]"
            style={{
                background: isSuccess ? "#F0FDF4" : "#FEF2F2",
                border: `1px solid ${isSuccess ? "#BBF7D0" : "#FECACA"}`,
                color: isSuccess ? "#166534" : "#991B1B",
            }}
        >
            {isSuccess ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <span className="flex-1 leading-relaxed">{message}</span>
            <button onClick={onDismiss} className="shrink-0 opacity-60 hover:opacity-100">
                <X className="h-3.5 w-3.5" />
            </button>
        </div>
    );
}

export function FieldLabel({
    children,
    required,
}: {
    children: ReactNode;
    required?: boolean;
}) {
    return (
        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            {children}
            {required && <span className="ml-0.5 text-destructive">*</span>}
        </label>
    );
}

export function AdminPanel({
    label,
    icon,
    accentColorStr,
    accentClassStr,
    children,
}: {
    label: string;
    icon: ReactNode;
    accentColorStr: string;
    accentClassStr: string;
    children: ReactNode;
}) {
    const [open, setOpen] = useState(false);

    return (
        <div className="mb-3 overflow-hidden rounded-sm border border-border">
            <button
                onClick={() => setOpen((prev) => !prev)}
                className="flex w-full items-center justify-between px-5 py-3.5 transition-colors duration-200 hover:bg-muted"
            >
                <div className="flex items-center gap-3">
                    <span
                        className="flex h-7 w-7 items-center justify-center rounded-sm"
                        style={{ background: `${accentColorStr}18` }}
                    >
                        <span className={accentClassStr}>{icon}</span>
                    </span>
                    <span className="text-[13px] font-semibold text-foreground">{label}</span>
                </div>
                <span
                    className={`text-muted-foreground transition-transform duration-300 ${open ? "rotate-180" : "rotate-0"}`}
                >
                    {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </span>
            </button>

            <div
                className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
            >
                <div className="overflow-hidden">
                    <div
                        className={`border-t border-border bg-muted/40 px-5 py-5 transition-transform duration-300 ease-out ${open ? "translate-y-0" : "-translate-y-2"}`}
                    >
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
