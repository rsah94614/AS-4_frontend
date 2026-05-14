"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useHistoryData } from "@/hooks/useHistoryData";
import HistoryFilterBar from "@/components/features/dashboard/history/HistoryFilterBar";
import HistoryList from "@/components/features/dashboard/history/HistoryList";
import HistoryPagination from "@/components/features/dashboard/history/HistoryPagination";
import dynamic from "next/dynamic";
import type { HistoryItem } from "@/types/history-types";
import { PageHeader } from "@/components/shared/PageHeader";

const TransactionDetailModal = dynamic(
  () => import("@/components/features/dashboard/history/TransactionDetailModal"),
  { ssr: false }
);

export default function HistoryPage() {
  const searchParams = useSearchParams();

  const {
    selectedPeriod, setSelectedPeriod,
    clearFilters,
    allHistory, filteredHistory, paginatedHistory,
    loading, error, retry,
    page, setPage, totalPages,
  } = useHistoryData();

  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  // Auto-open dialog when ?open=<history_id> is in the URL
  useEffect(() => {
    const openId = searchParams.get("open");
    if (!openId || loading || allHistory.length === 0) return;

    const match = allHistory.find(
      (item) => item.history_id === openId
    );
    if (match) {
      setSelectedItem(match);
    }
  }, [searchParams, allHistory, loading]);

  function closeDropdowns() {
    setPeriodDropdownOpen(false);
    setTypeDropdownOpen(false);
  }

  return (
    <div
      className="flex-1 w-full min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_45%,#ffffff_100%)] mx-auto shadow-[0_10px_50px_rgba(15,23,42,0.05)]"
      onClick={closeDropdowns}
    >
      <PageHeader
        title="History"
        subtitle="Review every point movement, reward redemption, and supporting transaction detail in one place."
      />

      <div className="h-0.5 shrink-0" />

      <div className="px-6 md:px-10 py-8 md:py-10 mx-auto rounded-b-[24px]">
        <HistoryFilterBar
    selectedPeriod={selectedPeriod}
    setSelectedPeriod={setSelectedPeriod}
    clearFilters={clearFilters}
    filteredCount={filteredHistory.length}
    periodDropdownOpen={periodDropdownOpen}
    setPeriodDropdownOpen={setPeriodDropdownOpen}
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