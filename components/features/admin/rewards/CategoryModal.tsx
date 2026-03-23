"use client";

import React, { useState } from "react";
import { rewardsClient as rewardsApiClient } from "@/services/api-clients";
import { extractErrorMessage } from "@/lib/error-utils";
import { Category, CreateCategoryPayload, UpdateCategoryPayload } from "@/types/reward-types";
import { Loader2, X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";

// ── Validation helpers ────────────────────────────────────────────────────────

const SPECIAL_CHARS_REGEX = /[<>{}|\\^~\[\]]/;
const DESC_MAX_LENGTH = 1000;

function validateDescription(value: string): string | null {
    if (SPECIAL_CHARS_REGEX.test(value)) return "Special characters like < > { } | \\ ^ ~ [ ] are not allowed.";
    if (value.length > DESC_MAX_LENGTH) return `Description cannot exceed ${DESC_MAX_LENGTH} characters.`;
    return null;
}

interface CategoryModalProps {
    category?: Category;
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
}

export function CategoryModal({ category, isOpen, onClose, onSave }: CategoryModalProps) {
    const isEdit = !!category;
    const [form, setForm] = useState({
        category_name: category?.category_name ?? "",
        category_code: category?.category_code ?? "",
        description: category?.description ?? "",
        is_active: category?.is_active ?? true,
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [descError, setDescError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleDescriptionChange = (value: string) => {
        if (value.length > DESC_MAX_LENGTH) return;
        setForm({ ...form, description: value });
        setDescError(validateDescription(value));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const dErr = validateDescription(form.description);
        if (dErr) { setDescError(dErr); return; }
        setSaving(true);
        setError(null);
        try {
            if (isEdit) {
                const body: UpdateCategoryPayload = {
                    category_name: form.category_name,
                    description: form.description,
                    is_active: form.is_active,
                };
                await rewardsApiClient.patch(`/categories/${category!.category_id}`, body);
            } else {
                const body: CreateCategoryPayload = {
                    category_name: form.category_name,
                    category_code: form.category_code,
                    description: form.description,
                };
                await rewardsApiClient.post(`/categories`, body);
            }
            onSave();
        } catch (e: unknown) {
            setError(extractErrorMessage(e, "Request failed"));
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
            <DialogContent
                showCloseButton={false}
                onOpenAutoFocus={(e) => e.preventDefault()}
                className="max-w-md p-0 border-none bg-white rounded-2xl overflow-hidden shadow-xl flex flex-col max-h-[85vh]"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 shrink-0">
                    <DialogTitle className="text-lg font-bold text-gray-900">
                        {isEdit ? "Update Category" : "New Category"}
                    </DialogTitle>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 pb-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Category Code (create only) */}
                        {!isEdit && (
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                                    Category Code <span style={{ color: "#E31837" }}>*</span>
                                </label>
                                <input
                                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 font-mono uppercase"
                                    value={form.category_code}
                                    onChange={(e) => setForm({ ...form, category_code: e.target.value.toUpperCase() })}
                                    placeholder="e.g. CAT-GIFT"
                                    required
                                />
                            </div>
                        )}

                        {/* Category Name */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                                Category Name <span style={{ color: "#E31837" }}>*</span>
                            </label>
                            <input
                                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                value={form.category_name}
                                onChange={(e) => setForm({ ...form, category_name: e.target.value })}
                                placeholder="e.g. Amazon Gift Cards"
                                required
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
                                placeholder="Tell us what this category covers..."
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

                        {/* Active toggle (edit only) */}
                        {isEdit && (
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                                    Status
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer select-none bg-gray-50 p-3.5 rounded-xl border border-gray-200 group">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={form.is_active}
                                            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                                            className="peer h-5 w-10 cursor-pointer appearance-none rounded-full bg-gray-300 transition-all focus:outline-none checked:bg-[#004C8F]"
                                        />
                                        <div className="absolute left-0.5 h-4 w-4 transform rounded-full bg-white transition-transform peer-checked:translate-x-5" />
                                    </div>
                                    <span className={`text-sm font-semibold transition-colors ${form.is_active ? "text-[#004C8F]" : "text-gray-400"}`}>
                                        {form.is_active ? "Active" : "Inactive"}
                                    </span>
                                </label>
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
                                {error}
                            </div>
                        )}

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
                                disabled={saving || !!descError}
                                className="flex-1 disabled:opacity-50 text-white rounded-xl py-2.5 text-sm font-bold transition-all flex items-center justify-center gap-2"
                                style={{ background: "#004C8F" }}
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                {isEdit ? "Update" : "Create"}
                            </button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
