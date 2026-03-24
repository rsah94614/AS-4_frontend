"use client";

import React, { useState, useMemo } from "react";
import { X, Loader2 } from "lucide-react";
import axiosClient from "@/services/api-client";
import { extractErrorMessage } from "@/lib/error-utils";
import { Employee } from "@/types/team-types";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";

interface AddEmployeeModalProps {
    onClose: () => void;
    onSuccess: () => void;
    allEmployees: Employee[];
}

export function AddEmployeeModal({
    onClose,
    onSuccess,
    allEmployees,
}: AddEmployeeModalProps) {
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        designation_id: "",
        department_id: "",
        manager_id: "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Workaround: Derive designations and departments from allEmployees 
    // because the Organization Service (port 8007) is missing/broken.
    const designations = useMemo(() => {
        const map = new Map<string, { id: string; name: string }>();
        allEmployees.forEach((emp) => {
            if (emp.designation_id && emp.designation_name) {
                map.set(emp.designation_id, {
                    id: emp.designation_id,
                    name: emp.designation_name,
                });
            }
        });
        return Array.from(map.values()).sort((a, b) =>
            a.name.localeCompare(b.name)
        );
    }, [allEmployees]);

    const departments = useMemo(() => {
        const map = new Map<string, { id: string; name: string }>();
        allEmployees.forEach((emp) => {
            if (emp.department_id && emp.department_name) {
                map.set(emp.department_id, {
                    id: emp.department_id,
                    name: emp.department_name,
                });
            }
        });
        return Array.from(map.values()).sort((a, b) =>
            a.name.localeCompare(b.name)
        );
    }, [allEmployees]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            await axiosClient.post(`/signup`, {
                username: form.username,
                email: form.email,
                password: form.password,
                designation_id: form.designation_id,
                department_id: form.department_id,
                manager_id: form.manager_id || null,
            });
            onSuccess();
            onClose();
        } catch (err: unknown) {
            setError(extractErrorMessage(err, "Failed to add employee"));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Dialog open={true} onOpenChange={(val) => !val && onClose()}>
            <DialogContent
                showCloseButton={false}
                onOpenAutoFocus={(e) => e.preventDefault()}
                className="max-w-md p-0 border-none bg-white rounded-2xl overflow-hidden shadow-xl flex flex-col max-h-[85vh]"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 shrink-0">
                    <div>
                        <DialogTitle className="text-lg font-bold text-gray-900">Add New Employee</DialogTitle>
                        <p className="text-xs text-gray-400 mt-0.5">Fill in the details to register</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body — scrollable */}
                <div className="flex-1 overflow-y-auto px-6 pb-6">
                    {error && (
                        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <form id="add-employee-form" onSubmit={handleSubmit} className="space-y-4">
                        {/* Username */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                                Username <span style={{ color: "#E31837" }}>*</span>
                            </label>
                            <input
                                required
                                placeholder="e.g. johndoe"
                                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                value={form.username}
                                onChange={(e) => setForm({ ...form, username: e.target.value })}
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                                Email Address <span style={{ color: "#E31837" }}>*</span>
                            </label>
                            <input
                                required
                                type="email"
                                placeholder="john@company.com"
                                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                                Temporary Password <span style={{ color: "#E31837" }}>*</span>
                            </label>
                            <input
                                required
                                type="password"
                                placeholder="••••••••"
                                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                            />
                        </div>

                        {/* Department + Designation */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                                    Department <span style={{ color: "#E31837" }}>*</span>
                                </label>
                                <select
                                    required
                                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                                    value={form.department_id}
                                    onChange={(e) => setForm({ ...form, department_id: e.target.value })}
                                >
                                    <option value="">Select...</option>
                                    {departments.map((d) => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                                    Designation <span style={{ color: "#E31837" }}>*</span>
                                </label>
                                <select
                                    required
                                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                                    value={form.designation_id}
                                    onChange={(e) => setForm({ ...form, designation_id: e.target.value })}
                                >
                                    <option value="">Select...</option>
                                    {designations.map((d) => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Manager */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                                Manager <span className="text-gray-300">(optional)</span>
                            </label>
                            <select
                                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                                value={form.manager_id}
                                onChange={(e) => setForm({ ...form, manager_id: e.target.value })}
                            >
                                <option value="">No Manager</option>
                                {allEmployees
                                    .filter((e) => e.is_active)
                                    .map((e) => (
                                        <option key={e.employee_id} value={e.employee_id}>
                                            {e.username} ({e.department_name})
                                        </option>
                                    ))}
                            </select>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl py-2.5 text-sm font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 disabled:opacity-50 text-white rounded-xl py-2.5 text-sm font-bold transition-all flex items-center justify-center gap-2"
                                style={{ background: "#004C8F" }}
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" /> Adding…
                                    </>
                                ) : (
                                    "Add Employee"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
