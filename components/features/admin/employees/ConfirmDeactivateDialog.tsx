import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, Loader2, X } from "lucide-react";

export function ConfirmDeactivateDialog({ open, username, onConfirm, onCancel, loading }: {
    open: boolean; username: string;
    onConfirm: () => void; onCancel: () => void; loading: boolean;
}) {
    return (
        <Dialog open={open} onOpenChange={onCancel}>
            <DialogContent
                showCloseButton={false}
                onOpenAutoFocus={(e) => e.preventDefault()}
                className="max-w-sm p-0 border-none bg-white rounded-2xl overflow-hidden shadow-xl flex flex-col"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 shrink-0">
                    <DialogTitle className="text-lg font-bold text-gray-900">Deactivate Employee?</DialogTitle>
                    <button
                        onClick={onCancel}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 pb-6">
                    <div className="flex items-start gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                            <AlertTriangle size={18} className="text-amber-500" />
                        </div>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Are you sure you want to deactivate <span className="font-semibold text-gray-700">{username}</span>?
                            Their history will be preserved.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={loading}
                            className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl py-2.5 text-sm font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={loading}
                            className="flex-1 disabled:opacity-50 text-white rounded-xl py-2.5 text-sm font-bold transition-all flex items-center justify-center gap-2"
                            style={{ background: "#004C8F" }}
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Yes, Deactivate
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}