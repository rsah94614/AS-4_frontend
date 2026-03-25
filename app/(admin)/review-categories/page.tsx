"use client";

import { useState } from "react";
import { Tag, Plus, Check, AlertCircle, X } from "lucide-react";


import { useReviewCategories } from "@/hooks/useReviewCategories";
import { ReviewCategory } from "@/types/review-category-types";
import { extractErrorMessage } from "@/lib/error-utils";

import { ReviewCategoryTable } from "@/components/features/admin/review-categories/ReviewCategoryTable";
import { ReviewCategoryModals } from "@/components/features/admin/review-categories/ReviewCategoryModal";
import { ReviewCategoryFilters } from "@/components/features/admin/review-categories/ReviewCategoryFilters";
import { HowItWorks } from "@/components/features/admin/shared/HowItWorks";
import { AdminPageHeader } from "@/components/features/admin/shared/AdminControlPanelPageHeader";
import { AdminSearchBar } from "@/components/features/admin/shared/AdminSearchBar";
import { useSuccessToast, SuccessToastContainer } from "@/components/shared/SuccessToast";

import ProtectedRoute from "@/components/features/auth/ProtectedRoute"
const REVIEW_CAT_STEPS = [
  { n: "01", title: "Create Category", desc: "Add a category with a unique code, name, and multiplier value greater than 0." },
  { n: "02", title: "Set Multiplier", desc: "The multiplier determines points awarded — e.g. 1.4× means 1.4 points per reviewer weight unit." },
  { n: "03", title: "Assign in Reviews", desc: "Employees select 1–5 categories per review. Points equal the sum of selected multipliers × reviewer weight." },
  { n: "04", title: "Manage Status", desc: "Deactivate a category to hide it from new reviews. Existing reviews are unaffected." },
];

type FilterValue = boolean | null;

interface EditForm {
  category_code: string;
  category_name: string;
  multiplier: string;
  description: string;
  is_active: boolean;
}

export default function ReviewCategoriesPage() {
  const [activeOnly, setActiveOnly] = useState<FilterValue>(null);
  const [search, setSearch] = useState("");

  const { categories, allCategories, pagination, loading, error, createCategory, updateCategory, setPage } =
    useReviewCategories(activeOnly, search);

  const [flash, setFlash] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    category_code: "",
    category_name: "",
    multiplier: "",
    description: "",
    is_active: true,
  });
  const [saving, setSaving] = useState(false);
  const { toasts, show: showToast } = useSuccessToast();

  const showFlash = (msg: string, type: "success" | "error" = "success") => {
    setFlash({ type, msg });
    setTimeout(() => setFlash(null), 5000);
  };

  // ─── Create ───────────────────────────────────────────────────────────────
  const handleCreate = async (form: Record<string, unknown>) => {
    const category_code = String(form.category_code ?? "").trim();
    const category_name = String(form.category_name ?? "").trim();
    const multiplierVal = String(form.multiplier ?? "").trim();
    const description = String(form.description ?? "").trim() || undefined;

    if (!category_code) return showFlash("Please enter a category code.", "error");
    if (!category_name) return showFlash("Please enter a category name.", "error");
    if (!multiplierVal || isNaN(parseFloat(multiplierVal)) || parseFloat(multiplierVal) <= 0)
      return showFlash("Please enter a valid multiplier greater than 0 (e.g. 1.4).", "error");
    if (parseFloat(multiplierVal) > 2)
      return showFlash("Multiplier cannot exceed 2.", "error");

    setSaving(true);
    try {
      await createCategory({
        category_code,
        category_name,
        multiplier: parseFloat(multiplierVal),
        ...(description ? { description } : {}),
      });
      setShowCreate(false);
      showFlash("Category created successfully.");
      showToast("Category created successfully");
    } catch (e: unknown) {
      showFlash(extractErrorMessage(e, "Could not create category. Code or name may already exist."), "error");
    } finally {
      setSaving(false);
    }
  };

  // ─── Edit ─────────────────────────────────────────────────────────────────
  const startEdit = (c: ReviewCategory) => {
    setEditId(c.category_id);
    setEditForm({
      category_code: c.category_code,
      category_name: c.category_name,
      multiplier: String(c.multiplier),
      description: c.description ?? "",
      is_active: c.is_active,
    });
  };

  const handleUpdate = async (id: string) => {
    if (!editForm.category_code.trim()) return showFlash("Category code cannot be empty.", "error");
    if (!editForm.category_name.trim()) return showFlash("Category name cannot be empty.", "error");
    if (!editForm.multiplier || isNaN(parseFloat(editForm.multiplier)) || parseFloat(editForm.multiplier) <= 0)
      return showFlash("Please enter a valid multiplier greater than 0.", "error");
    if (parseFloat(editForm.multiplier) > 2)
      return showFlash("Multiplier cannot exceed 2.", "error");

    setSaving(true);
    try {
      await updateCategory(id, {
        category_code: editForm.category_code.trim(),
        category_name: editForm.category_name.trim(),
        multiplier: parseFloat(editForm.multiplier),
        description: editForm.description.trim() || undefined,
        is_active: editForm.is_active,
      });
      setEditId(null);
      showFlash("Category updated successfully.");
      showToast("Category updated successfully");
    } catch (e: unknown) {
      showFlash(extractErrorMessage(e, "Could not update. Code or name may conflict with an existing category."), "error");
    } finally {
      setSaving(false);
    }
  };

  // ─── Toggle active ────────────────────────────────────────────────────────
  const handleToggleActive = async (c: ReviewCategory) => {
    try {
      await updateCategory(c.category_id, { is_active: !c.is_active });
    } catch (e: unknown) {
      showFlash(extractErrorMessage(e, "Could not toggle category status."), "error");
    }
  };

  const activeCount = (allCategories || []).filter(c => c.is_active).length;
  const inactiveCount = (allCategories || []).filter(c => !c.is_active).length;

  return (
      <ProtectedRoute adminOnly pathPrefix="/v1/recognitions/review-categories">
    <>
      <main className="flex-1 w-full min-w-0 flex flex-col min-h-screen bg-white mx-auto shadow-[0_10px_50px_rgba(0,0,0,0.04)]">

        {/* ── Page Header ── */}
        <AdminPageHeader
          title="Review Categories"
          subtitle="Manage category tags · Set point multipliers · Activate or deactivate"
        />



        {/* ── Main content ── */}
        <div>
          <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6 overflow-hidden">

            {/* ── How It Works ── */}
            <HowItWorks steps={REVIEW_CAT_STEPS} />

            {/* ── Toolbar: filters + add button ── */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 mb-6">
              {/* Search */}
              <AdminSearchBar value={search} onChange={setSearch} />

              <ReviewCategoryFilters activeOnly={activeOnly} onFilterChange={setActiveOnly} />

              <button
                onClick={() => setShowCreate(true)}
                className="w-full sm:w-auto sm:ml-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white transition-all duration-150"
                style={{ background: "#004C8F" }}
              >
                <Plus className="w-4 h-4" />
                New Category
              </button>
            </div>

            {/* ── Flash ── */}
            {flash && (
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm mb-5 ${flash.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-destructive/10 border-destructive/20 text-red-800"
                  }`}
              >
                {flash.type === "success"
                  ? <Check className="w-4 h-4 shrink-0" />
                  : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span className="flex-1 font-medium">{flash.msg}</span>
                <button onClick={() => setFlash(null)} className="p-0.5 hover:opacity-60 transition-opacity">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* ── API error ── */}
            {error && !flash && (
              <div className="px-4 py-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-sm mb-5 text-center font-medium">
                {error}
              </div>
            )}

            {/* ── Section header ── */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4" style={{ color: "#004C8F" }} />
                <span className="font-semibold text-sm" style={{ color: "#004C8F" }}>
                  Review Categories
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {loading
                  ? "Loading…"
                  : `${(allCategories || []).length} total${activeCount > 0 ? ` · ${activeCount} active` : ""}${inactiveCount > 0 ? ` · ${inactiveCount} inactive` : ""}`}
              </span>
            </div>

            {/* ── Table ── */}
            <ReviewCategoryTable
              categories={categories}
              loading={loading}
              onEdit={startEdit}
              onToggleActive={handleToggleActive}
              editingId={editId}
              editForm={editForm}
              onUpdate={handleUpdate}
              onCancelEdit={() => setEditId(null)}
              onEditFormChange={(field, val) => setEditForm(p => ({ ...p, [field]: val }))}
              saving={saving}
              pagination={pagination}
              onPageChange={setPage}
            />

          </div>
        </div>

      </main>

      {/* ── Create modal ── */}
      <ReviewCategoryModals
        showCreate={showCreate}
        onCloseCreate={() => setShowCreate(false)}
        onCreate={handleCreate}
        saving={saving}
      />
      <SuccessToastContainer toasts={toasts} />
    </>
    </ProtectedRoute>
  );
}