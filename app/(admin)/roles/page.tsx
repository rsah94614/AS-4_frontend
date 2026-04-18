"use client";

import React, { useState } from "react";
import { Shield, UserPlus, Lock } from "lucide-react";
import { AdminPageHeader } from "@/components/features/admin/shared/AdminControlPanelPageHeader";


import { useSuccessToast, SuccessToastContainer } from "@/components/shared/SuccessToast";
import { RolesSection } from "@/components/features/admin/roles/RolesSection";
import { AssignmentsSection } from "@/components/features/admin/roles/AssignmentsSection";
import { RoutePermissionsSection } from "@/components/features/admin/roles/RoutePermissionsSection";
import ProtectedRoute from "@/components/features/auth/ProtectedRoute"
type Tab = "roles" | "assignments" | "permissions";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "roles", label: "Roles", icon: <Shield className="w-4 h-4" /> },
    { id: "assignments", label: "Assignments", icon: <UserPlus className="w-4 h-4" /> },
    { id: "permissions", label: "Route Permissions", icon: <Lock className="w-4 h-4" /> },
];

export default function RolesPage() {
    const [tab, setTab] = useState<Tab>("roles");
    const { toasts, show: toast } = useSuccessToast();

    return (
        <ProtectedRoute adminOnly pathPrefix="/aabhar/v1/roles">
        <>
            <main className="flex-1 w-full min-h-screen bg-white mx-auto shadow-[0_10px_50px_rgba(0,0,0,0.04)]">

                {/* ─── Page Header ─── */}
                <AdminPageHeader
                    title="Roles & Permissions"
                    subtitle="Manage roles, assignments and route permissions"
                />

                {/* ── Tab bar ── */}
                <div className="bg-white px-3 sm:px-5 lg:px-8">
                    <div className="mx-auto flex overflow-x-auto overflow-y-hidden scrollbar-thin">
                        {TABS.map((t) => {
                            const active = tab === t.id;
                            return (
                                <button
                                    key={t.id}
                                    onClick={() => setTab(t.id)}
                                    className="flex shrink-0 items-center gap-2 px-3 sm:px-5 py-3.5 sm:py-4 text-xs sm:text-sm font-semibold border-b-2 transition-all -mb-px whitespace-nowrap"
                                    style={
                                        active
                                            ? { color: "#004C8F", borderColor: "#E31837" }
                                            : { color: "#9CA3AF", borderColor: "transparent" }
                                    }
                                >
                                    {t.icon}
                                    {t.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ── Main content ── */}
                <div className="px-8 md:px-10 py-8 space-y-6">
                    <div className="mx-auto">
                        {tab === "roles" && <RolesSection toast={toast} />}
                        {tab === "assignments" && <AssignmentsSection toast={toast} />}
                        {tab === "permissions" && <RoutePermissionsSection toast={toast} />}
                    </div>
                </div>

            </main>
            <SuccessToastContainer toasts={toasts} />
        </>
        </ProtectedRoute>
    );
}
