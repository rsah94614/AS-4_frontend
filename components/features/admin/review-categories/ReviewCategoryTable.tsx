"use client";

import { Pencil, X, Check, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { ReviewCategory } from "@/types/review-category-types";
import { PaginationMeta } from "@/types/pagination";
import { DataTable, Column } from "@/components/shared/DataTable";

interface EditForm {
    category_code: string;
    category_name: string;
    multiplier: string;
    description: string;
    is_active: boolean;
}

interface Props {
    categories: ReviewCategory[];
    loading: boolean;
    onEdit: (c: ReviewCategory) => void;
    onToggleActive: (c: ReviewCategory) => void;
    editingId: string | null;
    editForm: EditForm;
    onUpdate: (id: string) => void;
    onCancelEdit: () => void;
    onEditFormChange: (field: keyof EditForm, val: string | boolean) => void;
    saving: boolean;
    pagination?: PaginationMeta | null;
    onPageChange?: (page: number) => void;
}

export function ReviewCategoryTable({
    categories,
    loading,
    onEdit,
    onToggleActive,
    editingId,
    editForm,
    onUpdate,
    onCancelEdit,
    onEditFormChange,
    saving,
    pagination,
    onPageChange,
}: Props) {
    const columns: Column<ReviewCategory>[] = [
        {
            key: "code",
            header: "Code",
            skeletonWidth: "w-20",
            render: (c) =>
                editingId === c.category_id ? (
                    <input
                        className="w-full md:w-28 border border-blue-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white uppercase"
                        value={editForm.category_code}
                        onChange={(e) =>
                            onEditFormChange("category_code", e.target.value.toUpperCase())
                        }
                    />
                ) : (
                    <span className="font-mono text-xs font-semibold bg-violet-100 text-violet-700 px-2 py-0.5 rounded">
                        {c.category_code}
                    </span>
                ),
        },
        {
            key: "name",
            header: "Name",
            skeletonWidth: "w-40",
            render: (c) =>
                editingId === c.category_id ? (
                    <input
                        className="w-full md:w-40 border border-blue-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                        value={editForm.category_name}
                        onChange={(e) => onEditFormChange("category_name", e.target.value)}
                    />
                ) : (
                    <span className="font-medium text-gray-800">{c.category_name}</span>
                ),
        },
        {
            key: "multiplier",
            header: "Multiplier",
            skeletonWidth: "w-16",
            render: (c) =>
                editingId === c.category_id ? (
                    <input
                        type="number"
                        min="0.01"
                        step="0.1"
                        className="w-full md:w-24 border border-blue-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                        value={editForm.multiplier}
                        onChange={(e) => onEditFormChange("multiplier", e.target.value)}
                    />
                ) : (
                    <span className="font-semibold text-gray-900">
                        ×{Number(c.multiplier).toFixed(1)}
                    </span>
                ),
        },
        {
            key: "description",
            header: "Description",
            skeletonWidth: "w-48",
            cellClassName: "max-w-xs truncate",
            headerClassName: "hidden md:table-cell",
            render: (c) =>
                editingId === c.category_id ? (
                    <input
                        className="w-full md:w-48 border border-blue-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                        value={editForm.description}
                        placeholder="Optional"
                        onChange={(e) => onEditFormChange("description", e.target.value)}
                    />
                ) : (
                    <span className="text-gray-400">
                        {c.description ?? <span className="italic text-gray-300">—</span>}
                    </span>
                ),
        },
        {
            key: "status",
            header: "Status",
            skeletonWidth: "w-12",
            render: (c) => (
                <Switch
                    checked={editingId === c.category_id ? editForm.is_active : c.is_active}
                    onCheckedChange={() =>
                        editingId === c.category_id
                            ? onEditFormChange("is_active", !editForm.is_active)
                            : onToggleActive(c)
                    }
                    className="data-[state=checked]:bg-[#34C759] data-[state=unchecked]:bg-gray-300 h-[26px] w-[46px] [&>span]:h-[22px] [&>span]:w-[22px]"
                />
            ),
        },
        {
            key: "actions",
            header: "",
            skeletonWidth: "w-16",
            render: (c) =>
                editingId === c.category_id ? (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onUpdate(c.category_id)}
                            disabled={saving}
                            className="flex items-center gap-1 text-xs font-bold text-white px-3 py-1.5 rounded-lg disabled:opacity-50 transition-all"
                            style={{ background: "#E31837" }}
                        >
                            {saving ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                                <Check className="w-3 h-3" />
                            )}
                            Save
                        </button>
                        <button
                            onClick={onCancelEdit}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => onEdit(c)}
                        className="flex items-center gap-1.5 p-1.5 text-gray-400 hover:text-[#004C8F] hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                ),
        },
    ];

    const mobileCard = (c: ReviewCategory) => {
        const isEditing = editingId === c.category_id;

        if (isEditing) {
            return (
                <div className="rounded-2xl border border-blue-100 bg-blue-50/30 p-4 space-y-3">
                    <div className="space-y-2">
                        <span className="font-semibold text-blue-600 text-xs">CODE</span>
                        <input
                            className="w-full border border-blue-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white uppercase"
                            value={editForm.category_code}
                            onChange={(e) =>
                                onEditFormChange("category_code", e.target.value.toUpperCase())
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <span className="font-semibold text-blue-600 text-xs">NAME</span>
                        <input
                            className="w-full border border-blue-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                            value={editForm.category_name}
                            onChange={(e) => onEditFormChange("category_name", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <span className="font-semibold text-blue-600 text-xs">MULTIPLIER</span>
                        <input
                            type="number"
                            min="0.01"
                            step="0.1"
                            className="w-full border border-blue-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                            value={editForm.multiplier}
                            onChange={(e) => onEditFormChange("multiplier", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <span className="font-semibold text-blue-600 text-xs">DESCRIPTION</span>
                        <input
                            className="w-full border border-blue-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                            value={editForm.description}
                            placeholder="Optional"
                            onChange={(e) => onEditFormChange("description", e.target.value)}
                        />
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-blue-600 text-xs">STATUS</span>
                        <Switch
                            checked={editForm.is_active}
                            onCheckedChange={() => onEditFormChange("is_active", !editForm.is_active)}
                            className="data-[state=checked]:bg-[#34C759] data-[state=unchecked]:bg-gray-300 h-[26px] w-[46px] [&>span]:h-[22px] [&>span]:w-[22px]"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onUpdate(c.category_id)}
                            disabled={saving}
                            className="flex items-center gap-1 text-xs font-bold text-white px-3 py-2 rounded-lg disabled:opacity-50 transition-all flex-1 justify-center"
                            style={{ background: "#E31837" }}
                        >
                            {saving ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                                <Check className="w-3 h-3" />
                            )}
                            Save
                        </button>
                        <button
                            onClick={onCancelEdit}
                            className="p-2 text-gray-400 hover:text-gray-600 bg-white hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-4 space-y-2.5">
                <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-400 text-xs">CODE</span>
                    <span className="font-mono text-xs font-semibold bg-violet-100 text-violet-700 px-2 py-0.5 rounded">
                        {c.category_code}
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-400 text-xs">NAME</span>
                    <span className="font-medium text-gray-800 text-right">{c.category_name}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-400 text-xs">MULTIPLIER</span>
                    <span className="font-semibold text-gray-900">
                        ×{Number(c.multiplier).toFixed(1)}
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-400 text-xs">STATUS</span>
                    <Switch
                        checked={c.is_active}
                        onCheckedChange={() => onToggleActive(c)}
                        className="data-[state=checked]:bg-[#34C759] data-[state=unchecked]:bg-gray-300 h-[26px] w-[46px] [&>span]:h-[22px] [&>span]:w-[22px]"
                    />
                </div>
                <div className="flex justify-end pt-1">
                    <button
                        onClick={() => onEdit(c)}
                        className="flex items-center gap-2 p-2 px-3 text-[#004C8F] bg-blue-50 rounded-lg transition-colors font-semibold text-sm"
                        title="Edit"
                    >
                        <Pencil className="w-4 h-4" />
                        <span>Edit Category</span>
                    </button>
                </div>
            </div>
        );
    };

    return (
        <DataTable
            columns={columns}
            data={categories}
            loading={loading}
            keyExtractor={(c) => c.category_id}
            emptyMessage="No categories found. Add one using the button above."
            mobileCardRender={mobileCard}
            mobileBreakpoint="md"
            className="bg-transparent md:bg-white md:rounded-2xl md:border md:border-gray-100 md:shadow-sm"
            pagination={pagination}
            onPageChange={onPageChange}
        />
    );
}