"use client";

import React, { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginationMeta } from "@/types/pagination";
import PaginationControls from "@/components/shared/PaginationControls";
import { cn } from "@/lib/utils";

// ─── Column Definition ────────────────────────────────────────────────────────

export interface Column<T> {
    /** Unique key for the column (used as React key) */
    key: string;
    /** Header label displayed in the table head */
    header: string;
    /** Custom render function for the cell content */
    render: (row: T, index: number) => ReactNode;
    /** Optional className applied to both th and td */
    className?: string;
    /** Optional className applied only to the header th */
    headerClassName?: string;
    /** Optional className applied only to the data td */
    cellClassName?: string;
    /** Skeleton width for loading state (default: "w-24") */
    skeletonWidth?: string;
    /** Hide this column on mobile card view (default: false) */
    hideOnMobile?: boolean;
}

// ─── Component Props ──────────────────────────────────────────────────────────

interface DataTableProps<T> {
    /** Column definitions */
    columns: Column<T>[];
    /** Data array to render */
    data: T[];
    /** Whether data is currently loading */
    loading: boolean;
    /** Function to extract a unique key from each row */
    keyExtractor: (row: T, index: number) => string | number;
    /** Message shown when data is empty and not loading */
    emptyMessage?: string;
    /** Optional icon/element shown in the empty state */
    emptyIcon?: ReactNode;
    /** Pagination metadata (set to null/undefined to hide pagination) */
    pagination?: PaginationMeta | null;
    /** Callback when page changes */
    onPageChange?: (page: number) => void;
    /** Optional row click handler (adds cursor-pointer + hover) */
    onRowClick?: (row: T, index: number) => void;
    /** Number of skeleton rows to show while loading (default: 5) */
    skeletonRows?: number;
    /** Custom mobile card renderer. When provided, shows cards on mobile instead of the table. */
    mobileCardRender?: (row: T, index: number) => ReactNode;
    /** Mobile skeleton card renderer. Falls back to a default skeleton card. */
    mobileSkeletonRender?: (index: number) => ReactNode;
    /** Optional className for the outer wrapper */
    className?: string;
    /** Breakpoint at which to switch between cards ↔ table. Default: "lg" */
    mobileBreakpoint?: "sm" | "md" | "lg" | "xl";
    /** Minimum table width for horizontal scroll (default: "720px") */
    minTableWidth?: string;
}

// ─── Breakpoint helpers ───────────────────────────────────────────────────────

const HIDE_CLASSES = {
    sm: "sm:hidden",
    md: "md:hidden",
    lg: "lg:hidden",
    xl: "xl:hidden",
} as const;

const SHOW_CLASSES = {
    sm: "hidden sm:block",
    md: "hidden md:block",
    lg: "hidden lg:block",
    xl: "hidden xl:block",
} as const;

// ─── DataTable Component ──────────────────────────────────────────────────────

export function DataTable<T>({
    columns,
    data,
    loading,
    keyExtractor,
    emptyMessage = "No data found.",
    emptyIcon,
    pagination,
    onPageChange,
    onRowClick,
    skeletonRows = 5,
    mobileCardRender,
    mobileSkeletonRender,
    className,
    mobileBreakpoint = "lg",
    minTableWidth = "720px",
}: DataTableProps<T>) {
    const hasMobileView = !!mobileCardRender;
    const hideOnDesktop = HIDE_CLASSES[mobileBreakpoint]; // e.g. "lg:hidden"
    const showOnDesktop = SHOW_CLASSES[mobileBreakpoint]; // e.g. "hidden lg:block"

    // ── Mobile Card Skeleton ──────────────────────────────────────────────────
    const defaultMobileSkeleton = (index: number) => (
        <div
            key={index}
            className="rounded-xl border border-gray-100 bg-white p-4 space-y-3"
        >
            <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-5 w-16 rounded" />
            </div>
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
        </div>
    );

    // ── Desktop Table Skeleton ────────────────────────────────────────────────
    const renderDesktopSkeleton = () => (
        <table className="w-full text-sm" style={{ minWidth: minTableWidth }}>
            <thead>
                <tr className="border-b-2 border-gray-200">
                    {columns.map((col) => (
                        <th
                            key={col.key}
                            className={cn(
                                "text-left py-3 px-4 text-sm font-semibold text-gray-700",
                                col.className,
                                col.headerClassName
                            )}
                        >
                            {col.header}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {Array.from({ length: skeletonRows }).map((_, rowIdx) => (
                    <tr
                        key={rowIdx}
                        className={cn(
                            rowIdx < skeletonRows - 1 && "border-b border-gray-100"
                        )}
                    >
                        {columns.map((col) => (
                            <td key={col.key} className="py-3.5 px-4">
                                <Skeleton
                                    className={cn("h-4 rounded", col.skeletonWidth ?? "w-24")}
                                />
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );

    // ── Empty State ───────────────────────────────────────────────────────────
    const renderEmpty = () => (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
            {emptyIcon && (
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
                    {emptyIcon}
                </div>
            )}
            <p className="text-sm font-medium text-gray-400">{emptyMessage}</p>
        </div>
    );

    // ── Data Rows ─────────────────────────────────────────────────────────────
    const renderDesktopRows = () => (
        <table className="w-full text-sm" style={{ minWidth: minTableWidth }}>
            <thead>
                <tr className="border-b-2 border-gray-200">
                    {columns.map((col) => (
                        <th
                            key={col.key}
                            className={cn(
                                "text-left py-3 px-4 text-sm font-semibold text-gray-700",
                                col.className,
                                col.headerClassName
                            )}
                        >
                            {col.header}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {data.map((row, idx) => (
                    <tr
                        key={keyExtractor(row, idx)}
                        className={cn(
                            "transition-colors",
                            idx < data.length - 1 && "border-b border-gray-100",
                            onRowClick && "cursor-pointer hover:bg-slate-50"
                        )}
                        onClick={onRowClick ? () => onRowClick(row, idx) : undefined}
                    >
                        {columns.map((col) => (
                            <td
                                key={col.key}
                                className={cn("py-3.5 px-4", col.className, col.cellClassName)}
                            >
                                {col.render(row, idx)}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );

    // ── Pagination ────────────────────────────────────────────────────────────
    const renderPagination = () => {
        if (!pagination || !onPageChange) return null;
        if (pagination.total_pages <= 1) return null;
        return (
            <div className="border-t border-gray-100 px-4 py-4">
                <PaginationControls
                    currentPage={pagination.current_page}
                    totalPages={pagination.total_pages}
                    hasPrevious={pagination.has_previous}
                    hasNext={pagination.has_next}
                    onPageChange={onPageChange}
                    className="mt-0"
                />
            </div>
        );
    };

    // ── Main Render ───────────────────────────────────────────────────────────
    return (
        <div className={cn("space-y-0", className)}>
            {/* ─── Loading ─── */}
            {loading ? (
                <>
                    {/* Mobile skeleton cards */}
                    {hasMobileView && (
                        <div className={cn("space-y-3 p-4", hideOnDesktop)}>
                            {Array.from({ length: Math.min(skeletonRows, 4) }).map(
                                (_, i) =>
                                    mobileSkeletonRender
                                        ? mobileSkeletonRender(i)
                                        : defaultMobileSkeleton(i)
                            )}
                        </div>
                    )}

                    {/* Desktop skeleton table */}
                    <div
                        className={cn(
                            "overflow-x-auto",
                            hasMobileView ? showOnDesktop : ""
                        )}
                    >
                        {renderDesktopSkeleton()}
                    </div>
                </>
            ) : data.length === 0 ? (
                renderEmpty()
            ) : (
                <>
                    {/* Mobile cards */}
                    {hasMobileView && (
                        <div className={cn("space-y-3 p-4", hideOnDesktop)}>
                            {data.map((row, idx) => (
                                <React.Fragment key={keyExtractor(row, idx)}>
                                    {mobileCardRender!(row, idx)}
                                </React.Fragment>
                            ))}
                        </div>
                    )}

                    {/* Desktop table */}
                    <div
                        className={cn(
                            "overflow-x-auto",
                            hasMobileView ? showOnDesktop : ""
                        )}
                    >
                        {renderDesktopRows()}
                    </div>
                </>
            )}

            {/* Pagination (always visible regardless of viewport) */}
            {renderPagination()}
        </div>
    );
}
