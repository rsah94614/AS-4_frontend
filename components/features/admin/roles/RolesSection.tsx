"use client";

import { useEffect, useState, useCallback } from "react";
import { Shield, Plus, Loader2, Hash, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { rolesApi, type Role } from "@/services/roles-service";
import { extractErrorMessage } from "@/lib/error-utils";
import type { ToastType } from "./UIHelpers";
import { HowItWorks } from "@/components/features/admin/shared/HowItWorks";

interface RolesSectionProps {
    toast: (msg: string, t?: ToastType) => void;
}



const ROLES_STEPS = [
    { n: "01", title: "Create a Role", desc: "Define a role with a unique name and code (e.g. HR_ADMIN). Add an optional description." },
    { n: "02", title: "Assign to Employees", desc: "Go to the Assignments tab to link a role to specific employees by their ID." },
    { n: "03", title: "Set Route Access", desc: "Use Route Permissions to control which API routes each role can access." },
    { n: "04", title: "Immediate Effect", desc: "Role changes take effect on the employee's next login." },
];

export function RolesSection({ toast }: RolesSectionProps) {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [submitting, setSub] = useState(false);
    const [form, setForm] = useState({ role_name: "", role_code: "", description: "" });

    const load = useCallback(async () => {
        try {
            setLoading(true);
            setRoles(await rolesApi.listRoles());
        } catch (e: unknown) {
            toast(extractErrorMessage(e), "error");
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => { load(); }, [load]);

    const handleCreate = async () => {
        if (!form.role_name.trim() || !form.role_code.trim()) {
            toast("Role name and code are required", "error");
            return;
        }
        try {
            setSub(true);
            await rolesApi.createRole(form);
            toast("Role created successfully");
            setOpen(false);
            setForm({ role_name: "", role_code: "", description: "" });
            load();
        } catch (e: unknown) {
            toast(extractErrorMessage(e), "error");
        } finally {
            setSub(false);
        }
    };

    return (
        <div className="w-full">
            <HowItWorks steps={ROLES_STEPS} />

            <div className="mt-8">
                {/* Section header */}
                <div className="pb-4 mb-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <Shield size={14} className="text-[#004C8F]" />
                        <h2 className="text-sm font-bold text-[#004C8F]">System Roles</h2>
                        {!loading && (
                            <span className="text-xs font-bold text-[#004C8F] bg-[#F0F5FA] px-2 py-0.5 rounded-md tabular-nums">
                                {roles.length}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={() => setOpen(true)}
                        className="flex w-full sm:w-auto items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90 active:scale-95"
                        style={{ background: "#004C8F" }}
                    >
                        <Plus size={13} /> New Role
                    </button>
                </div>

                <div>
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
                        </div>
                    ) : roles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                                <Shield size={24} className="text-gray-300" />
                            </div>
                            <p className="text-sm font-semibold text-gray-500">No roles created yet</p>
                            <button
                                onClick={() => setOpen(true)}
                                className="text-sm font-semibold text-[#004C8F] underline underline-offset-2 hover:text-[#E31837] transition-colors"
                            >
                                Create your first role
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 cursor-pointer">
                            {roles.map((role) => {
                                return (
                                    <div key={role.role_id}
                                        className="group bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200">

                                        <div className="p-5">
                                            {/* Icon + arrow row */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                                    style={{ background: "#F0F5FA" }}>
                                                    <Shield size={18} style={{ color: "#004C8F" }} />
                                                </div>
                                                <div className="w-7 h-7 rounded-lg flex items-center justify-center
                                                    opacity-0 group-hover:opacity-100 transition-all duration-150 translate-x-1 group-hover:translate-x-0">
                                                    <ArrowUpRight size={14} className="text-gray-400 group-hover:text-[#004C8F] transition-colors" />
                                                </div>
                                            </div>

                                            {/* Name */}
                                            <p className="text-sm font-bold mb-1" style={{ color: '#004C8F' }}>
                                                {role.role_name}
                                            </p>

                                            {/* Description */}
                                            <p className="text-[12px] text-gray-500 leading-relaxed">
                                                {role.description || "No description provided"}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>


            </div>

            {/* Create Role Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent
                    className="max-w-md p-0 border-none bg-white rounded-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh] selection:bg-[#004C8F] selection:text-white"
                >
                    <DialogHeader className="flex flex-row items-center justify-between px-8 py-6 border-b border-slate-50 bg-slate-50/50 shrink-0">
                        <div className="flex items-center gap-3 text-left">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-100 text-[#004C8F] shadow-inner">
                                <Shield className="w-5 h-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-semibold text-slate-800 tracking-tight leading-none mb-1">
                                    Create New Role
                                </DialogTitle>
                                <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                                    SYSTEM ACCESS
                                </p>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="px-8 py-8 space-y-6 overflow-y-auto flex-1">
                        <div className="space-y-2">
                            <Label htmlFor="role_name" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                                ROLE NAME <span style={{ color: "#E31837" }}>*</span>
                            </Label>
                            <Input id="role_name" placeholder="e.g. HR Manager" value={form.role_name}
                                onChange={(e) => setForm((f) => ({ ...f, role_name: e.target.value }))}
                                className="w-full h-12 px-5 rounded-xl border-2 border-slate-100 text-sm font-semibold text-black focus-visible:ring-0 focus-visible:border-[#004C8F] bg-white placeholder:text-slate-300 transition-all" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role_code" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                                ROLE CODE <span style={{ color: "#E31837" }}>*</span>
                            </Label>
                            <div className="relative">
                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                <Input id="role_code" placeholder="HR_MANAGER" value={form.role_code}
                                    className="w-full h-12 pl-10 pr-5 rounded-xl border-2 border-slate-100 text-sm font-semibold text-black focus-visible:ring-0 focus-visible:border-[#004C8F] bg-white placeholder:text-slate-300 transition-all font-mono uppercase"
                                    onChange={(e) => setForm((f) => ({ ...f, role_code: e.target.value.toUpperCase() }))} />
                            </div>
                            <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider pl-1">Stored in UPPERCASE</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                                DESCRIPTION
                            </Label>
                            <Textarea id="description" placeholder="Describe this role's responsibilities…"
                                value={form.description}
                                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                className="w-full px-5 py-3.5 rounded-xl border-2 border-slate-100 text-sm font-semibold text-black focus-visible:ring-0 focus-visible:border-[#004C8F] bg-white placeholder:text-slate-300 transition-all min-h-[100px] resize-none" />
                        </div>

                        <div className="flex gap-4 pt-4 border-t border-slate-50">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setOpen(false)}
                                disabled={submitting}
                                className="flex-1 h-14 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all tracking-wider uppercase"
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="button"
                                onClick={handleCreate} 
                                disabled={submitting}
                                className="flex-1 h-14 rounded-xl text-xs font-semibold text-white bg-[#004C8F] hover:bg-[#003d73] transition-all tracking-wider uppercase flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:bg-slate-100 disabled:text-slate-300 disabled:shadow-none"
                            >
                                {submitting ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>Create Role</>
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
