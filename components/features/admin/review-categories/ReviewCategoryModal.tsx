"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
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

// ── Create Modal ──────────────────────────────────────────────────────────────

interface CreateForm {
  category_code: string;
  category_name: string;
  multiplier: string;
  description: string;
}

interface ReviewCategoryModalsProps {
  showCreate: boolean;
  onCloseCreate: () => void;
  onCreate: (form: Record<string, unknown>) => Promise<void>;
  saving: boolean;
}

export function ReviewCategoryModals({
  showCreate,
  onCloseCreate,
  onCreate,
  saving,
}: ReviewCategoryModalsProps) {
  const [form, setForm] = useState<CreateForm>({
    category_code: "",
    category_name: "",
    multiplier: "",
    description: "",
  });
  const [descError, setDescError] = useState<string | null>(null);
  const [multiplierError, setMultiplierError] = useState<string | null>(null);

  const handleDescriptionChange = (value: string) => {
    if (value.length > DESC_MAX_LENGTH) return;
    setForm(p => ({ ...p, description: value }));
    setDescError(validateDescription(value));
  };

  const handleSubmit = async () => {
    const err = validateDescription(form.description);
    if (err) { setDescError(err); return; }
    await onCreate({
      category_code: form.category_code,
      category_name: form.category_name,
      multiplier: form.multiplier,
      description: form.description,
    });
    // Reset on success (parent closes modal)
    setForm({ category_code: "", category_name: "", multiplier: "", description: "" });
    setDescError(null);
  };

  const handleClose = () => {
    setForm({ category_code: "", category_name: "", multiplier: "", description: "" });
    setDescError(null);
    onCloseCreate();
  };

  return (
    <Dialog open={showCreate} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent
        showCloseButton={false}
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="max-w-md p-0 border-none bg-white rounded-2xl overflow-hidden shadow-xl flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 shrink-0">
          <DialogTitle className="text-lg font-bold text-gray-900">New Review Category</DialogTitle>
          <button
            onClick={handleClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="space-y-4">
            {/* Code */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Category Code <span style={{ color: "#E31837" }}>*</span>
              </label>
              <input
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 uppercase font-mono"
                placeholder="e.g. INNOVATION"
                value={form.category_code}
                onChange={e => setForm(p => ({ ...p, category_code: e.target.value.toUpperCase() }))}
                maxLength={50}
              />
              <p className="text-xs text-gray-400 mt-1">Unique short code — auto-uppercased.</p>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Category Name <span style={{ color: "#E31837" }}>*</span>
              </label>
              <input
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="e.g. Innovation"
                value={form.category_name}
                onChange={e => setForm(p => ({ ...p, category_name: e.target.value }))}
                maxLength={100}
              />
            </div>

            {/* Multiplier */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Multiplier <span style={{ color: "#E31837" }}>*</span>
              </label>
              <input
                type="number"
                min="0.01"
                max="2"
                step="0.1"
                className={`w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 ${multiplierError ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-blue-300"}`}
                placeholder="e.g. 1.4"
                value={form.multiplier}
                onChange={e => {
                  const val = e.target.value;
                  setForm(p => ({ ...p, multiplier: val }));
                  const num = parseFloat(val);
                  if (val && !isNaN(num) && num > 2) {
                    setMultiplierError("Multiplier cannot exceed 2.");
                  } else {
                    setMultiplierError(null);
                  }
                }}
              />
              {multiplierError ? (
                <p className="text-xs text-red-500 mt-1 font-medium">{multiplierError}</p>
              ) : (
                <p className="text-xs text-gray-400 mt-1">
                  Points = sum of selected multipliers × reviewer weight. Max: 2.
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Description <span className="text-gray-300">(optional)</span>
              </label>
              <textarea
                className={`w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 resize-none ${descError ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-blue-300"}`}
                rows={2}
                placeholder="e.g. Recognises creative problem-solving and novel ideas"
                value={form.description}
                onChange={e => handleDescriptionChange(e.target.value)}
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
          </div>

          {/* Footer */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleClose}
              className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl py-2.5 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving || !!descError || !!multiplierError}
              className="flex-1 disabled:opacity-50 text-white rounded-xl py-2.5 text-sm font-bold transition-all flex items-center justify-center gap-2"
              style={{ background: "#004C8F" }}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Create Category
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}