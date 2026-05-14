"use client";

import { useState } from "react";
import {
    Calendar, Hash, MessageSquare, Package, Coins, Clock, Copy, Check,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { HistoryItem } from "@/types/history-types";

interface TransactionDetailModalProps {
    item: HistoryItem | null;
    open: boolean;
    onClose: () => void;
}

function DetailRow({
    icon,
    label,
    value,
    className = "",
}: {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={cn("flex flex-col gap-1", className)}>
            <div className="flex items-center gap-1.5 text-gray-500">
                <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                    {icon}
                </div>
                <p className="text-[9px] font-normal uppercase tracking-wider">
                    {label}
                </p>
            </div>
            <div className="pl-5 text-sm font-normal text-gray-900">
                {value}
            </div>
        </div>
    );
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}

function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
}

/**
 * Formats a UUID into a short human-readable TXN ID.
 * Takes the first 8 chars of the UUID (before the first dash) and uppercases.
 * e.g. "18fa153d-c80a-..." → "TXN-18FA-153D"
 */
function formatTransactionId(id: string): string {
    const clean = id.replace(/-/g, "").toUpperCase();
    return `TXN-${clean.slice(0, 4)}-${clean.slice(4, 8)}`;
}

function CopyableTransactionId({ id }: { id: string }) {
    const [copied, setCopied] = useState(false);

    function handleCopy() {
        navigator.clipboard.writeText(id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-gray-600 tracking-tight">
                {formatTransactionId(id)}
            </span>
            <button
                onClick={handleCopy}
                className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                title={`Copy full ID: ${id}`}
            >
                {copied
                    ? <Check size={11} className="text-emerald-500" />
                    : <Copy size={11} />
                }
            </button>
        </div>
    );
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

/** Returns the comment only if it's a real human-written one, not a system description */
function getDisplayComment(item: HistoryItem): string | null {
    if (!item.comment) return null;
    if (
        item.comment.startsWith("Points credited from review") ||
        item.comment.startsWith("Points deducted")
    ) return null;
    return item.comment;
}

export default function TransactionDetailModal({
    item,
    open,
    onClose,
}: TransactionDetailModalProps) {
    if (!item) return null;

    const isRedemption  = !!item.reward_catalog;
    const accentColor   = isRedemption ? "#004C8F" : "#10b981";
    const accentBg      = isRedemption ? "#ffffff"  : "#f0fdf4";
    const accentBorder  = isRedemption ? "#dbeafe"  : "#bbf7d0";
    const displayComment = getDisplayComment(item);

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent
                className="sm:max-w-[400px] p-0 overflow-hidden border-0 shadow-2xl rounded-2xl bg-white"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                {/* ── Header ── */}
                <div className="px-7 pt-6 pb-5 text-center border-b border-gray-100">
                    <p className="text-lg font-bold text-gray-800 uppercase tracking-[0.18em] mb-1">
                        Transaction Details
                    </p>
                    <DialogTitle className="text-base font-normal leading-snug text-gray-700">
                        {getTitle(item)}
                    </DialogTitle>
                    <Badge
                        className="mt-3 rounded-full px-3 py-1 text-[9px] font-normal uppercase tracking-widest border"
                        style={{
                            backgroundColor: accentBg,
                            color: accentColor,
                            borderColor: accentBorder,
                        }}
                    >
                        {isRedemption ? "Redeemed Points" : "Earned Points"}
                    </Badge>
                </div>

                {/* ── Body ── */}
                <div className="px-7 py-5 space-y-4 bg-white">

                    {/* Points card */}
                    <div className="rounded-xl border border-gray-200 p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-gray-200 text-gray-500">
                            <Coins size={20} />
                        </div>
                        <div>
                            <p className="text-[9px] font-normal text-gray-500 uppercase tracking-wider mb-0.5">
                                {isRedemption ? "Points Deducted" : "Total Received"}
                            </p>
                            <p className="text-xl font-semibold text-gray-900 tabular-nums">
                                {item.points.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* Date / Time / Transaction ID */}
                    <div className="rounded-xl border border-gray-200 p-4 grid grid-cols-2 gap-x-4 gap-y-4">
                        <DetailRow
                            icon={<Calendar size={12} />}
                            label="Date"
                            value={formatDate(item.granted_at)}
                        />
                        <DetailRow
                            icon={<Clock size={12} />}
                            label="Time"
                            value={formatTime(item.granted_at)}
                        />
                        <DetailRow
                            className="col-span-2 pt-2 border-t border-gray-100"
                            icon={<Hash size={12} />}
                            label="Transaction ID"
                            value={<CopyableTransactionId id={item.history_id} />}
                        />
                    </div>

                    {/* Reward info — redemptions only */}
                    {item.reward_catalog && (
                        <div className="rounded-xl border border-gray-200 p-4 space-y-2">
                            <div className="flex items-center gap-1.5 text-gray-500">
                                <Package size={13} />
                                <p className="text-[9px] font-normal uppercase tracking-wider">
                                    Reward Info
                                </p>
                            </div>
                            <p className="text-sm font-medium text-gray-900">
                                {item.reward_catalog.reward_name}
                            </p>
                            <p className="text-[10px] text-gray-500">
                                Code:{" "}
                                <span className="font-mono text-gray-600">
                                    {item.reward_catalog.reward_code}
                                </span>
                            </p>
                        </div>
                    )}

                    {/* Note / Recognition message — shown for both earned and redeemed */}
                    {displayComment && (
                        <div className="flex gap-3 pt-1">
                            <MessageSquare className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[9px] font-normal text-gray-500 uppercase tracking-widest mb-1">
                                    Note
                                </p>
                                <p className="text-xs text-gray-600 italic leading-relaxed">
                                    &ldquo;{displayComment}&rdquo;
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}