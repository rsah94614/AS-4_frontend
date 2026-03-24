"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, AlertCircle } from "lucide-react";

// ── Hook ──────────────────────────────────────────────────────────────────────

export interface Toast {
    id: number;
    message: string;
    type: "success" | "error";
}

export function useSuccessToast() {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const show = useCallback((message: string, type: "success" | "error" = "success") => {
        const id = Date.now() + Math.random();
        setToasts((t) => [...t, { id, message, type }]);
        setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
    }, []);
    return { toasts, show };
}

// ── Single Toast Item (with enter animation) ─────────────────────────────────

function ToastItem({ toast }: { toast: Toast }) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        // Start off-screen
        el.style.opacity = "0";
        el.style.transform = "translateY(16px) scale(0.96)";
        // Trigger animation on next frame
        requestAnimationFrame(() => {
            el.style.transition = "opacity 0.35s cubic-bezier(.21,1.02,.73,1), transform 0.35s cubic-bezier(.21,1.02,.73,1)";
            el.style.opacity = "1";
            el.style.transform = "translateY(0) scale(1)";
        });
    }, []);

    return (
        <div
            ref={ref}
            className="pointer-events-auto flex items-center gap-3 pl-4 pr-4 py-3.5 rounded-xl bg-white shadow-2xl min-w-[280px] max-w-[420px]"
            style={{
                boxShadow: "0 8px 30px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)",
            }}
        >
            {toast.type === "success" ? (
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#ecfdf5" }}>
                    <CheckCircle2 size={16} style={{ color: "#10b981" }} />
                </div>
            ) : (
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#fef2f2" }}>
                    <AlertCircle size={16} style={{ color: "#ef4444" }} />
                </div>
            )}
            <p className="text-sm font-medium" style={{ color: "#1f2937" }}>{toast.message}</p>
        </div>
    );
}

// ── Toast Container (portaled to body) ────────────────────────────────────────

export function SuccessToastContainer({ toasts }: { toasts: Toast[] }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line
        setMounted(true);
    }, []);

    if (!mounted || !toasts.length) return null;

    return createPortal(
        <div
            style={{
                position: "fixed",
                bottom: 24,
                right: 24,
                zIndex: 9999,
                display: "flex",
                flexDirection: "column",
                gap: 10,
                pointerEvents: "none",
            }}
        >
            {toasts.map((t) => (
                <ToastItem key={t.id} toast={t} />
            ))}
        </div>,
        document.body
    );
}
