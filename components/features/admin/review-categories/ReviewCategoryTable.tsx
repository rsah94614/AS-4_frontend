"use client";

import { Pencil, X, Check, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { ReviewCategory } from "@/types/review-category-types";

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
}: Props) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20 text-gray-400">
        <p className="text-sm font-medium">No categories found</p>
        <p className="text-xs mt-1">Add one using the button above.</p>
      </div>
    );
  }

  return (
    <div className="bg-transparent md:bg-white md:rounded-2xl md:border md:border-gray-100 md:shadow-sm md:overflow-x-auto">
      <table className="w-full text-sm block md:table md:min-w-[700px]">
        <thead className="hidden md:table-header-group">
          <tr className="border-b border-gray-100 bg-gray-50/60">
            <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Code</th>
            <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Name</th>
            <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Multiplier</th>
            <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden md:table-cell">Description</th>
            <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Status</th>
            <th className="px-5 py-3" />
          </tr>
        </thead>
        <tbody className="block md:table-row-group divide-y-0 md:divide-y md:divide-gray-50 space-y-4 md:space-y-0">
          {categories.map(c =>
            editingId === c.category_id ? (
              <tr key={c.category_id} className="block md:table-row bg-blue-50/30 md:bg-blue-50/30 border border-blue-100 md:border-0 rounded-2xl md:rounded-none p-4 md:p-0">
                {/* Code */}
                <td className="flex flex-col md:table-cell px-2 md:px-5 py-2 md:py-3 border-b border-blue-100/50 md:border-0">
                  <span className="md:hidden font-semibold text-blue-600 text-xs mb-1">CODE</span>
                  <input
                    className="w-full md:w-28 border border-blue-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white uppercase"
                    value={editForm.category_code}
                    onChange={e => onEditFormChange("category_code", e.target.value.toUpperCase())}
                  />
                </td>
                {/* Name */}
                <td className="flex flex-col md:table-cell px-2 md:px-5 py-2 md:py-3 border-b border-blue-100/50 md:border-0">
                  <span className="md:hidden font-semibold text-blue-600 text-xs mb-1">NAME</span>
                  <input
                    className="w-full md:w-40 border border-blue-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                    value={editForm.category_name}
                    onChange={e => onEditFormChange("category_name", e.target.value)}
                  />
                </td>
                {/* Multiplier */}
                <td className="flex flex-col md:table-cell px-2 md:px-5 py-2 md:py-3 border-b border-blue-100/50 md:border-0">
                  <span className="md:hidden font-semibold text-blue-600 text-xs mb-1">MULTIPLIER</span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.1"
                    className="w-full md:w-24 border border-blue-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                    value={editForm.multiplier}
                    onChange={e => onEditFormChange("multiplier", e.target.value)}
                  />
                </td>
                {/* Description */}
                <td className="flex flex-col md:table-cell px-2 md:px-5 py-2 md:py-3 border-b border-blue-100/50 md:border-0">
                  <span className="md:hidden font-semibold text-blue-600 text-xs mb-1">DESCRIPTION</span>
                  <input
                    className="w-full md:w-48 border border-blue-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                    value={editForm.description}
                    placeholder="Optional"
                    onChange={e => onEditFormChange("description", e.target.value)}
                  />
                </td>
                {/* Status toggle */}
                <td className="flex justify-between items-center md:table-cell px-2 md:px-5 py-3 md:py-3 border-b border-blue-100/50 md:border-0">
                  <span className="md:hidden font-semibold text-blue-600 text-xs">STATUS</span>
                  <Switch
                    checked={editForm.is_active}
                    onCheckedChange={() => onEditFormChange("is_active", !editForm.is_active)}
                    className="data-[state=checked]:bg-[#34C759] data-[state=unchecked]:bg-gray-300 h-[26px] w-[46px] [&>span]:h-[22px] [&>span]:w-[22px]"
                  />
                </td>
                {/* Actions */}
                <td className="flex justify-end md:table-cell px-2 md:px-5 py-3 md:py-3">
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <button
                      onClick={() => onUpdate(c.category_id)}
                      disabled={saving}
                      className="flex items-center gap-1 text-xs font-bold text-white px-3 py-2 md:py-1.5 rounded-lg disabled:opacity-50 transition-all flex-1 md:flex-none justify-center" style={{ background: "#E31837" }}
                    >
                      {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                      Save
                    </button>
                    <button
                      onClick={onCancelEdit}
                      className="p-2 md:p-1.5 text-gray-400 hover:text-gray-600 bg-white md:bg-transparent hover:bg-gray-50 md:hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 md:border-transparent"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              <tr key={c.category_id} className="block md:table-row bg-white border border-gray-100 md:border-0 rounded-2xl md:rounded-none shadow-sm md:shadow-none hover:bg-gray-50/50 transition-colors group p-4 md:p-0">
                {/* Code */}
                <td className="flex justify-between items-center md:table-cell px-2 md:px-5 py-2.5 md:py-3.5 border-b border-gray-50 md:border-0">
                  <span className="md:hidden font-medium text-gray-400 text-xs">CODE</span>
                  <span className="font-mono text-xs font-semibold bg-violet-100 text-violet-700 px-2 py-0.5 rounded">
                    {c.category_code}
                  </span>
                </td>
                {/* Name */}
                <td className="flex justify-between items-center md:table-cell px-2 md:px-5 py-2.5 md:py-3.5 border-b border-gray-50 md:border-0 font-medium text-gray-800">
                  <span className="md:hidden font-medium text-gray-400 text-xs">NAME</span>
                  <span className="text-right md:text-left">{c.category_name}</span>
                </td>
                {/* Multiplier */}
                <td className="flex justify-between items-center md:table-cell px-2 md:px-5 py-2.5 md:py-3.5 border-b border-gray-50 md:border-0">
                  <span className="md:hidden font-medium text-gray-400 text-xs">MULTIPLIER</span>
                  <span className="font-semibold text-gray-900">×{Number(c.multiplier).toFixed(1)}</span>
                </td>
                {/* Description */}
                <td className="hidden md:table-cell px-5 py-3.5 text-gray-400 max-w-xs truncate">
                  {c.description ?? <span className="italic text-gray-300">—</span>}
                </td>
                {/* Status */}
                <td className="flex justify-between items-center md:table-cell px-2 md:px-5 py-2.5 md:py-3.5 border-b border-gray-50 md:border-0">
                  <span className="md:hidden font-medium text-gray-400 text-xs">STATUS</span>
                  <Switch
                    checked={c.is_active}
                    onCheckedChange={() => onToggleActive(c)}
                    className="data-[state=checked]:bg-[#34C759] data-[state=unchecked]:bg-gray-300 h-[26px] w-[46px] [&>span]:h-[22px] [&>span]:w-[22px]"
                  />
                </td>
                {/* Actions */}
                <td className="flex justify-end md:table-cell px-2 md:px-5 pt-3 pb-1 md:py-3.5">
                  <div className="flex items-center gap-1 justify-end transition-opacity w-full md:w-auto">
                    <button
                      onClick={() => onEdit(c)}
                      className="flex items-center gap-2 p-2 px-3 md:px-1.5 w-full md:w-auto justify-center text-[#004C8F] bg-blue-50 md:bg-transparent md:text-gray-400 md:hover:text-[#004C8F] md:hover:bg-blue-50 rounded-lg transition-colors font-semibold text-sm md:text-xs"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                      <span className="md:hidden">Edit Category</span>
                    </button>
                  </div>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}