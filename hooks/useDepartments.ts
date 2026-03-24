"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { departmentService } from "@/services/department-service";
import { extractErrorMessage } from "@/lib/error-utils";
import {
    Department,
    DepartmentType,
    DepartmentListResponse
} from "@/types/department-types";
export function useDepartments() {
    const [allItems, setAllItems] = useState<Department[]>([]);
    const [departmentTypes, setDepartmentTypes] = useState<DepartmentType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");

    const loadDepartmentTypes = useCallback(async () => {
        try {
            const types = await departmentService.listTypes();
            setDepartmentTypes(types);
        } catch (err) {
            console.error("Failed to load department types", extractErrorMessage(err));
        }
    }, []);

    const loadDepartments = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res: DepartmentListResponse = await departmentService.list({
                page: 1,
                limit: 100, // Fetch up to 100 for client-side search/sort
            });
            setAllItems(res.data);
        } catch (err) {
            setError(extractErrorMessage(err, "Failed to load departments."));
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
                const normalizedName = d.department_name.toLowerCase().replace(/\s+/g, " ").trim();
                const normalizedCode = d.department_code.toLowerCase().replace(/\s+/g, " ").trim();
                return normalizedName.includes(normalizedSearch) || normalizedCode.startsWith(normalizedSearch);
            });
            
            result = [...result].sort((a, b) => {
                const aName = a.department_name.toLowerCase().replace(/\s+/g, " ").trim();
                const bName = b.department_name.toLowerCase().replace(/\s+/g, " ").trim();
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
    const paginatedDepartments = useMemo(() => {
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
        loadDepartmentTypes();
    }, [loadDepartmentTypes]);

    useEffect(() => {
        loadDepartments();
    }, [loadDepartments]);

    const refresh = () => loadDepartments();

    return {
        departments: paginatedDepartments,
        allItems,
        pagination: activePagination,
        departmentTypes,
        loading,
        error,
        page,
        setPage,
        search,
        setSearch,
        refresh,
    };
}