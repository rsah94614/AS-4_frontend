"use client";

import React, { useState, useEffect } from "react";
import { Loader2, X } from "lucide-react";
import { rewardsClient as rewardsApiClient } from "@/services/api-clients";
import { extractErrorMessage } from "@/lib/error-utils";
import { Category, RewardItem } from "@/types/reward-types";
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

interface RewardModalProps {
    item?: RewardItem;
    categories: Category[];
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
}

export function RewardModal({ item, categories, isOpen, onClose, onSave }: RewardModalProps) {
    const isEdit = !!item;
    const [form, setForm] = useState<{
        reward_name: string;
        reward_code: string;
        description: string;
        category_id: string;
        default_points: number | "";
        min_points: number | "";
        max_points: number | "";
        available_stock: number | "";
        is_active: boolean;
    }>({
        reward_name: item?.reward_name ?? "",
        reward_code: item?.reward_code ?? "",
        description: item?.description ?? "",
        category_id: item?.category?.category_id ?? "",
        default_points: item?.default_points ?? 100,
        min_points: item?.min_points ?? 50,
        max_points: item?.max_points ?? 500,
        available_stock: item?.available_stock ?? 0,
        is_active: item?.is_active ?? true,
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [descError, setDescError] = useState<string | null>(null);

    // Sync form state when item or isOpen changes
    useEffect(() => {
        if (isOpen) {
            setForm({
                reward_name: item?.reward_name ?? "",
                reward_code: item?.reward_code ?? "",
                description: item?.description ?? "",
                category_id: item?.category?.category_id ?? "",
                default_points: item?.default_points ?? 100,
                min_points: item?.min_points ?? 50,
                max_points: item?.max_points ?? 500,
                available_stock: item?.available_stock ?? 0,
                is_active: item?.is_active ?? true,
            });
            setError(null);
            setDescError(null);
        }
    }, [item, isOpen]);

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
            const defaultPointsNum = Number(form.default_points) || 0;
            const body = isEdit
                ? {
                    reward_name: form.reward_name,
                    description: form.description,
                    default_points: defaultPointsNum,
                    min_points: defaultPointsNum,
                    max_points: defaultPointsNum,
                    is_active: form.is_active,
                }
                : {
                    reward_name: form.reward_name,
                    reward_code: form.reward_code,
                    description: form.description,
                    category_id: form.category_id,
                    default_points: defaultPointsNum,
                    min_points: defaultPointsNum,
                    max_points: defaultPointsNum,
                    available_stock: Number(form.available_stock) || 0,
                };

            if (isEdit) {
                await rewardsApiClient.patch(`/catalog/${item!.catalog_id}`, body);
            } else {
                await rewardsApiClient.post(`/catalog`, body);
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
                        {isEdit ? "Update Reward" : "Create Reward"}
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
                        {/* Category + Code (create only) */}
                        {!isEdit && (
                            <>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                                        Category <span style={{ color: "#E31837" }}>*</span>
                                    </label>
                                    <Select
                                        value={form.category_id}
                                        onValueChange={(val) => setForm({ ...form, category_id: val })}
                                    >
                                        <SelectTrigger className="w-full h-10 rounded-xl border-gray-200 text-sm focus:ring-2 focus:ring-blue-300">
                                            <SelectValue placeholder="Select category…" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories?.filter((c) => c?.is_active)?.map((c) => (
                                                <SelectItem key={c?.category_id || Math.random().toString()} value={c?.category_id || ""} className="font-semibold">
                                                    {c?.category_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                                        Reward Code <span style={{ color: "#E31837" }}>*</span>
                                    </label>
                                    <input
                                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 font-mono uppercase"
                                        value={form.reward_code}
                                        onChange={(e) => setForm({ ...form, reward_code: e.target.value.toUpperCase() })}
                                        placeholder="e.g. REW-AMZ-50"
                                        required
                                    />
                                </div>
                            </>
                        )}

                        {/* Reward Name */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                                Reward Name <span style={{ color: "#E31837" }}>*</span>
                            </label>
                            <input
                                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                value={form.reward_name}
                                onChange={(e) => setForm({ ...form, reward_name: e.target.value })}
                                placeholder="e.g. Amazon Gift Card $50"
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
                                placeholder="Optional description…"
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

                        {/* Points */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                                Points <span style={{ color: "#E31837" }}>*</span>
                            </label>
                            <input
                                type="number"
                                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                value={form.default_points}
                                onChange={(e) => {
                                    const val = e.target.value === "" ? "" : Number(e.target.value);
                                    setForm({
                                        ...form,
                                        default_points: val,
                                        min_points: val,
                                        max_points: val
                                    });
                                }}
                            />
                        </div>

                        {/* Initial Stock (create only) */}
                        {!isEdit && (
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                                    Initial Stock <span style={{ color: "#E31837" }}>*</span>
                                </label>
                                <input
                                    type="number"
                                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                    value={form.available_stock}
                                    min={0}
                                    onChange={(e) => setForm({ ...form, available_stock: e.target.value === "" ? "" : Number(e.target.value) })}
                                />
                            </div>
                        )}

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
