"use client";

import dynamic from "next/dynamic";
import { Layers } from "lucide-react";
import { useRedeem } from "@/hooks/useRedeem";
import { Button } from "@/components/ui/button";
import WalletBanner from "@/components/features/dashboard/redeem/WalletBanner";
import RewardCard from "@/components/features/dashboard/redeem/RewardCard";
import { Skeleton } from "@/components/ui/skeleton";
// removed imports

const RedeemDialog = dynamic(
  () => import("@/components/features/dashboard/redeem/RedeemDialog"),
  { ssr: false }
);


export default function RedeemPage() {
  const redeem = useRedeem();

  if (redeem.error) return <div className="p-10">{redeem.error}</div>;

  if (redeem.loading) {
    return (
      <div className="flex-1 w-full min-h-screen bg-white mx-auto shadow-[0_10px_50px_rgba(0,0,0,0.04)]">
        {/* Page Header Skeleton */}
        <div className="bg-white border-b border-gray-100 px-8 md:px-10 py-6 rounded-t-[24px]">
          <div className="mx-auto flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
        </div>

        <div className="px-8 md:px-10 py-8 mx-auto rounded-b-[24px]">
          {/* Wallet Skeleton */}
          <div className="rounded-2xl bg-muted p-6 mb-10">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-10 w-32 rounded-xl" />
            </div>
          </div>

          {/* Categories Skeleton */}
          <div className="flex gap-2 flex-wrap mb-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-full" />
            ))}
          </div>

          {/* Products Skeleton */}
          <div className="flex items-center justify-between mb-5">
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-100 p-4 space-y-3">
                <Skeleton className="h-36 w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <div className="flex justify-between items-center pt-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-8 w-24 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full min-h-screen bg-white mx-auto shadow-[0_10px_50px_rgba(0,0,0,0.04)]">
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-gray-100 px-8 md:px-10 py-6 rounded-t-[24px]">
        <div className="mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-bold text-primary leading-tight">
              Reward Store
            </h1>
            <p className="text-[14px] text-muted-foreground mt-0.5">
              Browse rewards · Redeem with your earned points
            </p>
          </div>
          <span className="hidden lg:flex items-center text-xl font-black tracking-tight select-none shrink-0">
            <span className="text-destructive">A</span>
            <span className="text-primary">abhar</span>
          </span>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="px-8 md:px-10 py-8 mx-auto rounded-b-[24px]">
        <WalletBanner wallet={redeem.wallet} />

        {redeem.categories.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-8">
            <Button
              variant={redeem.activeCategory === "ALL" ? "default" : "outline"}
              size="sm"
              onClick={() => redeem.setActiveCategory("ALL")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${redeem.activeCategory === "ALL" ? "bg-white text-[#1E293B] border-[#1E293B] shadow-sm hover:bg-slate-50" : "bg-slate-100 text-slate-500 hover:bg-slate-200 border-transparent"
                }`}
            >
              All
            </Button>
            {redeem.categories.map((cat) => (
              <Button
                key={cat.category_id}
                variant={redeem.activeCategory === cat.category_id ? "default" : "outline"}
                size="sm"
                onClick={() => redeem.setActiveCategory(cat.category_id)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${redeem.activeCategory === cat.category_id ? "bg-white text-[#1E293B] border-[#1E293B] shadow-sm hover:bg-slate-50" : "bg-slate-100 text-slate-500 hover:bg-slate-200 border-transparent"
                  }`}
              >
                {cat.category_name}
              </Button>
            ))}
          </div>
        )}

        {/* Skeleton loading when switching categories */}
        {redeem.categoryLoading ? (
          <>
            <div className="flex items-center justify-between mb-5">
              <Skeleton className="h-7 w-28" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-slate-100 p-4 space-y-3 animate-pulse">
                  <Skeleton className="h-36 w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <div className="flex justify-between items-center pt-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-8 w-24 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : redeem.productItems.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[22px] font-semibold text-foreground">
                Products
              </h2>
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <Layers size={13} className="text-muted-foreground" />
                {redeem.activeCategory === "ALL" && redeem.pagination
                  ? redeem.pagination.total
                  : redeem.productItems.length} items
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {redeem.productItems.map((item) => (
                <RewardCard
                  key={item.catalog_id}
                  item={item}
                  canAfford={redeem.availablePoints >= item.default_points}
                  onRedeem={redeem.openRedeem}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {redeem.pagination && redeem.pagination.total_pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!redeem.pagination.has_previous}
                  onClick={() => redeem.goToPage(redeem.currentPage - 1)}
                  className="rounded-lg px-3 py-1.5 text-sm font-bold text-slate-800 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Previous
                </Button>

                {/* Page Numbers */}
                {(() => {
                  const totalPages = redeem.pagination!.total_pages;
                  const current = redeem.currentPage;
                  const pages: (number | string)[] = [];

                  if (totalPages <= 5) {
                    for (let i = 1; i <= totalPages; i++) pages.push(i);
                  } else {
                    pages.push(1);
                    if (current > 3) pages.push("...");
                    for (let i = Math.max(2, current - 1); i <= Math.min(totalPages - 1, current + 1); i++) {
                      pages.push(i);
                    }
                    if (current < totalPages - 2) pages.push("...");
                    pages.push(totalPages);
                  }

                  return pages.map((p, idx) =>
                    typeof p === "string" ? (
                      <span key={`ellipsis-${idx}`} className="px-2 text-foreground font-bold text-sm">
                        {p}
                      </span>
                    ) : (
                      <Button
                        key={p}
                        variant={p === current ? "default" : "outline"}
                        size="sm"
                        onClick={() => redeem.goToPage(p)}
                        className={`rounded-lg min-w-[36px] px-2 py-1.5 text-sm font-medium transition-all ${p === current ? "bg-[#004C8F] text-white shadow-sm hover:bg-[#003d73]" : "text-slate-800 font-bold hover:bg-slate-100 border-slate-200"
                          }`}
                      >
                        {p}
                      </Button>
                    )
                  );
                })()}

                <Button
                  variant="outline"
                  size="sm"
                  disabled={!redeem.pagination.has_next}
                  onClick={() => redeem.goToPage(redeem.currentPage + 1)}
                  className="rounded-lg px-3 py-1.5 text-sm font-bold text-slate-800 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next →
                </Button>
              </div>
            )}
          </>
        ) : null}
      </div>

      {/* Dialog */}
      <RedeemDialog
        open={redeem.dialogOpen}
        state={redeem.dialogState}
        availablePoints={redeem.availablePoints}
        walletId={redeem.wallet?.wallet_id ?? ""}
        onClose={redeem.closeDialog}
        onSuccess={redeem.handleSuccess}
      />
    </div>
  );
}
