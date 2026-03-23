import { useState, useEffect, useCallback, useMemo } from "react";
import { extractErrorMessage } from "@/lib/error-utils";
import { recognitionClient as client } from "@/services/api-clients";
import {
  ReviewCategory,
  ReviewCategoryCreatePayload,
  ReviewCategoryUpdatePayload,
} from "@/types/review-category-types";

const BASE_URL = "/review-categories";

export function useReviewCategories(activeOnly: boolean | null = null, search: string = "") {
  const [categories, setCategories] = useState<ReviewCategory[]>([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [page, setPage]             = useState(1);
  const PAGE_SIZE = 10;

  const fetchCategories = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = { page: "1", page_size: "100" };
      params.active_only = "false"; // Fetch all to filter locally

      const res = await client.get<{ data: ReviewCategory[] }>(BASE_URL, { params });
      setCategories(res.data?.data ?? []);
    } catch (e: unknown) {
      setError(extractErrorMessage(e, "Failed to load categories"));
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const createCategory = useCallback(
    async (payload: ReviewCategoryCreatePayload): Promise<ReviewCategory> => {
      const res = await client.post<ReviewCategory>(BASE_URL, payload);
      await fetchCategories(true);
      return res.data;
    },
    [fetchCategories]
  );

  const updateCategory = useCallback(
    async (id: string, payload: ReviewCategoryUpdatePayload): Promise<ReviewCategory> => {
      // Optimistically update the local state for instant UI feedback
      setCategories((prev) =>
        prev.map((c) => (c.category_id === id ? { ...c, ...payload } : c))
      );

      try {
        const res = await client.put<ReviewCategory>(`${BASE_URL}/${id}`, payload);
        // Refresh silently in background to ensure sync with server
        fetchCategories(true);
        return res.data;
      } catch (err) {
        // Revert on failure by refetching
        fetchCategories(true);
        throw err;
      }
    },
    [fetchCategories]
  );

  const filteredCategories = useMemo(() => {
    let result = categories;
    if (activeOnly !== null) {
      result = result.filter((c) => c.is_active === activeOnly);
    }
    if (search.trim()) {
      const normalizedSearch = search.toLowerCase().replace(/\s+/g, " ").trim();
      result = result.filter((s) => {
        const normalizedName = s.category_name.toLowerCase().replace(/\s+/g, " ").trim();
        const normalizedCode = s.category_code.toLowerCase().replace(/\s+/g, " ").trim();
        return normalizedName.includes(normalizedSearch) || normalizedCode.startsWith(normalizedSearch);
      });

      result = [...result].sort((a, b) => {
        const aName = a.category_name.toLowerCase().replace(/\s+/g, " ").trim();
        const bName = b.category_name.toLowerCase().replace(/\s+/g, " ").trim();
        const aStarts = aName.startsWith(normalizedSearch) ? 0 : 1;
        const bStarts = bName.startsWith(normalizedSearch) ? 0 : 1;
        if (aStarts !== bStarts) return aStarts - bStarts;
        const aIncludes = aName.includes(normalizedSearch) ? 0 : 1;
        const bIncludes = bName.includes(normalizedSearch) ? 0 : 1;
        return aIncludes - bIncludes;
      });
    }
    return result;
  }, [categories, activeOnly, search]);

  useEffect(() => {
    setPage(1);
  }, [search, activeOnly]);

  const paginatedCategories = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredCategories.slice(start, start + PAGE_SIZE);
  }, [filteredCategories, page]);

  const pagination = useMemo(() => {
      const total = filteredCategories.length;
      const total_pages = Math.ceil(total / PAGE_SIZE) || 1;
      return {
          current_page: page,
          per_page: PAGE_SIZE,
          total,
          total_pages,
          has_next: page < total_pages,
          has_previous: page > 1,
      };
  }, [filteredCategories.length, page]);

  return {
    categories: paginatedCategories,
    allCategories: categories,
    pagination,
    loading,
    error,
    createCategory,
    updateCategory,
    refetch: fetchCategories,
    page,
    setPage,
  };
}