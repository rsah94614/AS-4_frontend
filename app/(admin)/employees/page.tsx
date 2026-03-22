"use client";

import React, { useState } from "react";
import {
    Users, FileSpreadsheet
} from "lucide-react";


import { useToast, ToastContainer } from "@/components/features/admin/roles/UIHelpers";
import { AdminPageHeader } from "@/components/features/admin/shared/AdminControlPanelPageHeader";

import { EmployeeListSection } from "@/components/features/admin/employees/EmployeeListSection";
import { BulkImportSection } from "@/components/features/admin/employees/BulkImportSection";
import { Tab } from "@/types/employee-types";




const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "list", label: "Employees", icon: <Users className="w-4 h-4" /> },
    { id: "bulk", label: "Bulk Import", icon: <FileSpreadsheet className="w-4 h-4" /> },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function EmployeesPage() {
    const { toasts, show: toast } = useToast();
    const [tab, setTab] = useState<Tab>("list");

    return (
        <>
            <main className="flex-1 overflow-y-auto bg-muted">

                {/* Page Header */}
                <AdminPageHeader
                    title="Employee Management"
                    subtitle="Create employees · Bulk import · Manage profiles & hierarchy"
                />

                {/* Tab bar */}
                <div className="bg-white border-b border-border px-8 md:px-10">
                    <div className="mx-auto flex">
                        {TABS.map((t) => {
                            const active = tab === t.id;
                            return (
                                <button key={t.id} onClick={() => setTab(t.id)}
                                    className="flex items-center gap-2 px-5 py-3.5 text-[13px] font-semibold border-b-2 transition-all -mb-px whitespace-nowrap"
                                    style={active
                                        ? { color: "#003580", borderColor: "#003580" }
                                        : { color: "#9CA3AF", borderColor: "transparent" }}>
                                    {t.icon}{t.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content */}
                <div className="px-8 md:px-10 py-6">
                    <div className="mx-auto">
                        {tab === "list" && <EmployeeListSection toast={toast} />}
                        {tab === "bulk" && <BulkImportSection toast={toast} />}
                    </div>
                </div>

            </main>
            <ToastContainer toasts={toasts} />
        </>
    );
}


