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
        return categories
            .filter(c => {
                if (filterState === "active") return c.is_active;
                if (filterState === "inactive") return !c.is_active;
                return true;
            })
            .filter(c => {
                const lowerSearch = search.toLowerCase();
                if (!lowerSearch) return true;
                return (
                    c.category_name.toLowerCase().split(/\s+/).some(word => word.startsWith(lowerSearch)) ||
                    c.category_code.toLowerCase().startsWith(lowerSearch)
                );
            })
            .sort((a, b) => {
                if (!search) return 0;
                const lowerSearch = search.toLowerCase();
                const aStarts = a.category_name.toLowerCase().startsWith(lowerSearch) ? 0 : 1;
                const bStarts = b.category_name.toLowerCase().startsWith(lowerSearch) ? 0 : 1;
                if (aStarts !== bStarts) return aStarts - bStarts;
                const aWord = a.category_name.toLowerCase().split(/\s+/).some(w => w.startsWith(lowerSearch)) ? 0 : 1;
                const bWord = b.category_name.toLowerCase().split(/\s+/).some(w => w.startsWith(lowerSearch)) ? 0 : 1;
                return aWord - bWord;
            });
    }, [categories, search, filterState]);

    const activeCount = useMemo(() => categories.filter(c => c.is_active).length, [categories]);

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
        filtered,
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
        refresh: load
    };
}