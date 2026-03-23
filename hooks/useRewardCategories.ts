"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { extractErrorMessage } from "@/lib/error-utils";
import { rewardsClient } from "@/services/api-clients";
import { Category, CategoryFilter } from "@/types/reward-types";



export function useRewardCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [filterState, setFilterState] = useState<CategoryFilter>("all");
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 10;

    // Modal states
    const [modal, setModal] = useState<null | "create" | "edit">(null);
    const [selected, setSelected] = useState<Category | undefined>();

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // 3. Make the call using relative paths! No more double-proxy or CORS issues.
            const res = await rewardsClient.get(`/categories?active_only=false`);
            
            // Axios automatically resolves JSON into the `.data` property
            setCategories(res.data);
            
        } catch (err) {
            setError(extractErrorMessage(err, "Failed to load categories."));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const filtered = useMemo(() => {
        let result = categories.filter(c => {
            if (filterState === "active") return c.is_active;
            if (filterState === "inactive") return !c.is_active;
            return true;
        });

        if (search) {
            const normalizedSearch = search.toLowerCase().replace(/\s+/g, " ").trim();
            result = result.filter(c => {
                const normalizedName = c.category_name.toLowerCase().replace(/\s+/g, " ").trim();
                const normalizedCode = c.category_code.toLowerCase().replace(/\s+/g, " ").trim();
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
    }, [categories, search, filterState]);

    const activeCount = useMemo(() => categories.filter(c => c.is_active).length, [categories]);

    // Reset page on filter/search change
    useEffect(() => {
        setPage(1);
    }, [search, filterState]);

    // Client-side pagination
    const paginatedFiltered = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return filtered.slice(start, start + PAGE_SIZE);
    }, [filtered, page]);

    const pagination = useMemo(() => {
        const total = filtered.length;
        const total_pages = Math.ceil(total / PAGE_SIZE) || 1;
        return {
            current_page: page,
            per_page: PAGE_SIZE,
            total,
            total_pages,
            has_next: page < total_pages,
            has_previous: page > 1,
        };
    }, [filtered.length, page]);

    const openCreate = () => setModal("create");
    const openEdit = (cat: Category) => {
        setSelected(cat);
        setModal("edit");
    };
    const closeModal = () => {
        setModal(null);
        setSelected(undefined);
    };

    const handleSaved = () => {
        closeModal();
        load();
    };

    return {
        categories,
        filtered: paginatedFiltered,
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
        page,
        setPage,
        refresh: load
    };
}