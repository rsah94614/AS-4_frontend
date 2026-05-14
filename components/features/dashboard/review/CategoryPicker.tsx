"use client"

import { Zap } from "lucide-react"
import type { ReviewCategory } from "@/types/review-types"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface CategoryPickerProps {
    categories: ReviewCategory[]
    selectedIds: string[]
    onChange: React.Dispatch<React.SetStateAction<string[]>>
    disabled?: boolean
    maxSelectable?: number
}

function CategoryCard({
    cat,
    selected,
    onClick,
    disabled,
}: {
    cat: ReviewCategory
    selected: boolean
    onClick: () => void
    disabled?: boolean
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "w-full text-left group outline-none",
                disabled && !selected && "opacity-40 cursor-not-allowed"
            )}
        >
            <Card className={cn(
                "relative !flex-row items-center !gap-0 overflow-hidden transition-all duration-150 shadow-sm !py-0 h-[56px]",
                selected
                    ? "border-[#004C8F] bg-[#004C8F]/8 ring-1 ring-[#004C8F]/20"
                    : "border-gray-200 bg-white group-hover:border-[#004C8F]/40 group-hover:bg-blue-50/40"
            )}>
                <div className="flex-1 min-w-0 py-2 pl-4 pr-2">
                    <span className={cn(
                        "text-[13px] font-bold leading-tight block",
                        selected ? "text-[#004C8F]" : "text-gray-800"
                    )}>
                        {cat.category_name}
                    </span>
                    {cat.description && (
                        <span className={cn(
                            "text-[11px] leading-tight mt-0.5 block truncate",
                            selected ? "text-[#004C8F]/70" : "text-gray-500"
                        )}>
                            {cat.description}
                        </span>
                    )}
                </div>

                {/* Multiplier badge */}
                <div className="pr-3 shrink-0">
                    <Badge
                        variant="secondary"
                        className={cn(
                            "gap-0.5 text-[10px] font-black rounded-md px-1.5 py-0.5 border-0 hover:bg-transparent transition-colors",
                            selected
                                ? "bg-[#004C8F] text-white hover:bg-[#004C8F]/90"
                                : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                        )}
                    >
                        <Zap size={9} strokeWidth={2.5} />
                        ×{cat.multiplier}
                    </Badge>
                </div>
            </Card>
        </button>
    )
}

export default function CategoryPicker({
    categories,
    selectedIds,
    onChange,
    disabled,
    maxSelectable = 5,
}: CategoryPickerProps) {
    function toggleCategory(id: string) {
        onChange((prev) =>
            prev.includes(id)
                ? prev.filter((cid) => cid !== id)
                : [...prev, id]
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {categories.map((cat) => {
                const isSelected = selectedIds.includes(cat.category_id)
                const atMax = selectedIds.length >= maxSelectable && !isSelected
                return (
                    <CategoryCard
                        key={cat.category_id}
                        cat={cat}
                        selected={isSelected}
                        disabled={disabled || atMax}
                        onClick={() => toggleCategory(cat.category_id)}
                    />
                )
            })}
        </div>
    )
}