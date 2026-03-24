"use client";

import { X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { AuditLog } from "@/types/audit-types";
import { OperationBadge } from "./AuditTable";

interface AuditDetailModalProps {
    log: AuditLog | null;
    onClose: () => void;
}

// Renders a key-value object in a human-readable way
function ChangeTable({ data, emptyMessage }: { data: unknown; emptyMessage: string }) {
    if (!data || typeof data !== "object" || Object.keys(data as object).length === 0) {
        return (
            <p className="text-sm italic py-3 px-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-400">
                {emptyMessage}
            </p>
        );
    }

    const entries = Object.entries(data as Record<string, unknown>);

    return (
        <div className="rounded-xl overflow-x-auto border border-gray-200">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wide" style={{ width: "40%" }}>Field</th>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">Value</th>
                    </tr>
                </thead>
                <tbody>
                    {entries.map(([key, value], idx) => {
                        // Format the key nicely
                        const label = key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
                        // Format the value nicely
                        let displayValue: string;
                        if (value === null || value === undefined) {
                            displayValue = "—";
                        } else if (typeof value === "boolean") {
                            displayValue = value ? "Yes" : "No";
                        } else if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
                            displayValue = new Date(value).toLocaleString();
                        } else {
                            displayValue = String(value);
                        }

                        return (
                            <tr
                                key={key}
                                className={idx < entries.length - 1 ? "border-b border-gray-100" : ""}
                            >
                                <td className="px-4 py-2.5 font-medium text-sm text-gray-700">{label}</td>
                                <td className="px-4 py-2.5 text-sm text-gray-900">{displayValue}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export function AuditDetailModal({ log, onClose }: AuditDetailModalProps) {
    if (!log) return null;

    const employeeName = (log as AuditLog & { employee_name?: string; performed_by_name?: string }).employee_name || (log as AuditLog & { employee_name?: string; performed_by_name?: string }).performed_by_name || "Admin";

    return (
        <Dialog open={!!log} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                showCloseButton={false}
                onOpenAutoFocus={(e) => e.preventDefault()}
                className="w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] sm:max-w-2xl p-0 border-none bg-white rounded-2xl overflow-hidden shadow-xl flex flex-col max-h-[85vh]"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 shrink-0">
                    <div>
                        <DialogTitle className="text-lg font-bold text-gray-900">Activity Detail</DialogTitle>
                        <p className="text-xs text-gray-400 mt-0.5">What happened and what changed</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body — scrollable */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-6 space-y-5">
                    {/* Summary cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="rounded-xl px-4 py-3 bg-gray-50 border border-gray-200">
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Done by</p>
                            <p className="text-sm font-semibold text-gray-900">{employeeName}</p>
                        </div>
                        <div className="rounded-xl px-4 py-3 bg-gray-50 border border-gray-200">
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Action</p>
                            <OperationBadge op={log.operation_type} />
                        </div>
                        <div className="rounded-xl px-4 py-3 bg-gray-50 border border-gray-200">
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Date & Time</p>
                            <p className="text-sm font-semibold text-gray-900">
                                {new Date(log.performed_at).toLocaleString([], { dateStyle: "long", timeStyle: "short" })}
                            </p>
                        </div>
                        <div className="rounded-xl px-4 py-3 bg-gray-50 border border-gray-200">
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">IP Address</p>
                            <p className="text-sm font-semibold text-gray-900 font-mono">
                                {log.ip_address ?? "Not recorded"}
                            </p>
                        </div>
                        <div className="rounded-xl px-4 py-3 bg-gray-50 border border-gray-200 sm:col-span-2">
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Section / Module</p>
                            <p className="text-sm font-semibold text-gray-900">
                                {log.table_name.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                            </p>
                        </div>
                    </div>

                    {/* Before & After — human readable */}
                    <div className="border-t border-gray-200 pt-5">
                        <p className="text-sm font-semibold text-gray-700 mb-4">What changed</p>

                        <div className="space-y-4">
                            {log.operation_type !== "INSERT" && (
                                <div>
                                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                                        Before the change
                                    </p>
                                    <ChangeTable
                                        data={log.old_values}
                                        emptyMessage="No previous data — this was a brand new record."
                                    />
                                </div>
                            )}

                            {log.operation_type !== "DELETE" && (
                                <div>
                                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                                        {log.operation_type === "INSERT" ? "What was created" : "After the change"}
                                    </p>
                                    <ChangeTable
                                        data={log.new_values}
                                        emptyMessage="No new data recorded."
                                    />
                                </div>
                            )}

                            {log.operation_type === "DELETE" && (
                                <div>
                                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                                        What was deleted
                                    </p>
                                    <ChangeTable
                                        data={log.old_values}
                                        emptyMessage="No data recorded for this deletion."
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
