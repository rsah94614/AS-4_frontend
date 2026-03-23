"use client";

import { Edit2, Loader2, Check, X } from "lucide-react";
import {
    Status,
    EntityType,
    ENTITY_TYPES,
    ENTITY_META,
} from "@/types/status-types";
import { SkeletonSection } from "./UIHelpers";
import { DataTable, Column } from "@/components/shared/DataTable";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EditForm {
    status_name: string;
    description: string;
}

interface StatusTableProps {
    statuses: Status[];
    loading: boolean;
    filterType: EntityType | "";
    editId: string | null;
    editForm: EditForm;
    saving: boolean;
    onEdit: (s: Status) => void;
    onUpdate: (id: string) => void;
    onCancelEdit: () => void;
    onEditFormChange: (field: keyof EditForm, val: string) => void;
}

// ─── Single Section Table ─────────────────────────────────────────────────────

function StatusSection({
    type,
    items,
    editId,
    editForm,
    saving,
    onEdit,
    onUpdate,
    onCancelEdit,
    onEditFormChange,
}: {
    type: EntityType;
    items: Status[];
    editId: string | null;
    editForm: EditForm;
    saving: boolean;
    onEdit: (s: Status) => void;
    onUpdate: (id: string) => void;
    onCancelEdit: () => void;
    onEditFormChange: (field: keyof EditForm, val: string) => void;
}) {
    const meta = ENTITY_META[type];

    const columns: Column<Status>[] = [
        {
            key: "code",
            header: "Code",
            skeletonWidth: "w-20",
            headerClassName: "w-40",
            render: (status) => (
                <span className={`font-mono text-xs font-bold ${meta.textColor}`}>
                    {status.status_code}
                </span>
            ),
        },
        {
            key: "name",
            header: "Display Name",
            skeletonWidth: "w-32",
            headerClassName: "w-56",
            render: (status) =>
                editId === status.status_id ? (
                    <input
                        autoFocus
                        value={editForm.status_name}
                        onChange={(e) => onEditFormChange("status_name", e.target.value)}
                        className="border border-[#004C8F]/30 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#004C8F]/20 w-full bg-blue-50/30"
                    />
                ) : (
                    <span className="font-semibold text-gray-800">
                        {status.status_name}
                    </span>
                ),
        },
        {
            key: "description",
            header: "Description",
            skeletonWidth: "w-48",
            render: (status) =>
                editId === status.status_id ? (
                    <input
                        value={editForm.description}
                        onChange={(e) => onEditFormChange("description", e.target.value)}
                        className="border border-[#004C8F]/30 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#004C8F]/20 w-full bg-blue-50/30"
                        placeholder="Optional description"
                    />
                ) : (
                    <span className="text-gray-400 text-sm">
                        {status.description || (
                            <span className="italic text-gray-300">No description</span>
                        )}
                    </span>
                ),
        },
        {
            key: "actions",
            header: "",
            skeletonWidth: "w-16",
            headerClassName: "w-32",
            render: (status) => (
                <div className="flex items-center gap-2 justify-end">
                    {editId === status.status_id ? (
                        <>
                            <button
                                onClick={() => onUpdate(status.status_id)}
                                disabled={saving}
                                className="flex items-center gap-1.5 text-xs text-white px-3.5 py-2 rounded-xl disabled:opacity-50 font-semibold transition hover:opacity-90"
                                style={{ background: "#004C8F" }}
                            >
                                {saving ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                    <Check className="w-3 h-3" />
                                )}{" "}
                                Save
                            </button>
                            <button
                                onClick={onCancelEdit}
                                className="text-xs text-gray-500 hover:bg-gray-100 px-3.5 py-2 rounded-xl transition font-medium"
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => onEdit(status)}
                            className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#004C8F] hover:bg-blue-50 border border-gray-200 hover:border-[#004C8F]/30 px-3 py-1.5 rounded-xl transition font-medium"
                        >
                            <Edit2 className="w-3 h-3" /> Edit
                        </button>
                    )}
                </div>
            ),
        },
    ];

    const mobileCard = (status: Status) => (
        <div className="p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <span
                        className={`font-mono text-xs font-bold ${meta.textColor} inline-block mb-1`}
                    >
                        {status.status_code}
                    </span>
                    {editId === status.status_id ? (
                        <div className="space-y-2">
                            <input
                                autoFocus
                                value={editForm.status_name}
                                onChange={(e) =>
                                    onEditFormChange("status_name", e.target.value)
                                }
                                className="w-full border border-[#004C8F]/30 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#004C8F]/20 bg-blue-50/30"
                            />
                            <input
                                value={editForm.description}
                                onChange={(e) =>
                                    onEditFormChange("description", e.target.value)
                                }
                                placeholder="Description (optional)"
                                className="w-full border border-[#004C8F]/30 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#004C8F]/20 bg-blue-50/30"
                            />
                        </div>
                    ) : (
                        <>
                            <p className="font-semibold text-gray-800 text-sm">
                                {status.status_name}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                                {status.description || (
                                    <span className="italic">No description</span>
                                )}
                            </p>
                        </>
                    )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0 mt-1">
                    {editId === status.status_id ? (
                        <>
                            <button
                                onClick={() => onUpdate(status.status_id)}
                                disabled={saving}
                                className="flex items-center gap-1 text-xs text-white px-3 py-1.5 rounded-xl disabled:opacity-50 font-semibold transition hover:opacity-90"
                                style={{ background: "#004C8F" }}
                            >
                                {saving ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                    <Check className="w-3 h-3" />
                                )}{" "}
                                Save
                            </button>
                            <button
                                onClick={onCancelEdit}
                                className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-xl transition"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => onEdit(status)}
                            className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-xl transition font-medium"
                        >
                            <Edit2 className="w-3 h-3" /> Edit
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8 last:mb-0">
            {/* Section header */}
            <div
                className={`flex items-center px-5 py-3.5 border-b border-gray-100 ${meta.header}`}
            >
                <div>
                    <span className="text-sm font-bold text-gray-800">
                        {meta.label} Statuses
                    </span>
                    <span className="text-xs text-gray-400 ml-2 font-normal hidden sm:inline">
                        {meta.description}
                    </span>
                </div>
                <span
                    className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full border ${meta.textColor}`}
                >
                    {items.length}
                </span>
            </div>

            {/* Mobile: description below header */}
            <div
                className={`sm:hidden px-5 py-2.5 text-xs text-gray-500 border-b ${meta.header}`}
            >
                {meta.description}
            </div>

            {items.length === 0 ? (
                <div className="px-5 py-10 text-center">
                    <p className="text-sm font-medium text-gray-400">
                        No {meta.label.toLowerCase()} statuses yet
                    </p>
                    <p className="text-xs text-gray-300 mt-1">
                        Click &ldquo;Add Status&rdquo; to create one
                    </p>
                </div>
            ) : (
                <DataTable
                    columns={columns}
                    data={items}
                    loading={false}
                    keyExtractor={(s) => s.status_id}
                    mobileCardRender={mobileCard}
                    mobileBreakpoint="sm"
                    minTableWidth="600px"
                />
            )}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function StatusTable({
    statuses,
    loading,
    filterType,
    editId,
    editForm,
    saving,
    onEdit,
    onUpdate,
    onCancelEdit,
    onEditFormChange,
}: StatusTableProps) {
    const visibleTypes = (filterType ? [filterType] : ENTITY_TYPES) as EntityType[];
    const grouped = Object.fromEntries(
        ENTITY_TYPES.map((t) => [t, statuses.filter((s) => s.entity_type === t)])
    ) as Record<EntityType, Status[]>;

    if (loading) {
        return (
            <div className="space-y-5">
                {ENTITY_TYPES.map((_, i) => (
                    <SkeletonSection key={i} index={i} />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {visibleTypes.map((type) => (
                <StatusSection
                    key={type}
                    type={type}
                    items={grouped[type] ?? []}
                    editId={editId}
                    editForm={editForm}
                    saving={saving}
                    onEdit={onEdit}
                    onUpdate={onUpdate}
                    onCancelEdit={onCancelEdit}
                    onEditFormChange={onEditFormChange}
                />
            ))}
        </div>
    );
}
