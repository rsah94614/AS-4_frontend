"use client";

import { ChevronDown } from "lucide-react";
import { periodOptions } from "@/lib/history-utils";
import type { PeriodFilter } from "@/types/history-types";

interface HistoryFilterBarProps {
    selectedPeriod: PeriodFilter;
    setSelectedPeriod: (v: PeriodFilter) => void;
    clearFilters: () => void;
    filteredCount: number;
    periodDropdownOpen: boolean;
    setPeriodDropdownOpen: (v: boolean) => void;
}

export default function HistoryFilterBar({
    selectedPeriod,
    setSelectedPeriod,
    clearFilters,
    filteredCount,
    periodDropdownOpen,
    setPeriodDropdownOpen,
}: HistoryFilterBarProps) {
    const hasActiveFilter = selectedPeriod !== "All History";

    return (
        <div className="rounded-[24px] border border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4 sm:p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Refine Results
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-full border border-[#004C8F]/15 bg-[#004C8F]/5 px-3 py-1 text-sm font-medium text-[#004C8F]">
                            {filteredCount} {filteredCount === 1 ? "transaction" : "transactions"}
                        </span>
                        {hasActiveFilter && (
                            <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500">
                                Filters active
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            onClick={() => setPeriodDropdownOpen(!periodDropdownOpen)}
                            aria-expanded={periodDropdownOpen}
                            className={`inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-[0_6px_18px_rgba(15,23,42,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004C8F]/20 ${
                                selectedPeriod !== "All History" ? "border-[#004C8F]/20 bg-[#004C8F]/5 text-[#004C8F]" : ""
                            }`}
                        >
                            <span className="truncate max-w-[120px] sm:max-w-none">
                                {selectedPeriod}
                            </span>
                            <ChevronDown
                                className={`w-4 h-4 shrink-0 transition-transform duration-200 ${periodDropdownOpen ? "rotate-180" : ""}`}
                            />
                        </button>

                        {periodDropdownOpen && (
                            <div className="absolute top-full right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200/80 bg-white py-1 shadow-[0_18px_50px_rgba(15,23,42,0.14)] z-20 animate-in fade-in zoom-in-95 duration-150">
                                {periodOptions.map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => {
                                            setSelectedPeriod(option);
                                            setPeriodDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-5 py-2.5 text-sm transition-colors ${
                                            selectedPeriod === option
                                                ? "bg-[#004C8F]/5 text-[#003867] font-semibold"
                                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                                        }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {hasActiveFilter && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 transition-all duration-200 hover:border-[#004C8F]/20 hover:bg-[#004C8F]/5 hover:text-[#004C8F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004C8F]/20"
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}