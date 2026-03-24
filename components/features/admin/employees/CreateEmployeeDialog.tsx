import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { todayStr, maxDobStr, normalizeId } from "@/lib/employee-utils";
import { extractErrorMessage } from "@/lib/error-utils";
import authClient from "@/services/api-client";
import { Department } from "@/types/department-types";
import { Designation } from "@/types/designation-types";
import { Employee } from "@/types/team-types";
import { X, EyeOff, Eye, Loader2 } from "lucide-react";
import { useState } from "react";
import { SearchableSelect } from "./SearchableSelect";

export function CreateEmployeeDialog({ open, onClose, onCreated, toast, designations, departments, employees }: {
    open: boolean; onClose: () => void; onCreated: () => void;
    toast: (msg: string, t?: "success" | "error") => void;
    designations: Designation[]; departments: Department[]; employees: Employee[];
}) {
    const [submitting, setSub] = useState(false);
    const [showPwd, setShowPwd] = useState(false);
    const [form, setForm] = useState({
        username: "", email: "", password: "",
        designation_id: "", department_id: "", manager_id: "",
        date_of_joining: "", date_of_birth: "",
    });

    const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm((f) => ({ ...f, [k]: e.target.value }));

    const isFormValid = !!(
        form.username.trim() &&
        form.email.trim() &&
        form.password.trim() &&
        form.designation_id &&
        form.department_id &&
        form.date_of_joining
    );

    const handleCreate = async () => {
        if (!form.username || !form.email || !form.password || !form.designation_id || !form.department_id || !form.date_of_joining) {
            toast("All required fields must be filled", "error"); return;
        }
        if (form.date_of_joining > todayStr()) {
            toast("Date of joining cannot be a future date", "error"); return;
        }
        if (form.date_of_birth && form.date_of_birth > maxDobStr()) {
            toast("Employee must be at least 18 years old", "error"); return;
        }
        try {
            setSub(true);
            await authClient.post("/signup", {
                username: form.username,
                email: form.email,
                password: form.password,
                designation_id: form.designation_id,
                department_id: form.department_id,
                manager_id: form.manager_id || undefined,
                date_of_birth: form.date_of_birth || undefined,
            });
            toast("Employee created successfully");
            onClose();
            setForm({ username: "", email: "", password: "", designation_id: "", department_id: "", manager_id: "", date_of_joining: "", date_of_birth: "" });
            onCreated();
        } catch (e: unknown) {
            toast(extractErrorMessage(e, "Failed to create employee"), "error");
        } finally {
            setSub(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent
                showCloseButton={false}
                onOpenAutoFocus={(e) => e.preventDefault()}
                className="max-w-lg p-0 border-none bg-white rounded-2xl overflow-hidden shadow-xl flex flex-col max-h-[85vh]"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 shrink-0">
                    <div>
                        <DialogTitle className="text-lg font-bold text-gray-900">Create New Employee</DialogTitle>
                        <p className="text-xs text-gray-400 mt-0.5">Add a new employee to the platform</p>
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
                    <div className="space-y-4">
                        {/* Username + Email */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                                    Username <span style={{ color: "#E31837" }}>*</span>
                                </label>
                                <input
                                    placeholder="john.doe"
                                    value={form.username}
                                    onChange={set("username")}
                                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                                    Email <span style={{ color: "#E31837" }}>*</span>
                                </label>
                                <input
                                    type="email"
                                    placeholder="john@company.com"
                                    value={form.email}
                                    onChange={set("email")}
                                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                                Password <span style={{ color: "#E31837" }}>*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showPwd ? "text" : "password"}
                                    placeholder="Min 8 chars, upper, lower, number, special"
                                    value={form.password}
                                    onChange={set("password")}
                                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 pr-10"
                                />
                                <button type="button" onClick={() => setShowPwd((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                        </div>

                        {/* Designation + Department */}
                        <div className="grid grid-cols-2 gap-3">
                            <SearchableSelect id="designation_id" label="Designation" required value={form.designation_id}
                                onChange={(v) => setForm((f) => ({ ...f, designation_id: v }))} placeholder="Select…"
                                options={designations.map((d) => ({ value: d.designation_id, label: d.designation_name }))} />
                            <SearchableSelect id="department_id" label="Department" required value={form.department_id}
                                onChange={(v) => setForm((f) => ({ ...f, department_id: v }))} placeholder="Select…"
                                options={departments.map((d) => ({ value: d.department_id, label: d.department_name }))} />
                        </div>

                        {/* Manager */}
                        <SearchableSelect id="manager_id" label="Manager" value={form.manager_id}
                            onChange={(v) => setForm((f) => ({ ...f, manager_id: v }))} placeholder="No manager (optional)"
                            options={employees.map((e) => ({ value: normalizeId(e.employee_id), label: `${e.username} (${e.email})` }))} />

                        {/* Date of Joining + DOB */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                                    Date of Joining <span style={{ color: "#E31837" }}>*</span>
                                </label>
                                <input
                                    type="date"
                                    value={form.date_of_joining}
                                    onChange={set("date_of_joining")}
                                    max={todayStr()}
                                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                                    Date of Birth
                                </label>
                                <input
                                    type="date"
                                    value={form.date_of_birth}
                                    onChange={set("date_of_birth")}
                                    max={maxDobStr()}
                                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl py-2.5 text-sm font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleCreate}
                            disabled={submitting || !isFormValid}
                            className="flex-1 disabled:opacity-50 text-white rounded-xl py-2.5 text-sm font-bold transition-all flex items-center justify-center gap-2"
                            style={{ background: "#004C8F" }}
                        >
                            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            Create Employee
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}