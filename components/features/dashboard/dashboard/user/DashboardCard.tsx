import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNumber, formatMonthComparison } from "@/lib/dashboard-utils";
import { type Metric } from "@/types/dashboard-types";
import { TrendingUp, TrendingDown } from "lucide-react";

interface DashboardCardProps {
    label: string;
    icon: LucideIcon;
    stat?: Metric;
    loading?: boolean;
    className?: string;
}

export default function DashboardCard({
    label,
    icon: Icon,
    stat,
    loading = false,
    className,
}: DashboardCardProps) {
    if (loading) {
        return (
            <div className={cn(
                "relative rounded-2xl p-5 overflow-hidden border border-border bg-card shadow-sm animate-pulse",
                className,
            )}>
                {/* Icon badge + trend pill row */}
                <div className="relative flex items-start justify-between mb-5">
                    <div className="bg-muted rounded-xl w-10 h-10" />
                    <div className="bg-muted rounded-full w-16 h-6" />
                </div>

                {/* Number + label */}
                <div className="relative space-y-2">
                    <div className="bg-muted rounded-lg h-9 w-24" />
                    <div className="bg-muted rounded h-3.5 w-28" />
                </div>
            </div>
        );
    }

    const value = formatNumber(stat?.value ?? null);
    const change = formatMonthComparison(stat?.this_month ?? null, stat?.last_month ?? null);
    const isUp = change !== "—" && !change.startsWith("-");
    const isDown = change.startsWith("-");

    return (
        <div className={cn(
            "relative rounded-2xl p-5 overflow-hidden border border-border bg-card shadow-sm",
            className,
        )}>
            <div className="relative flex items-start justify-between mb-5">
                <div className="bg-primary/10 p-2.5 rounded-xl">
                    <Icon className="w-5 h-5 text-primary" />
                </div>
                {change !== "—" && (
                    <div className={cn(
                        "flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full",
                        isDown ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                    )}>
                        {isUp && <TrendingUp className="w-3 h-3" />}
                        {isDown && <TrendingDown className="w-3 h-3" />}
                        {change}
                    </div>
                )}
            </div>

            <div className="relative">
                <h2 className="text-4xl font-black tracking-tight tabular-nums leading-none mb-1 text-foreground">
                    {value}
                </h2>
                <p className="text-muted-foreground text-sm font-medium">{label}</p>
            </div>
        </div>
    );
}
