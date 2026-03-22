"use client";

import React from "react";

export function Field({
    label,
    hint,
    required,
    children,
}: {
    label: string;
    hint?: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: "#6b7280" }}>
                {label} {required && <span style={{ color: "#E31837" }}>*</span>}
            </label>
            {children}
            {hint && <p className="text-xs mt-1" style={{ color: "#9ca3af" }}>{hint}</p>}
        </div>
    );
}

export function LevelBadge({ level }: { level: number }) {
    return (
        <span
            className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: "#1a4ab5" }}
        >
            {level}
        </span>
    );
}