"use client";

import React, { useState } from "react";
import { Loader2, X } from "lucide-react";
import { rewardsClient as rewardsApiClient } from "@/services/api-clients";
import { extractErrorMessage } from "@/lib/error-utils";
import { RewardItem } from "@/types/reward-types";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";

interface RestockModalProps {
    item: RewardItem;
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
}

export function RestockModal({ item, isOpen, onClose, onSave }: RestockModalProps) {
    const [amount, setAmount] = useState(10);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            await rewardsApiClient.patch(`/catalog/${item.catalog_id}/stock`, { amount });
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
                    <DialogTitle className="text-lg font-bold text-gray-900">Add Stock</DialogTitle>
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
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Restocking{" "}
                            <strong className="text-gray-800">{item.reward_name}</strong>.{" "}
                            Current inventory:{" "}
                            <strong className="text-[#004C8F]">{item.available_stock}</strong> units.
                        </p>

                        {/* Units */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                                Units to Add <span style={{ color: "#E31837" }}>*</span>
                            </label>
                            <input
                                type="number"
                                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                value={amount}
                                min={1}
                                onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
                            />
                        </div>

                        {/* Preview */}
                        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                New stock level
                            </span>
                            <span className="text-2xl font-bold text-[#004C8F]">
                                {item.available_stock + amount}
                            </span>
                        </div>

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
                                disabled={saving}
                                className="flex-1 disabled:opacity-50 text-white rounded-xl py-2.5 text-sm font-bold transition-all flex items-center justify-center gap-2"
                                style={{ background: "#004C8F" }}
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                Add Stock
                            </button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
