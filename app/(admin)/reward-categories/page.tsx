"use client";

import React from "react";
import { Search, X, Plus } from "lucide-react";
import { useRewardCategories } from "@/hooks/useRewardCategories";

// Modular Components
import { RewardStats } from "@/components/features/admin/rewards/UIHelpers";
import { CategoryModal } from "@/components/features/admin/rewards/CategoryModal";
import { CategoryTable } from "@/components/features/admin/rewards/CategoryTable";
import { AdminPageHeader } from "@/components/features/admin/shared/AdminControlPanelPageHeader";

export default function CategoriesPage() {
  const {
    categories,
    filtered,
    pagination,
    loading,
    error,
    search,
    setSearch,
    filterState,
    setFilterState,
    activeCount,
    modal,
    selected,
    openCreate,
    openEdit,
    closeModal,
    handleSaved,
    setPage,
    refresh
  } = useRewardCategories();

  return (
    <main className="flex-1 w-full min-h-screen bg-white mx-auto shadow-[0_10px_50px_rgba(0,0,0,0.04)]">

      {/* ─── Page Header ─── */}
      <AdminPageHeader
        title="Reward Categories"
        subtitle="Create and manage the categories for reward items"
      />

      {/* ─── Content Area ─── */}
      <div className="px-8 md:px-10 py-8">

        {/* Error Banner */}
        {error && !loading && (
          <div className="mb-6 bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-destructive">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                <X size={16} />
              </div>
              <div>
                <p className="text-sm font-bold">Error</p>
                <p className="text-xs text-destructive">{error}</p>
              </div>
            </div>
            <button
              onClick={refresh}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90 active:scale-95 bg-primary"
            >
              Retry
            </button>
          </div>
        )}

        {/* ─── Main Table Container ─── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-6 py-5 space-y-4 sm:space-y-5">
          {/* ─── Toolbar ─── */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value.trimStart())}
                placeholder="Search by name or code…"
                className="w-full pl-9 pr-8 py-2 rounded-lg border border-border bg-muted text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/10 focus:border-primary/40 transition-all"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Filter tabs */}
            {!loading && categories.length > 0 && (
              <RewardStats
                total={categories.length}
                active={activeCount}
                inactive={categories.length - activeCount}
                filterState={filterState}
                setFilterState={setFilterState}
              />
            )}

            <button
              onClick={openCreate}
              className="w-full sm:w-auto flex items-center justify-center gap-2 font-semibold text-white px-5 py-2.5 text-sm rounded-lg transition-all hover:opacity-90 active:scale-95 sm:ml-auto"
              style={{ backgroundColor: "#004C8F" }}
            >
              <Plus size={16} className="w-4 h-4" />
              Add Category
            </button>
          </div>

          {/* ─── Category Table ─── */}
          <CategoryTable
            categories={filtered}
            loading={loading}
            onEdit={openEdit}
            openCreate={openCreate}
            filterState={filterState}
            pagination={pagination}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* Modal Logic */}
      {modal && (
        <CategoryModal
          isOpen={!!modal}
          category={selected}
          onClose={closeModal}
          onSave={handleSaved}
        />
      )}
    </main>
  );
}

