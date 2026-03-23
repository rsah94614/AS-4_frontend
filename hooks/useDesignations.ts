"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { designationService } from "@/services/designation-service";
import { extractErrorMessage } from "@/lib/error-utils";
import {
    Designation,
    DesignationListResponse,
} from "@/types/designation-types";
export function useDesignations() {
    const [allItems, setAllItems] = useState<Designation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");

    const loadDesignations = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res: DesignationListResponse = await designationService.list({
                page: 1,
                limit: 100, // Fetch up to 100 for client-side sort/filter
            });
            setAllItems(res.data);
        } catch (err) {
            setError(extractErrorMessage(err, "Failed to load designations."));
        } finally {
            setLoading(false);
        }
    }, []);

    // Filter and sort client-side
    const filteredAndSorted = useMemo(() => {
        let result = allItems;
        if (search) {
            const normalizedSearch = search.toLowerCase().replace(/\s+/g, " ").trim();
            result = result.filter((d) => {
                const normalizedName = d.designation_name.toLowerCase().replace(/\s+/g, " ").trim();
                const normalizedCode = d.designation_code.toLowerCase().replace(/\s+/g, " ").trim();
                return normalizedName.includes(normalizedSearch) || normalizedCode.startsWith(normalizedSearch);
            });
            
            result = [...result].sort((a, b) => {
                const aName = a.designation_name.toLowerCase().replace(/\s+/g, " ").trim();
                const bName = b.designation_name.toLowerCase().replace(/\s+/g, " ").trim();
                const aStarts = aName.startsWith(normalizedSearch) ? 0 : 1;
                const bStarts = bName.startsWith(normalizedSearch) ? 0 : 1;
                if (aStarts !== bStarts) return aStarts - bStarts;
                const aIncludes = aName.includes(normalizedSearch) ? 0 : 1;
                const bIncludes = bName.includes(normalizedSearch) ? 0 : 1;
                return aIncludes - bIncludes;
            });
        }
        return result;
    }, [allItems, search]);

    // Reset pagination on search
    useEffect(() => {
        setPage(1);
    }, [search]);

    // Client pagination
    const PAGE_SIZE = 10;
    const paginatedDesignations = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return filteredAndSorted.slice(start, start + PAGE_SIZE);
    }, [filteredAndSorted, page]);

    const activePagination = useMemo(() => {
        const total = filteredAndSorted.length;
        const total_pages = Math.ceil(total / PAGE_SIZE) || 1;
        return {
            current_page: page,
            per_page: PAGE_SIZE,
            total,
            total_pages,
            has_next: page < total_pages,
            has_previous: page > 1,
        };
    }, [filteredAndSorted.length, page]);

    useEffect(() => {
        loadDesignations();
    }, [loadDesignations]);

    const refresh = () => loadDesignations();

    return {
        designations: paginatedDesignations,
        allItems,
        pagination: activePagination,
        loading,
        error,
        page,
        setPage,
        search,
        setSearch,
        refresh,
    };
}