"use client";

import { useState } from "react";
import { RefreshCw, Plus } from "lucide-react";

import { useDesignations } from "@/hooks/useDesignations";
import { Designation } from "@/types/designation-types";
import { Button } from "@/components/ui/button";
import { DesignationStats } from "@/components/features/admin/designations/DesignationStats";
import { DesignationTable } from "@/components/features/admin/designations/DesignationTable";
import { DesignationModal } from "@/components/features/admin/designations/DesignationModal";
import { AdminPageHeader } from "@/components/features/admin/shared/AdminControlPanelPageHeader";
import { AdminSearchBar } from "@/components/features/admin/shared/AdminSearchBar";

export default function DesignationsPage() {
    const {
        designations,
        allItems,
        pagination,
        loading,
        error,
        setPage,
        search,
        setSearch,
        refresh,
    } = useDesignations();

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDesignation, setSelectedDesignation] = useState<Designation | null>(null);
    const openCreate = () => {
        setSelectedDesignation(null);
        setModalOpen(true);
    };

    const openEdit = (desig: Designation) => {
        setSelectedDesignation(desig);
        setModalOpen(true);
    };

    const totalCount = allItems.length;
    const activeCount = allItems.filter(d => d.is_active).length;
    const avgLevel = allItems.length
        ? (allItems.reduce((s, d) => s + d.level, 0) / allItems.length).toFixed(1)
        : "-";
    const showStatsSkeleton = loading && designations.length === 0 && !pagination;
    const sectionSpacing = "space-y-4 sm:space-y-5";

    return (
        <>
            <main className="flex-1 w-full min-h-screen bg-white mx-auto shadow-[0_10px_50px_rgba(0,0,0,0.04)]">
                {/* ─── Page Header ─── */}
                <AdminPageHeader
                    title="Designations"
                    subtitle="Create and manage employee designations"
                />
                <div className="px-8 md:px-10 py-8 space-y-6">
                    <DesignationStats total={totalCount} active={activeCount} avgLevel={avgLevel} loading={showStatsSkeleton} />

                    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm px-6 py-5 ${sectionSpacing}`}>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <AdminSearchBar value={search} onChange={setSearch} />
                            <Button
                                onClick={openCreate}
                                className="h-10 w-full sm:w-auto px-5 rounded-lg font-semibold text-white hover:opacity-90"
                            >
                                <Plus className="w-4 h-4 " />
                                Designation
                            </Button>
                            <Button
                                variant="outline"
                                onClick={refresh}
                                className="h-10 w-full sm:w-10 sm:ml-auto p-0 rounded-lg border-border text-muted-foreground hover:bg-muted"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </Button>
                        </div>

                        {error && (
                            <div
                                className="px-4 py-3 rounded-lg text-sm"
                                style={{
                                    backgroundColor: "#fef2f2",
                                    border: "1px solid #fecaca",
                                    color: "#b91c1c",
                                }}
                            >
                                {error}
                            </div>
                        )}

                        <DesignationTable
                            designations={designations}
                            loading={loading}
                            pagination={pagination}
                            onPageChange={setPage}
                            onEdit={openEdit}
                        />
                    </div>
                </div>
            </main>

            <DesignationModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSuccess={refresh}
                selectedDesignation={selectedDesignation}
            />
        </>
    );
}
