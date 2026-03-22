"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { auth } from "@/services/auth-service";
import {
  fetchCategories,
  fetchWallet,
  fetchAllActiveCatalog
} from "@/services/rewards-service";
import { extractErrorMessage } from "@/lib/error-utils";

import {
  RewardItem,
  CategoryInfo,
  WalletData,
  DialogState,
  RedemptionResponse,
} from "@/types/redeem-types";

const PAGE_SIZE = 20;

export function useRedeem() {
  const [allItems, setAllItems] = useState<RewardItem[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [dialogState, setDialogState] = useState<DialogState | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const user = auth.getUser();
      if (!user?.employee_id) throw new Error("Not authenticated");

      const [catalogData, catsData, walletData] = await Promise.all([
        fetchAllActiveCatalog(),
        fetchCategories(),
        fetchWallet(user.employee_id),
      ]);

      setAllItems(catalogData);
      setCategories(catsData);
      setWallet(walletData);
    } catch (e) {
      setError(extractErrorMessage(e, "Failed to load data"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadInitial(); }, [loadInitial]);

  // Auto-refetch when user switches back to this tab (e.g. after editing in admin)
  useEffect(() => {
    const handleFocus = () => {
      loadInitial();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [loadInitial]);

  // When page changes
  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // When category changes
  const handleCategoryChange = useCallback((cat: string) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  }, []);

  // Filter out categories that have NO active items
  const activeCategories = useMemo(() => {
    return categories.filter(cat => 
      allItems.some(item => item.category?.category_id === cat.category_id)
    );
  }, [categories, allItems]);

  const filteredItems = useMemo(() => {
    if (activeCategory === "ALL") return allItems;
    return allItems.filter((i) => i.category?.category_id === activeCategory);
  }, [allItems, activeCategory]);

  const voucherItems = useMemo(() =>
    filteredItems.filter((i) =>
      i.reward_code.toLowerCase().includes("voucher") ||
      (i.category?.category_code || "").toLowerCase().includes("voucher")
    ), [filteredItems]);

  const allProductItems = useMemo(() =>
    filteredItems.filter((i) => !voucherItems.includes(i)),
    [filteredItems, voucherItems]);

  // Client-side pagination for filtered category results
  const filteredTotalPages = Math.max(1, Math.ceil(allProductItems.length / PAGE_SIZE));

  const productItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return allProductItems.slice(start, start + PAGE_SIZE);
  }, [allProductItems, currentPage]);

  // Unified pagination info for the UI
  const activePagination = useMemo(() => {
    return {
      current_page: currentPage,
      per_page: PAGE_SIZE,
      total: allProductItems.length,
      total_pages: filteredTotalPages,
      has_next: currentPage < filteredTotalPages,
      has_previous: currentPage > 1,
    };
  }, [currentPage, allProductItems.length, filteredTotalPages]);

  const availablePoints = wallet?.available_points ?? 0;

  function openRedeem(item: RewardItem) {
    setDialogState({ phase: "confirm", item });
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setTimeout(() => setDialogState(null), 200);
  }

  function handleSuccess(result: RedemptionResponse, ptsSpent: number) {
    setWallet((prev) =>
      prev
        ? {
          ...prev,
          available_points: prev.available_points - ptsSpent,
          redeemed_points: prev.redeemed_points + ptsSpent,
        }
        : prev
    );

    setAllItems((prev) =>
      prev.map((i) => {
        if (
          dialogState?.phase === "confirm" &&
          i.catalog_id === dialogState.item.catalog_id
        ) {
          const newStock = i.available_stock - 1;
          return {
            ...i,
            available_stock: newStock,
            stock_status:
              newStock <= 0
                ? "Out of Stock"
                : newStock < 10
                  ? "Limited Stock"
                  : "In Stock",
          };
        }
        return i;
      })
    );
  }

  return {
    items: [], // Deprecated
    categories: activeCategories,
    wallet,
    loading,
    categoryLoading: false, // We load all items upfront now
    error,
    availablePoints,
    activeCategory,
    setActiveCategory: handleCategoryChange,
    filteredItems,
    productItems,
    pagination: activePagination,
    currentPage,
    goToPage,
    dialogState,
    dialogOpen,
    openRedeem,
    closeDialog,
    handleSuccess,
    reload: loadInitial,
  };
}