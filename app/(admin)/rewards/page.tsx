"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus } from "lucide-react";

import { extractErrorMessage } from "@/lib/error-utils";
import { Category, RewardItem } from "@/types/reward-types";
import { fetchAdminCatalog, fetchAdminCategories } from "@/services/rewards-service";

// Modular Components
import { RewardGrid } from "@/components/features/admin/rewards/RewardGrid";
import { RewardModal } from "@/components/features/admin/rewards/RewardModal";
import { RestockModal } from "@/components/features/admin/rewards/RestockModal";
import { RewardStats } from "@/components/features/admin/rewards/UIHelpers";
import { AdminPageHeader } from "@/components/features/admin/shared/AdminControlPanelPageHeader";
import { AdminSearchBar } from "@/components/features/admin/shared/AdminSearchBar";
import { useSuccessToast, SuccessToastContainer } from "@/components/shared/SuccessToast";

import ProtectedRoute from "@/components/features/auth/ProtectedRoute"
export default function RewardsPage() {
  const [items, setItems] = useState<RewardItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [filterState, setFilterState] = useState<"all" | "active" | "inactive">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [modal, setModal] = useState<null | "create" | "edit" | "restock">(null);
  const [selected, setSelected] = useState<RewardItem | undefined>();
  const { toasts, show: showToast } = useSuccessToast();

  // ─── Data Fetching ────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch up to 100 items to do complete local filtering and pagination, avoiding grid gaps
      const [cats, catalog] = await Promise.all([
        fetchAdminCategories(),
        fetchAdminCatalog({ page: 1, size: 100 })
      ]);

      setCategories(cats as Category[]);
      setItems(catalog.data as unknown as RewardItem[]);
    } catch (e: unknown) {
      setError(extractErrorMessage(e, "Failed to load catalog. Check your connection."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Compute stats directly from the fetched items — no separate API call needed
  const globalStats = useMemo(() => ({
    total: items.length,
    active: items.filter(i => i.is_active).length,
    inactive: items.filter(i => !i.is_active).length,
  }), [items]);

  // Reset page to 1 whenever the search term changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  // ─── Shared Filtering (single source of truth) ────────────────────────────
  const filteredItems = useMemo(() => {
    let result = items;
    if (filterState === "inactive") result = result.filter((i) => !i.is_active);
    else if (filterState === "active") result = result.filter((i) => i.is_active);

    if (search) {
      const normalizedSearch = search.toLowerCase().replace(/\s+/g, " ").trim();
      result = result.filter((i) => {
        const normalizedName = i.reward_name.toLowerCase().replace(/\s+/g, " ").trim();
        const normalizedCode = i.reward_code.toLowerCase().replace(/\s+/g, " ").trim();
        return normalizedName.includes(normalizedSearch) || normalizedCode.startsWith(normalizedSearch);
      });
      // Sort: name starts with search first, then includes-match, then code-match
      result = [...result].sort((a, b) => {
        const normalizedSearch2 = normalizedSearch;
        const aName = a.reward_name.toLowerCase().replace(/\s+/g, " ").trim();
        const bName = b.reward_name.toLowerCase().replace(/\s+/g, " ").trim();
        const aStartsName = aName.startsWith(normalizedSearch2) ? 0 : 1;
        const bStartsName = bName.startsWith(normalizedSearch2) ? 0 : 1;
        if (aStartsName !== bStartsName) return aStartsName - bStartsName;
        const aIncludes = aName.includes(normalizedSearch2) ? 0 : 1;
        const bIncludes = bName.includes(normalizedSearch2) ? 0 : 1;
        return aIncludes - bIncludes;
      });
    }

    return result;
  }, [items, search, filterState]);

  // ─── Paginated Display Items ───────────────────────────────────────────────
  const displayItems = useMemo(() => {
    return filteredItems.slice((page - 1) * 12, page * 12);
  }, [filteredItems, page]);

  const displayPagination = useMemo(() => {
    const total = filteredItems.length;
    const total_pages = Math.ceil(total / 12) || 1;

    return {
      current_page: page,
      per_page: 12,
      total: total,
      total_pages: total_pages,
      has_next: page < total_pages,
      has_previous: page > 1,
    };
  }, [filteredItems, page]);

  // ─── Modal Helpers ────────────────────────────────────────────────────────
  const close = () => {
    setModal(null);
    setSelected(undefined);
  };
  const saved = (msg?: string) => {
    close();
    load();
    showToast(msg || "Action completed successfully");
  };

  return (
      <ProtectedRoute adminOnly pathPrefix="/v1/rewards/catalog">
    <main className="flex-1 w-full min-h-screen bg-white mx-auto shadow-[0_10px_50px_rgba(0,0,0,0.04)]">

      {/* ─── Page Header ─── */}
      <AdminPageHeader
        title="Reward Catalog"
        subtitle="Create and manage individual items in your reward list"
      />

      {/* ─── Content Area ─── */}
      <div className="px-8 md:px-10 py-8">

        {/* ─── Toolbar ─── */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Search */}
          <AdminSearchBar value={search} onChange={setSearch} />

          {/* Filter tabs */}
          <RewardStats
            total={globalStats.total}
            active={globalStats.active}
            inactive={globalStats.inactive}
            filterState={filterState}
            setFilterState={(v: "all" | "active" | "inactive") => {
              setFilterState(v);
              setPage(1);
            }}
          />

          <button
            onClick={() => setModal("create")}
            className="ml-auto flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-widest text-white whitespace-nowrap transition-all hover:opacity-90 active:scale-95 bg-primary"
          >
            <Plus size={13} />
            Add Reward
          </button>
        </div>

        {/* ─── Grid / Empty / Error / Loading ─── */}
        <RewardGrid
          items={displayItems}
          loading={loading}
          error={error}
          pagination={displayPagination}
          page={page}
          setPage={setPage}
          onRetry={load}
          onEdit={(item) => {
            setSelected(item);
            setModal("edit");
          }}
          onRestock={(item) => {
            setSelected(item);
            setModal("restock");
          }}
          onCreateNew={() => setModal("create")}
        />
      </div>

      {/* Modals */}
      <RewardModal
        isOpen={modal === "create"}
        categories={categories}
        onClose={close}
        onSave={() => saved("Reward created successfully")}
      />
      <RewardModal
        isOpen={modal === "edit" && !!selected}
        item={selected}
        categories={categories}
        onClose={close}
        onSave={() => saved("Reward updated successfully")}
      />
      {selected && (
        <RestockModal
          isOpen={modal === "restock"}
          item={selected}
          onClose={close}
          onSave={() => saved("Stock updated successfully")}
        />
      )}
      <SuccessToastContainer toasts={toasts} />
    </main>
     </ProtectedRoute>
  );
}