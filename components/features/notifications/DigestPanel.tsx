"use client";

import { useEffect, useState, useTransition } from "react";
import { BarChart3, Calendar, Loader2, Send } from "lucide-react";
import { extractErrorMessage } from "@/lib/error-utils";
import type { WeeklyDigestData } from "@/types/notification-types";
import {
    fetchManagerOptions,
    getDigest,
    postDigest,
    type ManagerOption,
} from "@/components/features/notifications/notification-admin-service";
import {
    FieldLabel,
    formatWeekLabel,
    inputClass,
    inputFocus,
    ResultBanner,
} from "@/components/features/notifications/notifications-shared";

function PerformerRow({
    label,
    name,
    count,
    accentClass,
}: {
    label: string;
    name: string;
    count: number;
    accentClass: string;
}) {
    return (
        <div className="flex items-center gap-3">
            <span
                className={`whitespace-nowrap rounded-sm px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-widest text-white ${accentClass}`}
            >
                {label}
            </span>
            <span className="flex-1 truncate text-[13px] font-semibold text-foreground">{name}</span>
            <span className="shrink-0 text-[12px] tabular-nums text-muted-foreground">
                {count} {count === 1 ? "recognition" : "recognitions"}
            </span>
        </div>
    );
}

function DigestDataCard({ data }: { data: WeeklyDigestData }) {
    const weekLabel = `${formatWeekLabel(data.week_start)} - ${formatWeekLabel(data.week_end)}`;
    const stats: { label: string; value: string | number; accentClass: string }[] = [
        { label: "Recognitions", value: data.total_recognitions, accentClass: "text-primary" },
        { label: "Points Awarded", value: data.total_points_awarded, accentClass: "text-primary" },
        { label: "Unique Givers", value: data.unique_givers, accentClass: "text-destructive" },
        { label: "Receivers", value: data.unique_receivers, accentClass: "text-destructive" },
    ];

    return (
        <div className="overflow-hidden rounded-sm border border-border">
            <div className="flex items-center justify-between bg-primary px-4 py-3">
                <span className="text-[11px] font-bold uppercase tracking-widest text-primary-foreground/70">
                    Weekly Recognition Summary
                </span>
                <span className="text-[11px] text-primary-foreground/60">{weekLabel}</span>
            </div>

            <div className="grid grid-cols-2 divide-x divide-y divide-slate-100 sm:grid-cols-4">
                {stats.map((stat) => (
                    <div key={stat.label} className="px-4 py-4 text-center">
                        <div className={`text-[26px] font-bold leading-none tabular-nums ${stat.accentClass}`}>
                            {stat.value}
                        </div>
                        <div className="mt-1.5 text-[10.5px] font-semibold uppercase tracking-widest text-muted-foreground">
                            {stat.label}
                        </div>
                    </div>
                ))}
            </div>

            {(data.top_giver || data.top_receiver) && (
                <div className="space-y-2.5 border-t border-slate-100 px-4 py-3">
                    <p className="text-[10.5px] font-bold uppercase tracking-widest text-muted-foreground">
                        Top Performers
                    </p>
                    {data.top_giver && (
                        <PerformerRow
                            label="Top Giver"
                            name={data.top_giver.username}
                            count={data.top_giver.count}
                            accentClass="bg-primary"
                        />
                    )}
                    {data.top_receiver && (
                        <PerformerRow
                            label="Top Receiver"
                            name={data.top_receiver.username}
                            count={data.top_receiver.count}
                            accentClass="bg-destructive"
                        />
                    )}
                </div>
            )}

            {data.total_recognitions === 0 && (
                <div className="border-t border-slate-100 bg-[#EEF4FB] px-4 py-3 text-[12.5px] leading-relaxed text-[#374151]">
                    No recognitions were submitted during this period.
                </div>
            )}
        </div>
    );
}

export function DigestPanel({ canSend }: { canSend: boolean }) {
    const [weekStart, setWeekStart] = useState("");
    const [managerEmail, setManagerEmail] = useState("");
    const [managerId, setManagerId] = useState("");
    const [digestData, setDigestData] = useState<WeeklyDigestData | null>(null);
    const [result, setResult] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [isFetching, startFetch] = useTransition();
    const [isSending, startSend] = useTransition();
    const [previewManagers, setPreviewManagers] = useState<ManagerOption[]>([]);
    const [previewManagersLoading, setPreviewManagersLoading] = useState(true);

    useEffect(() => {
        fetchManagerOptions()
            .then(setPreviewManagers)
            .finally(() => setPreviewManagersLoading(false));
    }, []);

    function handleFetch(event: React.FormEvent) {
        event.preventDefault();
        setResult(null);
        setDigestData(null);

        startFetch(async () => {
            try {
                const data = await getDigest(weekStart || undefined, managerId || undefined);
                setDigestData(data);
            } catch (error: unknown) {
                setResult({
                    type: "error",
                    text: extractErrorMessage(error, "Failed to fetch digest."),
                });
            }
        });
    }

    function handleSend(event: React.FormEvent) {
        event.preventDefault();
        if (!managerEmail) return;

        setResult(null);
        startSend(async () => {
            try {
                const response = await postDigest({
                    manager_email: managerEmail,
                    ...(managerId ? { manager_id: managerId } : {}),
                    ...(weekStart ? { week_start: weekStart } : {}),
                });
                setResult({ type: response.success ? "success" : "error", text: response.message });
                if (response.data) setDigestData(response.data);
            } catch (error: unknown) {
                setResult({
                    type: "error",
                    text: extractErrorMessage(error, "Failed to send digest."),
                });
            }
        });
    }

    return (
        <div className="space-y-5">
            {result && (
                <ResultBanner
                    type={result.type}
                    message={result.text}
                    onDismiss={() => setResult(null)}
                />
            )}

            <form onSubmit={handleFetch} className="space-y-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="min-w-0">
                        <FieldLabel>Manager (Team Scope)</FieldLabel>
                        {previewManagersLoading ? (
                            <p className="flex items-center gap-1.5 py-2.5 text-[12px] text-muted-foreground">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading...
                            </p>
                        ) : (
                            <select
                                value={managerId}
                                onChange={(event) => {
                                    setManagerId(event.target.value);
                                    setDigestData(null);
                                    setResult(null);
                                    const selected = previewManagers.find(
                                        (manager) => manager.employee_id === event.target.value
                                    );
                                    setManagerEmail(selected?.email ?? "");
                                }}
                                className={`${inputClass} min-h-11`}
                                style={{ ...inputFocus, color: managerId ? "#1e293b" : "#94a3b8" }}
                                disabled={isFetching}
                                title="Manager scope"
                            >
                                <option value="">All managers</option>
                                {previewManagers.map((manager) => (
                                    <option key={manager.employee_id} value={manager.employee_id}>
                                        {manager.username} ({manager.email})
                                    </option>
                                ))}
                            </select>
                        )}
                        <p className="mt-1 text-[11px] text-muted-foreground">
                            Select a manager to scope the summary to their direct reports
                        </p>
                    </div>

                    <div className="min-w-0">
                        <FieldLabel>Week Starting (Monday)</FieldLabel>
                        <div className="relative">
                            <Calendar className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="date"
                                value={weekStart}
                                onChange={(event) => {
                                    const val = event.target.value;
                                    const yearPart = val.split("-")[0];
                                    if (yearPart && yearPart.length > 4) return;
                                    setWeekStart(val);
                                    setDigestData(null);
                                }}
                                max={new Date().toISOString().split("T")[0]}
                                className={`${inputClass} min-h-11 pl-8`}
                                style={inputFocus}
                                disabled={isFetching}
                            />
                        </div>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                            Leave blank for last completed week
                        </p>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isFetching}
                    className="flex w-full items-center justify-center gap-2 rounded-sm bg-primary px-4 py-2.5 text-[13px] font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-40 sm:w-auto"
                >
                    {isFetching ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                        </>
                    ) : (
                        <>
                            <BarChart3 className="h-4 w-4" /> View Summary
                        </>
                    )}
                </button>
            </form>

            {digestData && <DigestDataCard data={digestData} />}

            {canSend && (
                <form onSubmit={handleSend} className="space-y-4 border-t border-slate-100 pt-4">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                        Send Digest by Email
                    </p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                        <div className="min-w-0">
                            <FieldLabel required>Recipient (Managers &amp; Admins only)</FieldLabel>
                            {previewManagersLoading ? (
                                <p className="flex items-center gap-1.5 py-2 text-[12px] text-muted-foreground">
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading managers...
                                </p>
                            ) : (
                                <select
                                    value={managerEmail}
                                    onChange={(event) => {
                                        setManagerEmail(event.target.value);
                                        const selected = previewManagers.find(
                                            (manager) => manager.email === event.target.value
                                        );
                                        setManagerId(selected?.employee_id ?? "");
                                    }}
                                    className={`${inputClass} min-h-11`}
                                    style={{ ...inputFocus, color: managerEmail ? "#1e293b" : "#94a3b8" }}
                                    disabled={isSending || previewManagers.length === 0}
                                    title="Digest recipient"
                                >
                                    <option value="">Select recipient</option>
                                    {previewManagers.map((manager) => (
                                        <option key={manager.employee_id} value={manager.email}>
                                            {manager.username} ({manager.email})
                                        </option>
                                    ))}
                                </select>
                            )}
                            {!previewManagersLoading && previewManagers.length === 0 && (
                                <p className="mt-1 text-[11px] text-muted-foreground">No managers found.</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={!managerEmail || isSending || previewManagersLoading}
                            className="flex w-full items-center justify-center rounded-sm bg-destructive px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-destructive/90 disabled:opacity-40 sm:w-auto"
                        >
                            {isSending ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Send className="h-4 w-4" /> Send
                                </span>
                            )}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
