import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import type { HistoryItem } from "@/types/history-types";
import { cn } from "@/lib/utils";
import React from "react";

interface HistoryCardProps {
    item: HistoryItem;
    onClick?: (item: HistoryItem) => void;
}

function getReviewerName(item: HistoryItem): string | null {
    if (!item.reward_catalog && item.reviewer) {
        const name = [item.reviewer.first_name, item.reviewer.last_name]
            .filter(Boolean).join(" ");
        return name || item.reviewer.username || null;
    }
    const g = item.employees_reward_history_granted_byToemployees;
    if (!g) return null;
    const full = [g.first_name, g.last_name].filter(Boolean).join(" ");
    return full || g.username || null;
}

function getTitle(item: HistoryItem): string {
    if (item.reward_catalog) {
        return `You redeemed "${item.reward_catalog.reward_name}"`;
    }
    const name = getReviewerName(item);
    if (name) return `${name} recognized you`;
    return "Points awarded";
}

export default React.memo(function HistoryCard({ item, onClick }: HistoryCardProps) {
    const isRedemption = !!item.reward_catalog;

    const badgeBg = isRedemption
        ? "bg-[#004C8F]/5 text-[#004C8F] border-[#004C8F]/10"
        : "bg-emerald-50 text-emerald-700 border-emerald-100";
    const iconWrap = isRedemption
        ? "bg-[#004C8F]/5 text-[#004C8F] border-[#004C8F]/10"
        : "bg-emerald-50 text-emerald-700 border-emerald-100";
    const amountColor = isRedemption ? "#004C8F" : "#10b981";

    // Only show comment if it's a real review comment, not a system description
    // (system descriptions look like "Points credited from review <uuid>")
    const isSystemComment =
        item.comment?.startsWith("Points credited from review") ||
        item.comment?.startsWith("Points deducted");
    const displayComment = !isSystemComment ? item.comment : null;

    return (
        <button
            type="button"
            onClick={() => onClick?.(item)}
            className="group relative block w-full cursor-pointer overflow-hidden rounded-[22px] border border-slate-200/80 bg-white text-left shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#004C8F]/20 hover:shadow-[0_20px_45px_rgba(15,23,42,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004C8F]/20"
        >
            <div className="absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-[#004C8F]/30 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
            <div className="p-3 sm:p-4 flex items-center justify-between gap-4 sm:gap-5">
                <div className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border",
                    iconWrap
                )}>
                    {isRedemption
                        ? <ArrowUpRight size={18} />
                        : <ArrowDownLeft size={18} />
                    }
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className={cn(
                            "inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.18em] px-3 py-1.5 rounded-full border",
                            badgeBg
                        )}>
                            {isRedemption ? "Redeemed" : "Earned"}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-medium text-slate-500">
                            {new Date(item.granted_at).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                            })}
                        </span>
                    </div>

                    <p className="mt-3 text-[15px] font-semibold leading-6 text-slate-900 transition-colors group-hover:text-slate-950">
                        {getTitle(item)}
                    </p>

                    {/* Review comment / redemption note */}
                    {displayComment && (
                        <p className="mt-1.5 text-[13px] text-slate-500 leading-snug line-clamp-2">
                            &ldquo;{displayComment}&rdquo;
                        </p>
                    )}

                    {/* View more details hint */}
                    <p className="mt-2 text-[11px] font-medium text-[#004C8F]/60 group-hover:text-[#004C8F] transition-colors">
                        View details →
                    </p>
                </div>

                <div className="shrink-0 text-right px-4">
                    <span
                        className="block text-xl font-bold tracking-tight"
                        style={{ color: amountColor }}
                    >
                        {item.points.toLocaleString()}
                    </span>
                </div>
            </div>
        </button>
    );
});