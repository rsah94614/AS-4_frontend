"use client";

import React, { useEffect, useState, useCallback } from "react";
import { UserPlus, UserMinus, Loader2, ChevronDown, Users, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
    rolesApi,
    employeeRolesApi,
    type Role,
    type EmployeeRole,
} from "@/services/roles-service";
import { extractErrorMessage } from "@/lib/error-utils";
import type { ToastType } from "./UIHelpers";
import { HowItWorks } from "@/components/features/admin/shared/HowItWorks";
import PaginationControls from "@/components/shared/PaginationControls";
import { AdminSearchBar } from "@/components/features/admin/shared/AdminSearchBar";

interface AssignmentsSectionProps {
    toast: (msg: string, t?: ToastType) => void;
}





const ASSIGNMENT_STEPS = [
    { n: "01", title: "Find Employee ID", desc: "Employee IDs are found on the employee profile page in the admin panel." },
    { n: "02", title: "Select Role", desc: "Choose the appropriate role based on the employee's responsibilities." },
    { n: "03", title: "Confirm Access", desc: "Role takes effect immediately on the employee's next login." },
    { n: "04", title: "Revoke Anytime", desc: "Remove a role assignment at any time using the Revoke button in the table." },
];

export function AssignmentsSection({ toast }: AssignmentsSectionProps) {
    const [records, setRecords] = useState<EmployeeRole[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [submitting, setSub] = useState(false);
    const [revoking, setRevoking] = useState<string | null>(null);
    const [form, setForm] = useState({ employee_id: "", role_id: "" });
    const [search, setSearch] = useState("");
    const [confirmRevoke, setConfirmRevoke] = useState<EmployeeRole | null>(null);
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 10;

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const [emp, r] = await Promise.all([
                employeeRolesApi.listEmployeeRoles(),
                rolesApi.listRoles(),
            ]);
            setRecords(emp);
            setRoles(r);
        } catch (e: unknown) {
            toast(extractErrorMessage(e), "error");
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => { load(); }, [load]);

    const handleAssign = async () => {
        if (!form.employee_id.trim() || !form.role_id) {
            toast("Employee ID and role are required", "error");
            return;
        }
        try {
            setSub(true);
            await employeeRolesApi.assignRole(form);
            toast("Role assigned successfully");
            setOpen(false);
            setForm({ employee_id: "", role_id: "" });
            load();
        } catch (e: unknown) {
            toast(extractErrorMessage(e), "error");
        } finally {
            setSub(false);
        }
    };

    const handleRevoke = async () => {
        if (!confirmRevoke) return;
        try {
            setRevoking(confirmRevoke.employee_role_id);
            await employeeRolesApi.revokeRole({ employee_id: confirmRevoke.employee.id, role_id: confirmRevoke.role.id });
            toast("Role revoked");
            setConfirmRevoke(null);
            load();
        } catch (e: unknown) {
            toast(extractErrorMessage(e), "error");
        } finally {
            setRevoking(null);
        }
    };

    useEffect(() => {
        setPage(1);
    }, [search]);

    const filtered = records.filter(
        (r) =>
            r.employee.username.toLowerCase().includes(search.toLowerCase()) ||
            r.employee.email.toLowerCase().includes(search.toLowerCase()) ||
            r.role.name.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;

    const paginatedRecords = filtered.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE
    );

    return (
        <div className="w-full">
            <HowItWorks steps={ASSIGNMENT_STEPS} />

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">

                {/* Card header */}
                <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <Users size={14} className="text-[#004C8F]" />
                        <h2 className="text-sm font-bold text-[#004C8F]">Role Assignments</h2>
                        {!loading && (
                            <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full tabular-nums">
                                {records.length}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={() => setOpen(true)}
                        className="flex w-full sm:w-auto items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90 active:scale-95"
                        style={{ background: "#004C8F" }}
                    >
                        <UserPlus size={13} /> Assign Role
                    </button>
                </div>

                <div className="px-4 sm:px-6 py-3 border-b border-gray-100">
                    <AdminSearchBar
                        value={search}
                        onChange={setSearch}
                        placeholder="Search by name, email or role…"
                    />
                </div>

                {/* Body */}
                {loading ? (
                    <div className="p-6 space-y-3">
                        {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                            <UserPlus size={22} className="text-gray-300" />
                        </div>
                        <p className="text-sm font-semibold text-gray-500">
                            {search ? "No matching assignments" : "No assignments yet"}
                        </p>
                    </div>
                ) : (
                    <div>
                        <div className="md:hidden divide-y divide-gray-100">
                            {paginatedRecords.map((r) => (
                                <div key={r.employee_role_id} className="px-4 py-3.5 space-y-3">
                                    <div className="flex items-center min-w-0">
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-[#004C8F] truncate">{r.employee.username}</p>
                                            <p className="text-[11px] text-gray-400 truncate">{r.employee.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-[13px] font-semibold text-black">
                                            {r.role.name}
                                        </span>
                                        <p className="text-[11px] text-gray-400 text-right">
                                            {new Date(r.assigned_at).toLocaleDateString("en-IN", {
                                                day: "2-digit", month: "short", year: "numeric",
                                            })}
                                        </p>
                                    </div>

                                    <button
                                        disabled={revoking === r.employee_role_id}
                                        onClick={() => setConfirmRevoke(r)}
                                        className="inline-flex w-full items-center justify-center gap-1 px-3 py-2 rounded-md text-[11px] font-bold
                                            transition-all hover:bg-red-50 focus:ring-2 focus:ring-red-100 disabled:opacity-40 border border-red-200 bg-white shadow-sm"
                                        style={{ color: "#E31837" }}
                                    >
                                        {revoking === r.employee_role_id
                                            ? <Loader2 className="w-3 h-3 animate-spin" />
                                            : <UserMinus size={12} />}
                                        Revoke
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Table head */}
                        <div className="hidden md:grid px-4 sm:px-6 py-2.5 bg-gray-50 border-b border-gray-100"
                            style={{ gridTemplateColumns: "2fr 1fr 120px 90px" }}>
                            {["Employee", "Role", "Assigned", ""].map((h) => (
                                <span key={h} className={cn("text-[10px] font-black uppercase tracking-widest text-gray-400", h === "Role" && "text-center")}>{h}</span>
                            ))}
                        </div>

                        {/* Rows */}
                        <div className="hidden md:block divide-y divide-gray-100">
                            {paginatedRecords.map((r) => (
                                <div
                                    key={r.employee_role_id}
                                    className="grid px-4 sm:px-6 py-3.5 items-center transition-colors"
                                    style={{ gridTemplateColumns: "2fr 1fr 120px 90px" }}
                                >
                                    {/* Employee */}
                                    <div className="flex items-center min-w-0">
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-[#004C8F] truncate">{r.employee.username}</p>
                                            <p className="text-[11px] text-gray-400 truncate">{r.employee.email}</p>
                                        </div>
                                    </div>

                                    {/* Role — name only, no duplicate code below */}
                                    <div className="text-center">
                                        <span className="text-[13px] font-semibold text-gray-400">
                                            {r.role.name}
                                        </span>
                                    </div>

                                    {/* Date */}
                                    <p className="text-[11px] text-gray-400">
                                        {new Date(r.assigned_at).toLocaleDateString("en-IN", {
                                            day: "2-digit", month: "short", year: "numeric",
                                        })}
                                    </p>

                                    {/* Revoke */}
                                    <div className="flex justify-end">
                                        <button
                                            disabled={revoking === r.employee_role_id}
                                            onClick={() => setConfirmRevoke(r)}
                                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold
                                                transition-all hover:bg-red-50 focus:ring-2 focus:ring-red-100 disabled:opacity-40 border border-red-200 bg-white shadow-sm"
                                            style={{ color: "#E31837" }}
                                        >
                                            {revoking === r.employee_role_id
                                                ? <Loader2 className="w-3 h-3 animate-spin" />
                                                : <UserMinus size={12} />}
                                            Revoke
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="border-t border-gray-100 px-4 py-4 w-full">
                                <PaginationControls
                                    currentPage={page}
                                    totalPages={totalPages}
                                    hasPrevious={page > 1}
                                    hasNext={page < totalPages}
                                    onPageChange={setPage}
                                    className="mt-0"
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Assign Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent
                    showCloseButton={false}
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    className="max-w-md p-0 border-none bg-white rounded-2xl overflow-hidden shadow-xl flex flex-col max-h-[85vh]"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-5 shrink-0">
                        <div>
                            <DialogTitle className="text-lg font-bold text-gray-900">Assign Role</DialogTitle>
                            <p className="text-xs text-gray-400 mt-0.5">Assign a role to an employee by their ID</p>
                        </div>
                        <button
                            onClick={() => setOpen(false)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto px-6 pb-6">
                        <div className="space-y-4">
                            {/* Employee ID */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                                    Employee ID <span style={{ color: "#E31837" }}>*</span>
                                </label>
                                <Input id="employee_id" placeholder="e.g. emp_abc123" value={form.employee_id}
                                    onChange={(e) => setForm((f) => ({ ...f, employee_id: e.target.value }))}
                                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus-visible:ring-blue-300" />
                            </div>

                            {/* Role Select */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                                    Role <span style={{ color: "#E31837" }}>*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        value={form.role_id}
                                        onChange={(e) => setForm((f) => ({ ...f, role_id: e.target.value }))}
                                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-white appearance-none pr-9
                                            focus:outline-none focus:ring-2 focus:ring-blue-300 font-medium transition-all"
                                    >
                                        <option value="">Select a role…</option>
                                        {roles.map((r) => (
                                            <option key={r.role_id} value={r.role_id}>
                                                {r.role_name} ({r.role_code})
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 mt-6">
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                disabled={submitting}
                                className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl py-2.5 text-sm font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleAssign}
                                disabled={submitting}
                                className="flex-1 disabled:opacity-50 text-white rounded-xl py-2.5 text-sm font-bold transition-all flex items-center justify-center gap-2"
                                style={{ background: "#004C8F" }}
                            >
                                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                Assign Role
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Revoke Confirmation Dialog */}
            <Dialog open={!!confirmRevoke} onOpenChange={(val) => !val && setConfirmRevoke(null)}>
                <DialogContent
                    showCloseButton={false}
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    className="max-w-sm p-0 border-none bg-white rounded-2xl overflow-hidden shadow-xl flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-5 shrink-0">
                        <DialogTitle className="text-lg font-bold text-gray-900">Confirm Revoke</DialogTitle>
                        <button
                            onClick={() => setConfirmRevoke(null)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="px-6 pb-6">
                        <p className="text-sm text-gray-500 leading-relaxed mb-6">
                            Are you sure you want to revoke <span className="font-semibold text-gray-700">{confirmRevoke?.role.name}</span> access from <span className="font-semibold text-gray-700">{confirmRevoke?.employee.username}</span>? This action takes effect immediately.
                        </p>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setConfirmRevoke(null)}
                                disabled={revoking !== null}
                                className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl py-2.5 text-sm font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleRevoke}
                                disabled={revoking !== null}
                                className="flex-1 disabled:opacity-50 text-white rounded-xl py-2.5 text-sm font-bold transition-all flex items-center justify-center gap-2"
                                style={{ background: "#E31837" }}
                            >
                                {revoking !== null && <Loader2 className="w-4 h-4 animate-spin" />}
                                Yes, Revoke
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
