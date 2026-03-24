"use client";

import React, { useState } from "react";
import { Loader2, X } from "lucide-react";
import { EntityType, ENTITY_TYPES, ENTITY_META } from "@/types/status-types";
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

// ── Validation helpers ────────────────────────────────────────────────────────

const SPECIAL_CHARS_REGEX = /[<>{}|\\^~\[\]]/;
const DESC_MAX_LENGTH = 1000;

function validateDescription(value: string): string | null {
    if (SPECIAL_CHARS_REGEX.test(value)) return "Special characters like < > { } | \\ ^ ~ [ ] are not allowed.";
    if (value.length > DESC_MAX_LENGTH) return `Description cannot exceed ${DESC_MAX_LENGTH} characters.`;
    return null;
}

interface StatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (form: {
        status_code: string;
        status_name: string;
        description: string;
        entity_type: EntityType;
    }) => Promise<void>;
    saving: boolean;
}

export function StatusModal({ isOpen, onClose, onCreate, saving }: StatusModalProps) {
    const [form, setForm] = useState({
        status_code: "",
        status_name: "",
        description: "",
        entity_type: "EMPLOYEE" as EntityType,
    });
    const [descError, setDescError] = useState<string | null>(null);

    const handleDescriptionChange = (value: string) => {
        if (value.length > DESC_MAX_LENGTH) return;
        setForm(p => ({ ...p, description: value }));
        setDescError(validateDescription(value));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const dErr = validateDescription(form.description);
        if (dErr) { setDescError(dErr); return; }
        await onCreate(form);
        setForm({ status_code: "", status_name: "", description: "", entity_type: "EMPLOYEE" });
        setDescError(null);
    };

    const handleClose = () => {
        onClose();
        setForm({ status_code: "", status_name: "", description: "", entity_type: "EMPLOYEE" });
        setDescError(null);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent
                showCloseButton={false}
                onOpenAutoFocus={(e) => e.preventDefault()}
                className="max-w-md p-0 border-none bg-white rounded-2xl overflow-hidden shadow-xl flex flex-col max-h-[85vh]"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 shrink-0">
                    <DialogTitle className="text-lg font-bold text-gray-900">Add Status</DialogTitle>
                    <button
                        onClick={handleClose}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 pb-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Category (Entity Type) */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                                Category <span style={{ color: "#E31837" }}>*</span>
                            </label>
                            <Select
                                value={form.entity_type}
                                onValueChange={(val) => setForm(p => ({ ...p, entity_type: val as EntityType }))}
                            >
                                <SelectTrigger className="w-full h-10 rounded-xl border-gray-200 text-sm focus:ring-2 focus:ring-blue-300">
                                    <SelectValue placeholder="Select category…" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ENTITY_TYPES.map((t) => (
                                        <SelectItem key={t} value={t} className="font-semibold">
                                            {ENTITY_META[t].label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Status Code */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                                Status Code <span style={{ color: "#E31837" }}>*</span>
                            </label>
                            <input
                                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 font-mono uppercase"
                                value={form.status_code}
                                onChange={(e) => setForm(p => ({ ...p, status_code: e.target.value.toUpperCase().replace(/\s/g, "_") }))}
                                placeholder="e.g. ON_LEAVE"
                                maxLength={50}
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                This code is permanent and used by the system internally.
                            </p>
                        </div>

                        {/* Display Name */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                                Display Name <span style={{ color: "#E31837" }}>*</span>
                            </label>
                            <input
                                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                value={form.status_name}
                                onChange={(e) => setForm(p => ({ ...p, status_name: e.target.value }))}
                                placeholder="e.g. On Leave"
                                maxLength={100}
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                                Description <span className="text-gray-300">(optional)</span>
                            </label>
                            <textarea
                                className={`w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 resize-none ${descError ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-blue-300"}`}
                                value={form.description}
                                onChange={(e) => handleDescriptionChange(e.target.value)}
                                rows={2}
                                placeholder="e.g. Employee is temporarily on approved leave."
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
                                onClick={handleClose}
                                disabled={saving}
                                className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl py-2.5 text-sm font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving || !!descError}
                                className="flex-1 disabled:opacity-50 text-white rounded-xl py-2.5 text-sm font-bold transition-all flex items-center justify-center gap-2"
                                style={{ background: "#004C8F" }}
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                Create
                            </button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
