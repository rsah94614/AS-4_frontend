"use client";

import { useState } from "react";
import { useHistoryData } from "@/hooks/useHistoryData";
import HistoryFilterBar from "@/components/features/dashboard/history/HistoryFilterBar";
import HistoryList from "@/components/features/dashboard/history/HistoryList";
import HistoryPagination from "@/components/features/dashboard/history/HistoryPagination";
import dynamic from "next/dynamic";
import type { HistoryItem } from "@/types/history-types";

// Dynamically import the modal to reduce initial JS evaluation time
const TransactionDetailModal = dynamic(() => import("@/components/features/dashboard/history/TransactionDetailModal"), {
    ssr: false
});

// removed imports

export default function HistoryPage() {
    const {
        selectedPeriod, setSelectedPeriod,
        selectedType, setSelectedType,
        typeOptions,
        clearFilters,
        allHistory, filteredHistory, paginatedHistory,
        loading, error, retry,
        page, setPage, totalPages,
    } = useHistoryData();

    const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);
    const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

    function closeDropdowns() {
        setPeriodDropdownOpen(false);
        setTypeDropdownOpen(false);
    }

    return (
        <div
            className="flex-1 w-full min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_45%,#ffffff_100%)] mx-auto shadow-[0_10px_50px_rgba(15,23,42,0.05)]"
            onClick={closeDropdowns}
        >
            {/* ── Page Header ── */}
            <div className="border-b border-slate-200/80 bg-[radial-gradient(circle_at_top_left,rgba(0,76,143,0.08),transparent_32%),linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-6 md:px-10 py-7 rounded-t-[24px]">
                <div className="mx-auto flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight" style={{ color: "#004C8F" }}>
                            History
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                            Review every point movement, reward redemption, and supporting transaction detail in one place.
                        </p>
                    </div>
                    <span className="hidden md:flex items-center text-2xl font-black tracking-tight select-none">
                        <span style={{ color: "#E31837" }}>A</span>
                        <span style={{ color: "#004C8F" }}>abhar</span>
                    </span>
                </div>
            </div>

            <div className="h-0.5 shrink-0" />

            {/* ── Main content ── */}
            <div className="px-6 md:px-10 py-8 md:py-10 mx-auto rounded-b-[24px]">
                <HistoryFilterBar
                    selectedPeriod={selectedPeriod}
                    setSelectedPeriod={setSelectedPeriod}
                    selectedType={selectedType}
                    setSelectedType={setSelectedType}
                    typeOptions={typeOptions}
                    clearFilters={clearFilters}
                    filteredCount={filteredHistory.length}
                    loading={loading}
                    periodDropdownOpen={periodDropdownOpen}
                    setPeriodDropdownOpen={setPeriodDropdownOpen}
                    typeDropdownOpen={typeDropdownOpen}
                    setTypeDropdownOpen={setTypeDropdownOpen}
                />

                <HistoryList
                    items={paginatedHistory}
                    allItemsCount={allHistory.length}
                    loading={loading}
                    error={error}
                    onRetry={retry}
                    onClearFilters={clearFilters}
                    onItemClick={setSelectedItem}
                />

                {!loading && !error && filteredHistory.length > 0 && (
                    <HistoryPagination
                        page={page}
                        totalPages={totalPages}
                        onPrev={() => setPage((p) => Math.max(1, p - 1))}
                        onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
                        onPageSelect={setPage}
                    />
                )}
            </div>

            <TransactionDetailModal
                item={selectedItem}
                open={!!selectedItem}
                onClose={() => setSelectedItem(null)}
            />
        </div>
    );
}
