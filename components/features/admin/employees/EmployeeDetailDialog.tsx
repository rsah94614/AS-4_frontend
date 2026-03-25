import type { Designation, Department, Status, Employee } from "@/types/employee-types";
import { maxDobStr, AVATAR_COLORS, initials, formatDate, normalizeId } from "@/lib/employee-utils";
import { StatusBadge } from "@/components/features/admin/employees/StatusBadge";
import { SearchableSelect } from "@/components/features/admin/employees/SearchableSelect";
import { SelectField } from "@/components/features/admin/employees/SelectField";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { extractErrorMessage } from "@/lib/error-utils";
import { Loader2, X } from "lucide-react";
import { VisuallyHidden } from "radix-ui";
import { useState, useEffect } from "react";
import { employeesClient as empClient } from "@/services/api-clients";
import { Label } from "@/components/ui/label";


export function EmployeeDetailDialog({ employee, open, onClose, onUpdated, toast, designations, departments, statuses, employees: allEmployees, startInEdit = false }: {
    employee: Employee | null; open: boolean; onClose: () => void; onUpdated: () => void;
    toast: (msg: string, t?: "success" | "error") => void;
    designations: Designation[]; departments: Department[]; statuses: Status[]; employees: Employee[];
    startInEdit?: boolean;
}) {
    const [editing, setEditing] = useState(false);
    const [submitting, setSub] = useState(false);
    const [form, setForm] = useState({ username: "", email: "", designation_id: "", department_id: "", manager_id: "", status_id: "", date_of_birth: "" });

    useEffect(() => {
        if (!open) {
            setEditing(false);
            return;
        }
        if (employee) {
            setForm({
                username: employee.username ?? "",
                email: employee.email ?? "",
                designation_id: employee.designation_id ?? "",
                department_id: employee.department_id ?? "",
                manager_id: normalizeId(employee.manager_id),
                status_id: employee.status_id ?? "",
                date_of_birth: employee.date_of_birth ? employee.date_of_birth.split("T")[0] : "",
            });
            setEditing(startInEdit);
        }
    }, [open, employee, startInEdit]);

    if (!employee) return null;

    const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm((f) => ({ ...f, [k]: e.target.value }));

    const setDate = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        const yearPart = val.split("-")[0];
        if (yearPart && yearPart.length > 4) return;
        setForm((f) => ({ ...f, [k]: val }));
    };

    const handleUpdate = async () => {
        try {
            setSub(true);
            const payload: Record<string, string | undefined> = {};
            if (form.username !== employee.username) payload.username = form.username;
            if (form.email !== employee.email) payload.email = form.email;
            if (form.designation_id !== employee.designation_id) payload.designation_id = form.designation_id;
            if (form.department_id !== employee.department_id) payload.department_id = form.department_id;
            if (normalizeId(form.manager_id) !== normalizeId(employee.manager_id)) {
                payload.manager_id = normalizeId(form.manager_id) || undefined;
            }
            if (form.status_id !== employee.status_id) payload.status_id = form.status_id;
            const formDob = form.date_of_birth || undefined;
            const empDob = employee.date_of_birth ? employee.date_of_birth.split("T")[0] : undefined;
            if (formDob !== empDob) payload.date_of_birth = formDob;
            await empClient.put(`/${employee.employee_id}`, payload);
            toast("Employee updated successfully");
            setEditing(false);
            onUpdated();
        } catch (e: unknown) {
            toast(extractErrorMessage(e, "Update failed"), "error");
        } finally { setSub(false); }
    };

    const fieldLabel = "text-[11px] font-bold text-muted-foreground uppercase tracking-widest";

    const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
        <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">{label}</p>
            <p className="text-sm font-medium text-foreground wrap-words">{value || "—"}</p>
        </div>
    );

    const managerOptions = (() => {
        const map = new Map<string, { value: string; label: string }>();

        allEmployees
            .filter((e) => e.employee_id !== employee.employee_id)
            .forEach((e) => {
                const managerId = normalizeId(e.employee_id);
                map.set(managerId, {
                    value: managerId,
                    label: `${e.username} (${e.email})`,
                });
            });

        const currentManagerId = normalizeId(employee.manager_id);
        if (currentManagerId && !map.has(currentManagerId)) {
            map.set(currentManagerId, {
                value: currentManagerId,
                label: employee.manager_name || `Manager (${employee.manager_id})`,
            });
        }

        return Array.from(map.values());
    })();

    const colorIdx = employee.username.charCodeAt(0) % AVATAR_COLORS.length;

    return (
        <>
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent
                    showCloseButton={false}
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    className="max-w-lg p-0 border-none bg-white rounded-2xl overflow-hidden shadow-xl flex flex-col max-h-[85vh]"
                >
                    <VisuallyHidden.Root><DialogTitle>Employee Details</DialogTitle></VisuallyHidden.Root>

                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-5 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
                                style={{ background: AVATAR_COLORS[colorIdx] }}>
                                {initials(employee.username)}
                            </div>
                            <div>
                                <p className="text-lg font-bold text-gray-900">{employee.username}</p>
                                <p className="text-xs text-gray-400">{employee.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <StatusBadge isActive={employee.is_active} />
                            <button
                                onClick={onClose}
                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto px-6 pb-6">
                        {!editing ? (
                            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                <Field label="Employee ID" value={<span className="font-mono text-xs break-all">{employee.employee_id}</span>} />
                                <Field label="Designation" value={employee.designation_name} />
                                <Field label="Department" value={employee.department_name} />
                                <Field label="Manager" value={employee.manager_name} />
                                <Field label="Date of Join" value={formatDate(employee.date_of_joining)} />
                                <Field label="Date of Birth" value={formatDate(employee.date_of_birth)} />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label htmlFor="e_un" className={fieldLabel}>Username</Label>
                                        <Input id="e_un" value={form.username} onChange={set("username")}
                                            className="border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus-visible:ring-blue-300" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="e_em" className={fieldLabel}>Email</Label>
                                        <Input id="e_em" type="email" value={form.email} onChange={set("email")}
                                            className="border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus-visible:ring-blue-300" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <SearchableSelect id="e_dsg" label="Designation" value={form.designation_id}
                                        onChange={(v) => setForm((f) => ({ ...f, designation_id: v }))}
                                        placeholder="Select…" options={designations.map((d) => ({ value: d.designation_id, label: d.designation_name }))} />
                                    <SearchableSelect id="e_dpt" label="Department" value={form.department_id}
                                        onChange={(v) => setForm((f) => ({ ...f, department_id: v }))}
                                        placeholder="Select…" options={departments.map((d) => ({ value: d.department_id, label: d.department_name }))} />
                                </div>
                                <SearchableSelect id="e_mgr" label="Manager" value={form.manager_id}
                                    onChange={(v) => setForm((f) => ({ ...f, manager_id: v }))}
                                    placeholder="No manager"
                                    options={managerOptions} />
                                <div className="grid grid-cols-2 gap-3">
                                    <SelectField id="e_sts" label="Status" value={form.status_id} onChange={set("status_id")}
                                        placeholder="Select…" options={statuses.map((s) => ({ value: s.status_id, label: s.status_name }))} />
                                    <div className="space-y-1">
                                        <Label htmlFor="e_dob" className={fieldLabel}>Date of Birth</Label>
                                        <Input id="e_dob" type="date" value={form.date_of_birth} onChange={setDate("date_of_birth")}
                                            max={maxDobStr()}
                                            className="border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus-visible:ring-blue-300" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 mt-6">
                            {editing ? (
                                <>
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
                                        onClick={handleUpdate}
                                        disabled={submitting}
                                        className="flex-1 disabled:opacity-50 text-white rounded-xl py-2.5 text-sm font-bold transition-all flex items-center justify-center gap-2"
                                        style={{ background: "#004C8F" }}
                                    >
                                        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                        Save Changes
                                    </button>
                                </>
                            ) : (
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl py-2.5 text-sm font-medium transition-colors"
                                >
                                    Close
                                </button>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
