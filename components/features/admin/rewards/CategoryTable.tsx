"use client";

import React from "react";
import { Category, CategoryFilter } from "@/types/reward-types";
import { PaginationMeta } from "@/types/pagination";
import { RewardBadge } from "./UIHelpers";
import { Edit2, Package, Clock, ChevronRight } from "lucide-react";
import { DataTable, Column } from "@/components/shared/DataTable";

interface CategoryTableProps {
    categories: Category[];
    loading: boolean;
    onEdit: (cat: Category) => void;
    openCreate: () => void;
    filterState?: CategoryFilter;
    pagination?: PaginationMeta | null;
    onPageChange?: (page: number) => void;
}

export function CategoryTable({
    categories,
    loading,
    onEdit,
    filterState = "all",
    pagination,
    onPageChange,
}: CategoryTableProps) {
    const columns: Column<Category>[] = [
        {
            key: "category",
            header: "Category",
            skeletonWidth: "w-48",
            render: (cat) => (
                <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-800 tracking-tight group-hover:text-[#004C8F] transition-colors uppercase">
                        {cat.category_name}
                    </span>
                </div>
            ),
        },
        {
            key: "code",
            header: "Code",
            skeletonWidth: "w-24",
            render: (cat) => (
                <span className="text-[11px] font-bold tracking-widest text-gray-600 uppercase">
                    {cat.category_code}
                </span>
            ),
        },
        {
            key: "description",
            header: "Description",
            skeletonWidth: "w-64",
            cellClassName: "max-w-xs",
            render: (cat) => (
                <p className="text-xs text-gray-500 leading-relaxed">
                    {cat.description || (
                        <span className="text-gray-300 italic">—</span>
                    )}
                </p>
            ),
        },
        {
            key: "status",
            header: "Status",
            skeletonWidth: "w-16",
            render: (cat) => <RewardBadge active={cat.is_active} />,
        },
        {
            key: "created",
            header: "Created",
            skeletonWidth: "w-24",
            render: (cat) => (
                <span className="text-[11px] text-gray-400 whitespace-nowrap">
                    {new Date(cat.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                    })}
                </span>
            ),
        },
        {
            key: "actions",
            header: "",
            skeletonWidth: "w-20",
            cellClassName: "text-right",
            render: (cat) => (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(cat);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-bold border border-gray-200 text-gray-500 hover:bg-[#004C8F] hover:text-white hover:border-[#004C8F] transition-all"
                >
                    <Edit2 className="w-3 h-3" />
                    Manage
                    <ChevronRight className="w-3 h-3" />
                </button>
            ),
        },
    ];

    const mobileCard = (cat: Category) => (
        <div
            className="rounded-xl border border-gray-200 bg-white p-4 hover:border-[#004C8F]/20 transition-colors"
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#004C8F] flex items-center justify-center font-bold text-[11px] uppercase shrink-0">
                        {cat.category_name.charAt(0)}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-800 uppercase">
                            {cat.category_name}
                        </p>
                        <span className="text-[11px] font-bold text-gray-600 uppercase tracking-widest">
                            {cat.category_code}
                        </span>
                    </div>
                </div>
                <RewardBadge active={cat.is_active} />
            </div>
            {cat.description && (
                <p className="text-xs text-gray-500 mb-3">{cat.description}</p>
            )}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                    <Clock className="w-3 h-3" />
                    {new Date(cat.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                    })}
                </div>
                <button
                    onClick={() => onEdit(cat)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold border border-gray-200 text-gray-500 hover:bg-[#004C8F] hover:text-white hover:border-[#004C8F] transition-all"
                >
                    <Edit2 className="w-3 h-3" />
                    Manage
                </button>
            </div>
        </div>
    );

    const emptyIcon = (
        <Package className="w-10 h-10 opacity-20 text-slate-400" />
    );

    return (
        <DataTable
            columns={columns}
            data={categories}
            loading={loading}
            keyExtractor={(cat) => cat.category_id}
            emptyMessage={
                filterState === "all"
                    ? "No categories found. Try adding one."
                    : `No ${filterState} categories found.`
            }
            emptyIcon={emptyIcon}
            mobileCardRender={mobileCard}
            mobileBreakpoint="lg"
            pagination={pagination}
            onPageChange={onPageChange}
        />
    );
}
