"use client";

import { useState } from "react";
import { Search, RefreshCw, Plus, X } from "lucide-react";
import { useDepartments } from "@/hooks/useDepartments";
import { Department } from "@/types/department-types";
import { DepartmentStats } from "@/components/features/admin/departments/DepartmentStats";
import { DepartmentTable } from "@/components/features/admin/departments/DepartmentTable";
import { DepartmentModal } from "@/components/features/admin/departments/DepartmentModal";
import { AdminPageHeader } from "@/components/features/admin/AdminControlPanelPageHeader";

export default function DepartmentsPage() {
    const {
        departments,
        allItems,
        pagination,
        departmentTypes,
        loading,
        error,
        setPage,
        search,
        setSearch,
        refresh,
    } = useDepartments();

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
    const openCreate = () => {
        setSelectedDepartment(null);
        setModalOpen(true);
    };

    const openEdit = (dept: Department) => {
        setSelectedDepartment(dept);
        setModalOpen(true);
    };

    const totalCount = allItems.length;
    const activeCount = allItems.filter(d => d.is_active).length;
    const typeCount = new Set(allItems.map(d => d.department_type?.type_code).filter(Boolean)).size;
    const showStatsSkeleton = loading && departments.length === 0 && !pagination;
    const sectionSpacing = "space-y-4 sm:space-y-5";

    return (
        <>
            <main className="flex-1 w-full min-h-screen bg-white mx-auto shadow-[0_10px_50px_rgba(0,0,0,0.04)]">
                {/* ─── Page Header ─── */}
                <AdminPageHeader
                    title="Departments"
                    subtitle="Create and manage your organization's departments"
                />

                <div className="px-8 md:px-10 py-8 space-y-6">
                    <DepartmentStats total={totalCount} active={activeCount} types={typeCount} loading={showStatsSkeleton} />

                    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm px-6 py-5 ${sectionSpacing}`}>
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
                            <button
                                onClick={openCreate}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 font-semibold text-white px-5 py-2.5 text-sm rounded-lg transition-all hover:opacity-90 active:scale-95"
                                style={{ backgroundColor: "#004C8F" }}
                            >
                                <Plus className="w-4 h-4" />
                                Add Department
                            </button>
                            <button
                                onClick={refresh}
                                className="w-full sm:w-10 h-10 flex items-center justify-center rounded-lg transition-all hover:bg-muted sm:ml-auto"
                                style={{ border: "1.5px solid #d1d5db", color: "#6b7280" }}
                                title="Refresh"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        </div>

                        {error && (
                            <div
                                className="px-4 py-3 rounded-lg text-sm"
                                style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c" }}
                            >
                                {error}
                            </div>
                        )}

                        <DepartmentTable
                            departments={departments}
                            loading={loading}
                            pagination={pagination}
                            onPageChange={setPage}
                            onEdit={openEdit}
                        />
                    </div>
                </div>
            </main>

            <DepartmentModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSuccess={refresh}
                selectedDepartment={selectedDepartment}
                departmentTypes={departmentTypes}
            />
        </>
    );
}
