import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

    const fieldLabel = "text-[11px] font-bold text-muted-foreground uppercase tracking-widest";

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="w-full max-w-[95vw] sm:max-w-lg p-0 rounded-xl border-0 [&>button]:hidden">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                    <div>
                        <DialogTitle className="text-[15px] font-bold text-primary">Create New Employee</DialogTitle>
                        <DialogDescription className="text-[12px] text-muted-foreground mt-0.5">Add a new employee to the platform</DialogDescription>
                    </div>
                    <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors">
                        <X size={14} className="text-muted-foreground" />
                    </button>
                </div>

                <div className="p-6 space-y-4 bg-white max-h-[70vh] overflow-y-auto overflow-x-visible">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="username" className={fieldLabel}>Username <span className="text-destructive">*</span></Label>
                            <Input id="username" placeholder="john.doe" value={form.username} onChange={set("username")}
                                className="border-border text-sm focus-visible:ring-0 focus-visible:border-primary" />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="email" className={fieldLabel}>Email <span className="text-destructive">*</span></Label>
                            <Input id="email" type="email" placeholder="john@company.com" value={form.email} onChange={set("email")}
                                className="border-border text-sm focus-visible:ring-0 focus-visible:border-primary" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="password" className={fieldLabel}>Password <span className="text-destructive">*</span></Label>
                        <div className="relative">
                            <Input id="password" type={showPwd ? "text" : "password"}
                                placeholder="Min 8 chars, upper, lower, number, special"
                                value={form.password} onChange={set("password")}
                                className="border-border text-sm focus-visible:ring-0 focus-visible:border-primary pr-10" />
                            <button type="button" onClick={() => setShowPwd((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <SearchableSelect id="designation_id" label="Designation" required value={form.designation_id}
                            onChange={(v) => setForm((f) => ({ ...f, designation_id: v }))} placeholder="Select…"
                            options={designations.map((d) => ({ value: d.designation_id, label: d.designation_name }))} />
                        <SearchableSelect id="department_id" label="Department" required value={form.department_id}
                            onChange={(v) => setForm((f) => ({ ...f, department_id: v }))} placeholder="Select…"
                            options={departments.map((d) => ({ value: d.department_id, label: d.department_name }))} />
                    </div>

                    <SearchableSelect id="manager_id" label="Manager" value={form.manager_id}
                        onChange={(v) => setForm((f) => ({ ...f, manager_id: v }))} placeholder="No manager (optional)"
                        options={employees.map((e) => ({ value: normalizeId(e.employee_id), label: `${e.username} (${e.email})` }))} />

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="doj" className={fieldLabel}>Date of Joining <span className="text-destructive">*</span></Label>
                            <Input id="doj" type="date" value={form.date_of_joining} onChange={set("date_of_joining")}
                                max={todayStr()}
                                className="border-border text-sm focus-visible:ring-0 focus-visible:border-primary" />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="dob" className={fieldLabel}>Date of Birth</Label>
                            <Input id="dob" type="date" value={form.date_of_birth} onChange={set("date_of_birth")}
                                max={maxDobStr()}
                                className="border-border text-sm focus-visible:ring-0 focus-visible:border-primary" />
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 bg-muted border-t border-gray-100 flex items-center justify-end gap-2">
                    <Button variant="outline" onClick={onClose} disabled={submitting} className="border-border text-xs font-semibold">Cancel</Button>
                    <button onClick={handleCreate} disabled={submitting || !isFormValid}
                        className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ background: "#003580" }}>
                        {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        Create Employee
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}