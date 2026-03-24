"use client";

import React from "react";
import { Plus, X } from "lucide-react";
import { useRewardCategories } from "@/hooks/useRewardCategories";

// Modular Components
import { RewardStats } from "@/components/features/admin/rewards/UIHelpers";
import { CategoryModal } from "@/components/features/admin/rewards/CategoryModal";
import { CategoryTable } from "@/components/features/admin/rewards/CategoryTable";
import { AdminPageHeader } from "@/components/features/admin/shared/AdminControlPanelPageHeader";
import { AdminSearchBar } from "@/components/features/admin/shared/AdminSearchBar";
import { useSuccessToast, SuccessToastContainer } from "@/components/shared/SuccessToast";
import ProtectedRoute from "@/components/features/auth/ProtectedRoute"

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
  const { toasts, show: showToast } = useSuccessToast();

  return (
      <ProtectedRoute adminOnly pathPrefix="/v1/rewards/categories">
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

        {/* ─── Toolbar ─── */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Search */}
          <AdminSearchBar value={search} onChange={setSearch} />

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
            className="ml-auto flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-widest text-white whitespace-nowrap transition-all hover:opacity-90 active:scale-95 bg-primary"
          >
            <Plus size={13} />
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

      {/* Modal Logic */}
      {modal && (
        <CategoryModal
          isOpen={!!modal}
          category={selected}
          onClose={closeModal}
          onSave={() => {
            handleSaved();
            showToast(selected ? "Category updated successfully" : "Category created successfully");
          }}
        />
      )}
      <SuccessToastContainer toasts={toasts} />
    </main>
    </ProtectedRoute>
  );
}

