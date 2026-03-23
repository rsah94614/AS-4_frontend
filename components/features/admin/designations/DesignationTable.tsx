"use client";

import { Designation } from "@/types/designation-types";
import { PaginationMeta } from "@/types/pagination";
import { DataTable, Column } from "@/components/shared/DataTable";

interface DesignationTableProps {
    designations: Designation[];
    loading: boolean;
    pagination: PaginationMeta | null;
    onPageChange: (page: number) => void;
    onEdit: (desig: Designation) => void;
}

export function DesignationTable({
    designations,
    loading,
    pagination,
    onPageChange,
    onEdit,
}: DesignationTableProps) {
    const columns: Column<Designation>[] = [
        {
            key: "name",
            header: "Name",
            skeletonWidth: "w-40",
            render: (desig) => (
                <span className="font-semibold text-gray-900">
                    {desig.designation_name}
                </span>
            ),
        },
        {
            key: "code",
            header: "Code",
            skeletonWidth: "w-24",
            render: (desig) => (
                <span
                    className="font-mono text-xs px-2.5 py-1 rounded"
                    style={{
                        backgroundColor: "#f1f5f9",
                        color: "#475569",
                        border: "1px solid #e2e8f0",
                    }}
                >
                    {desig.designation_code}
                </span>
            ),
        },
        {
            key: "level",
            header: "Level",
            skeletonWidth: "w-8",
            render: (desig) => (
                <span
                    className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: "#1a4ab5" }}
                >
                    {desig.level}
                </span>
            ),
        },
        {
            key: "status",
            header: "Status",
            skeletonWidth: "w-16",
            render: (desig) => (
                <span
                    className="inline-flex items-center px-3 py-1 rounded text-xs font-semibold"
                    style={
                        desig.is_active
                            ? {
                                  backgroundColor: "#ffffff",
                                  color: "#14a882",
                                  border: "1px solid #14a882",
                              }
                            : {
                                  backgroundColor: "#6b7280",
                                  color: "#ffffff",
                              }
                    }
                >
                    {desig.is_active ? "Active" : "Inactive"}
                </span>
            ),
        },
        {
            key: "actions",
            header: "Action",
            skeletonWidth: "w-16",
            render: (desig) => (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(desig);
                    }}
                    className="h-8 px-4 text-xs font-semibold text-white rounded transition-all hover:opacity-90"
                    style={{ backgroundColor: "#1a4ab5", border: "none" }}
                >
                    Edit
                </button>
            ),
        },
    ];

    const mobileCard = (desig: Designation) => (
        <div
            className="rounded-lg border border-slate-200 p-4 space-y-3 w-full max-w-full overflow-hidden"
            style={{ backgroundColor: "#ffffff" }}
        >
            <div className="flex items-start justify-between gap-3">
                <p
                    className="min-w-0 flex-1 break-words font-semibold text-sm leading-5"
                    style={{ color: "#111827" }}
                >
                    {desig.designation_name}
                </p>
                <span
                    className="inline-flex shrink-0 items-center px-2.5 py-1 rounded text-[11px] font-semibold"
                    style={
                        desig.is_active
                            ? {
                                  backgroundColor: "#ffffff",
                                  color: "#14a882",
                                  border: "1px solid #14a882",
                              }
                            : {
                                  backgroundColor: "#6b7280",
                                  color: "#ffffff",
                              }
                    }
                >
                    {desig.is_active ? "Active" : "Inactive"}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                    <p className="mb-1 text-gray-500">Code</p>
                    <span
                        className="inline-flex max-w-full break-all font-mono text-xs px-2 py-1 rounded"
                        style={{
                            backgroundColor: "#f1f5f9",
                            color: "#475569",
                            border: "1px solid #e2e8f0",
                        }}
                    >
                        {desig.designation_code}
                    </span>
                </div>
                <div>
                    <p className="mb-1 text-gray-500">Level</p>
                    <span
                        className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: "#1a4ab5" }}
                    >
                        {desig.level}
                    </span>
                </div>
            </div>

            <button
                onClick={() => onEdit(desig)}
                className="h-8 w-full text-xs font-semibold text-white rounded hover:opacity-90"
                style={{ backgroundColor: "#1a4ab5", border: "none" }}
            >
                Edit
            </button>
        </div>
    );

    return (
        <DataTable
            columns={columns}
            data={designations}
            loading={loading}
            keyExtractor={(desig) => desig.designation_id}
            emptyMessage="No designations found."
            pagination={pagination}
            onPageChange={onPageChange}
            mobileCardRender={mobileCard}
            mobileBreakpoint="xl"
        />
    );
}
