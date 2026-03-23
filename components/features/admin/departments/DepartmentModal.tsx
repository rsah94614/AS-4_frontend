"use client";

import { useState, useEffect } from "react";
import { Loader2, X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Department,
    DepartmentDetail,
    DepartmentType,
    CreateDepartmentPayload,
    UpdateDepartmentPayload,
} from "@/types/department-types";
import { departmentService } from "@/services/department-service";
import { extractErrorMessage } from "@/lib/error-utils";

interface DepartmentModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    selectedDepartment: Department | null;
    departmentTypes: DepartmentType[];
}

const EMPTY_FORM = {
    department_name: "",
    department_code: "",
    department_type_id: "",
};

export function DepartmentModal({
    open,
    onClose,
    onSuccess,
    selectedDepartment,
    departmentTypes,
}: DepartmentModalProps) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detail, setDetail] = useState<DepartmentDetail | null>(null);

    useEffect(() => {
        if (!open) {
            setForm(EMPTY_FORM);
            setDetail(null);
            setError(null);
            return;
        }
        if (selectedDepartment) {
            const loadDetail = async () => {
                setDetailLoading(true);
                try {
                    const d = await departmentService.getById(selectedDepartment.department_id);
                    setDetail(d);
                    setForm({
                        department_name: d.department_name,
                        department_code: d.department_code,
                        department_type_id: d.department_type
                            ? departmentTypes.find(t => t.type_code === d.department_type?.type_code)?.department_type_id ?? ""
                            : "",
                    });
                } catch {
                    setForm({
                        department_name: selectedDepartment.department_name,
                        department_code: selectedDepartment.department_code,
                        department_type_id: "",
                    });
                } finally {
                    setDetailLoading(false);
                }
            };
            loadDetail();
        } else {
            setForm(EMPTY_FORM);
        }
    }, [open, selectedDepartment, departmentTypes]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            const payload: CreateDepartmentPayload = {
                department_name: form.department_name,
                department_code: form.department_code.toUpperCase(),
                department_type_id: form.department_type_id,
            };
            if (selectedDepartment) {
                await departmentService.update(selectedDepartment.department_id, payload as UpdateDepartmentPayload);
            } else {
                await departmentService.create(payload);
            }
            onSuccess();
            onClose();
        } catch (err: unknown) {
            setError(extractErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent
                showCloseButton={false}
                onOpenAutoFocus={(e) => e.preventDefault()}
                className="max-w-md p-0 border-none bg-white rounded-2xl overflow-hidden shadow-xl flex flex-col max-h-[85vh]"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 shrink-0">
                    <div>
                        <DialogTitle className="text-lg font-bold text-gray-900">
                            {selectedDepartment ? "Edit Department" : "Add Department"}
                        </DialogTitle>
                        {detail && (
                            <span className="text-xs text-gray-400 mt-0.5 block">
                                {detail.employee_count} employee{detail.employee_count !== 1 ? "s" : ""}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 pb-6">
                    {error && (
                        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {detailLoading ? (
                        <div className="py-12 flex justify-center">
                            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Department Name */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                                    Department Name <span style={{ color: "#E31837" }}>*</span>
                                </label>
                                <input
                                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                    value={form.department_name}
                                    onChange={e => setForm({ ...form, department_name: e.target.value })}
                                    placeholder="e.g. Engineering"
                                    required
                                    maxLength={255}
                                />
                            </div>

                            {/* Department Code */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                                    Department Code <span style={{ color: "#E31837" }}>*</span>
                                </label>
                                <input
                                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 font-mono uppercase"
                                    value={form.department_code}
                                    onChange={e => setForm({ ...form, department_code: e.target.value.toUpperCase() })}
                                    placeholder="e.g. ENG001"
                                    required
                                    maxLength={20}
                                />
                            </div>

                            {/* Department Type */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                                    Department Type <span style={{ color: "#E31837" }}>*</span>
                                </label>
                                <Select
                                    value={form.department_type_id}
                                    onValueChange={val => setForm({ ...form, department_type_id: val })}
                                    required
                                >
                                    <SelectTrigger className="w-full h-10 rounded-xl border-gray-200 text-sm focus:ring-2 focus:ring-blue-300">
                                        <SelectValue placeholder="Select a type…" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departmentTypes.map(t => (
                                            <SelectItem key={t.department_type_id} value={t.department_type_id}>
                                                {t.type_name} ({t.type_code})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {departmentTypes.length === 0 && (
                                    <p className="text-xs text-amber-500 mt-1">
                                        No department types loaded — check your connection.
                                    </p>
                                )}
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
                                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {submitting ? "Saving…" : selectedDepartment ? "Save Changes" : "Create"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}