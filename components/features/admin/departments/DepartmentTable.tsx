"use client";

import { Department } from "@/types/department-types";
import { PaginationMeta } from "@/types/pagination";
import { DataTable, Column } from "@/components/shared/DataTable";

interface DepartmentTableProps {
    departments: Department[];
    loading: boolean;
    pagination: PaginationMeta | null;
    onPageChange: (page: number) => void;
    onEdit: (dept: Department) => void;
}

export function DepartmentTable({
    departments,
    loading,
    pagination,
    onPageChange,
    onEdit,
}: DepartmentTableProps) {
    const columns: Column<Department>[] = [
        {
            key: "name",
            header: "Name",
            skeletonWidth: "w-40",
            render: (dept) => (
                <span className="font-semibold text-gray-900">
                    {dept.department_name}
                </span>
            ),
        },
        {
            key: "code",
            header: "Code",
            skeletonWidth: "w-24",
            render: (dept) => (
                <span
                    className="font-mono text-xs px-2.5 py-1 rounded"
                    style={{
                        backgroundColor: "#f1f5f9",
                        color: "#475569",
                        border: "1px solid #e2e8f0",
                    }}
                >
                    {dept.department_code}
                </span>
            ),
        },
        {
            key: "type",
            header: "Type",
            skeletonWidth: "w-28",
            render: (dept) => (
                <span className="text-gray-600">
                    {dept.department_type ? dept.department_type.type_name : "—"}
                </span>
            ),
        },
        {
            key: "manager",
            header: "Manager",
            skeletonWidth: "w-28",
            render: (dept) =>
                dept.manager ? (
                    <div className="flex items-center gap-2">
                        <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                            style={{ backgroundColor: "#1a4ab5" }}
                        >
                            {dept.manager.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm text-gray-600">
                            {dept.manager.username}
                        </span>
                    </div>
                ) : (
                    <span className="text-gray-400">—</span>
                ),
        },
        {
            key: "status",
            header: "Status",
            skeletonWidth: "w-16",
            render: (dept) => (
                <span
                    className="inline-flex items-center px-3 py-1 rounded text-xs font-semibold"
                    style={
                        dept.is_active
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
                    {dept.is_active ? "Active" : "Inactive"}
                </span>
            ),
        },
        {
            key: "actions",
            header: "Action",
            skeletonWidth: "w-16",
            render: (dept) => (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(dept);
                    }}
                    className="px-4 py-1.5 text-xs font-semibold text-white rounded transition-all hover:opacity-90 active:scale-95"
                    style={{ backgroundColor: "#1a4ab5" }}
                >
                    Edit
                </button>
            ),
        },
    ];

    const mobileCard = (dept: Department) => (
        <div
            className="rounded-lg border border-slate-200 p-4 space-y-3 w-full max-w-full overflow-hidden"
            style={{ backgroundColor: "#ffffff" }}
        >
            <div className="flex items-start justify-between gap-3">
                <p
                    className="min-w-0 flex-1 break-words font-semibold text-sm leading-5"
                    style={{ color: "#111827" }}
                >
                    {dept.department_name}
                </p>
                <span
                    className="inline-flex shrink-0 items-center px-2.5 py-1 rounded text-[11px] font-semibold"
                    style={
                        dept.is_active
                            ? {
                                  backgroundColor: "#ffffff",
                                  color: "#14a882",
                                  border: "solid #14a882",
                              }
                            : {
                                  backgroundColor: "#6b7280",
                                  color: "#ffffff",
                              }
                    }
                >
                    {dept.is_active ? "Active" : "Inactive"}
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
                        {dept.department_code}
                    </span>
                </div>
                <div>
                    <p className="mb-1 text-gray-500">Type</p>
                    <p className="break-words text-gray-600">
                        {dept.department_type ? dept.department_type.type_name : "—"}
                    </p>
                </div>
            </div>

            <div>
                <p className="mb-1 text-xs text-gray-500">Manager</p>
                {dept.manager ? (
                    <div className="flex items-center gap-2">
                        <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                            style={{ backgroundColor: "#1a4ab5" }}
                        >
                            {dept.manager.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="min-w-0 break-words text-sm text-gray-600">
                            {dept.manager.username}
                        </span>
                    </div>
                ) : (
                    <span className="text-sm text-gray-400">—</span>
                )}
            </div>

            <button
                onClick={() => onEdit(dept)}
                className="w-full px-4 py-2 text-xs font-semibold text-white rounded transition-all hover:opacity-90 active:scale-95"
                style={{ backgroundColor: "#1a4ab5" }}
            >
                Edit
            </button>
        </div>
    );

    return (
        <DataTable
            columns={columns}
            data={departments}
            loading={loading}
            keyExtractor={(dept) => dept.department_id}
            emptyMessage="No departments found."
            pagination={pagination}
            onPageChange={onPageChange}
            mobileCardRender={mobileCard}
            mobileBreakpoint="xl"
        />
    );
}
