"use client";

import { useState, useEffect } from "react";
import { Loader2, X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Designation,
    DesignationDetail,
    CreateDesignationPayload,
    UpdateDesignationPayload,
} from "@/types/designation-types";
import { designationService } from "@/services/designation-service";
import { extractErrorMessage } from "@/lib/error-utils";

// ── Validation helpers ────────────────────────────────────────────────────────

const SPECIAL_CHARS_REGEX = /[<>{}|\\^~\[\]]/;
const DESC_MAX_LENGTH = 1000;

function validateDescription(value: string): string | null {
    if (SPECIAL_CHARS_REGEX.test(value)) return "Special characters like < > { } | \\ ^ ~ [ ] are not allowed.";
    if (value.length > DESC_MAX_LENGTH) return `Description cannot exceed ${DESC_MAX_LENGTH} characters.`;
    return null;
}

interface DesignationModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    selectedDesignation: Designation | null;
}

const EMPTY_FORM: { designation_name: string; designation_code: string; level: number | string; description: string } = {
    designation_name: "",
    designation_code: "",
    level: 1,
    description: "",
};

export function DesignationModal({
    open,
    onClose,
    onSuccess,
    selectedDesignation,
}: DesignationModalProps) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [error, setError] = useState<string | null>(null);
    const [descError, setDescError] = useState<string | null>(null);
    const [levelError, setLevelError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detail, setDetail] = useState<DesignationDetail | null>(null);

    useEffect(() => {
        if (!open) {
            setForm(EMPTY_FORM);
            setDetail(null);
            setError(null);
            setDescError(null);
            setLevelError(null);
            return;
        }
        if (selectedDesignation) {
            const loadDetail = async () => {
                setDetailLoading(true);
                try {
                    const d = await designationService.getById(selectedDesignation.designation_id);
                    setDetail(d);
                    setForm({
                        designation_name: d.designation_name,
                        designation_code: d.designation_code,
                        level: d.level,
                        description: d.description ?? "",
                    });
                } catch {
                    setForm({
                        designation_name: selectedDesignation?.designation_name || "",
                        designation_code: selectedDesignation?.designation_code || "",
                        level: selectedDesignation?.level || 1,
                        description: "",
                    });
                } finally {
                    setDetailLoading(false);
                }
            };
            loadDetail();
        } else {
            setForm(EMPTY_FORM);
        }
    }, [open, selectedDesignation]);

    const handleDescriptionChange = (value: string) => {
        if (value.length > DESC_MAX_LENGTH) return;
        setForm({ ...form, description: value });
        setDescError(validateDescription(value));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const dErr = validateDescription(form.description);
        if (dErr) { setDescError(dErr); return; }
        const levelNum = Number(form.level);
        if (levelNum < 1 || levelNum > 6) {
            setLevelError(levelNum < 1 ? "Hierarchy level must be at least 1." : "Maximum hierarchy level is 6.");
            return;
        }
        setSubmitting(true);
        setError(null);
        try {
            const payload: CreateDesignationPayload = {
                designation_name: form.designation_name,
                designation_code: form.designation_code.toUpperCase(),
                level: Number(form.level),
                description: form.description || undefined,
            };
            if (selectedDesignation) {
                await designationService.update(selectedDesignation.designation_id, payload as UpdateDesignationPayload);
            } else {
                await designationService.create(payload);
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
                            {selectedDesignation ? "Edit Designation" : "Add Designation"}
                        </DialogTitle>
                        {detail && (
                            <span className="text-xs text-gray-400 mt-0.5 block">
                                {detail.employee_count} employee{detail.employee_count !== 1 ? "s" : ""} assigned
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
                        <div className="py-12 flex flex-col items-center gap-2">
                            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                            <p className="text-xs text-gray-400">Fetching details...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Designation Name */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                                    Designation Name <span style={{ color: "#E31837" }}>*</span>
                                </label>
                                <input
                                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                    value={form.designation_name}
                                    onChange={e => setForm({ ...form, designation_name: e.target.value })}
                                    placeholder="e.g. Senior Software Engineer"
                                    required
                                    maxLength={100}
                                />
                            </div>

                            {/* Designation Code */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                                    Designation Code <span style={{ color: "#E31837" }}>*</span>
                                </label>
                                <input
                                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 font-mono uppercase"
                                    value={form.designation_code}
                                    onChange={e => setForm({ ...form, designation_code: e.target.value.toUpperCase() })}
                                    placeholder="e.g. SR_SWE"
                                    required
                                    maxLength={50}
                                />
                            </div>

                            {/* Level */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                                    Hierarchy Level <span style={{ color: "#E31837" }}>*</span>
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    max={6}
                                    className={`w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 font-bold ${levelError ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-300'}`}
                                    value={form.level}
                                    onChange={e => {
                                        const val = e.target.value;
                                        if (val === "") {
                                            setForm({ ...form, level: "" });
                                            setLevelError(null);
                                            return;
                                        }
                                        if (val.length > 1 && val.startsWith("0")) {
                                            setLevelError("Leading zeros are not allowed.");
                                            setForm({ ...form, level: val });
                                            return;
                                        }
                                        const num = Number(val);
                                        setForm({ ...form, level: num });
                                        if (num < 1) {
                                            setLevelError("Hierarchy level must be at least 1.");
                                        } else if (num > 6) {
                                            setLevelError("Maximum hierarchy level is 6.");
                                        } else {
                                            setLevelError(null);
                                        }
                                    }}
                                    required
                                />
                                {levelError ? (
                                    <p className="text-xs text-red-500 mt-1">{levelError}</p>
                                ) : (
                                    <p className="text-xs text-gray-400 mt-1">1 = Highest (CXO), higher numbers = lower levels</p>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                                    Description <span className="text-gray-300">(optional)</span>
                                </label>
                                <textarea
                                    className={`w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 resize-none ${descError ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-blue-300"}`}
                                    value={form.description}
                                    onChange={e => handleDescriptionChange(e.target.value)}
                                    placeholder="Brief summary of the role's responsibilities…"
                                    rows={3}
                                    maxLength={DESC_MAX_LENGTH}
                                />
                                <div className="flex items-center justify-between mt-1">
                                    {descError ? (
                                        <p className="text-xs text-red-500">{descError}</p>
                                    ) : (
                                        <span />
                                    )}
                                    <p className="text-xs text-gray-400">{form.description.length}/{DESC_MAX_LENGTH}</p>
                                </div>
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
                                    disabled={submitting || !!descError || !!levelError}
                                    className="flex-1 disabled:opacity-50 text-white rounded-xl py-2.5 text-sm font-bold transition-all flex items-center justify-center gap-2"
                                    style={{ background: "#004C8F" }}
                                >
                                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {submitting ? "Saving…" : selectedDesignation ? "Save Changes" : "Create"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}