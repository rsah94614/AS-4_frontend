"use client";

import { AuditLog } from "@/types/audit-types";
import { PaginationMeta } from "@/types/pagination";
import { DataTable, Column } from "@/components/shared/DataTable";

const OP_STYLES: Record<string, { label: string }> = {
    INSERT: { label: "Added" },
    UPDATE: { label: "Updated" },
    DELETE: { label: "Deleted" },
};

export function OperationBadge({ op }: { op: string }) {
    const style = OP_STYLES[op] ?? { label: op };
    return (
        <span className="text-xs font-semibold whitespace-nowrap text-gray-700">
            {style.label}
        </span>
    );
}

function shortId(id: string) {
    return "LOG" + id.slice(0, 4).toUpperCase();
}

function formatDateTime(value: string) {
    return `${new Date(value).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    })} ${new Date(value).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    })}`;
}

function getEmployeeName(log: AuditLog) {
    const withNames = log as AuditLog & { employee_name?: string; performed_by_name?: string };
    return withNames.employee_name || withNames.performed_by_name || "Admin";
}

interface AuditTableProps {
    logs: AuditLog[];
    loading: boolean;
    pagination: PaginationMeta | null;
    onPageChange: (page: number) => void;
    onViewDetails: (log: AuditLog) => void;
    hasActiveFilters: boolean;
}

export function AuditTable({
    logs,
    loading,
    pagination,
    onPageChange,
    onViewDetails,
    hasActiveFilters,
}: AuditTableProps) {
    const columns: Column<AuditLog>[] = [
        {
            key: "logId",
            header: "Log ID",
            skeletonWidth: "w-20",
            render: (log) => (
                <span className="font-mono text-sm font-semibold text-gray-700">
                    {shortId(log.audit_id)}
                </span>
            ),
        },
        {
            key: "user",
            header: "User",
            skeletonWidth: "w-28",
            render: (log) => (
                <span className="font-medium text-sm text-gray-900">
                    {getEmployeeName(log)}
                </span>
            ),
        },
        {
            key: "action",
            header: "Action",
            skeletonWidth: "w-16",
            render: (log) => <OperationBadge op={log.operation_type} />,
        },
        {
            key: "module",
            header: "Module",
            skeletonWidth: "w-32",
            render: (log) => (
                <span className="text-gray-600">
                    {log.table_name
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                </span>
            ),
        },
        {
            key: "timestamp",
            header: "Timestamp",
            skeletonWidth: "w-36",
            render: (log) => (
                <span className="whitespace-nowrap text-gray-600">
                    {formatDateTime(log.performed_at)}
                </span>
            ),
        },
        {
            key: "ip",
            header: "IP Address",
            skeletonWidth: "w-24",
            headerClassName: "hidden xl:table-cell",
            cellClassName: "hidden xl:table-cell",
            render: (log) => (
                <span className="font-mono text-sm text-gray-600">
                    {log.ip_address ?? "—"}
                </span>
            ),
        },
    ];

    const mobileCard = (log: AuditLog) => {
        const employeeName = getEmployeeName(log);
        return (
            <div
                className="rounded-xl border border-slate-200 p-3.5 sm:p-4 space-y-3 w-full max-w-full overflow-hidden cursor-pointer transition-colors"
                style={{ backgroundColor: "#ffffff" }}
                onClick={() => onViewDetails(log)}
            >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <span className="font-mono text-xs font-semibold text-gray-700">
                        {shortId(log.audit_id)}
                    </span>
                    <div className="max-w-full overflow-hidden">
                        <OperationBadge op={log.operation_type} />
                    </div>
                </div>

                <div className="flex items-center gap-2.5 min-w-0">
                    <span className="min-w-0 break-words font-medium text-sm sm:text-[15px] text-gray-900">
                        {employeeName}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="col-span-2">
                        <p className="mb-1 text-gray-500">Module</p>
                        <p className="break-words text-gray-600">
                            {log.table_name
                                .replace(/_/g, " ")
                                .replace(/\b\w/g, (c) => c.toUpperCase())}
                        </p>
                    </div>
                    <div>
                        <p className="mb-1 text-gray-500">Timestamp</p>
                        <p className="text-gray-600">{formatDateTime(log.performed_at)}</p>
                    </div>
                    <div>
                        <p className="mb-1 text-gray-500">IP Address</p>
                        <p className="font-mono break-all text-gray-600">
                            {log.ip_address ?? "—"}
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <DataTable
            columns={columns}
            data={logs}
            loading={loading}
            keyExtractor={(log) => log.audit_id}
            emptyMessage={
                hasActiveFilters
                    ? "No logs match your filters."
                    : "No audit logs recorded yet."
            }
            pagination={pagination}
            onPageChange={onPageChange}
            onRowClick={onViewDetails}
            mobileCardRender={mobileCard}
            mobileBreakpoint="md"
            skeletonRows={6}
            minTableWidth="860px"
        />
    );
}
