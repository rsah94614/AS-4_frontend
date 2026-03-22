import { Button } from "@/components/ui/button";
import { DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";

export function ConfirmDeactivateDialog({ open, username, onConfirm, onCancel, loading }: {
    open: boolean; username: string;
    onConfirm: () => void; onCancel: () => void; loading: boolean;
}) {
    return (
        <Dialog open={open} onOpenChange={onCancel}>
            <DialogContent className="w-full max-w-sm p-0 overflow-hidden rounded-xl border-0 [&>button]:hidden">
                <div className="px-6 py-5 flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
                        <AlertTriangle size={22} className="text-amber-500" />
                    </div>
                    <div>
                        <DialogTitle className="text-[15px] font-bold text-foreground mb-1">Deactivate Employee?</DialogTitle>
                        <DialogDescription className="text-[13px] text-muted-foreground leading-relaxed">
                            Are you sure you want to deactivate <span className="font-semibold text-foreground">{username}</span>?
                            Their history will be preserved.
                        </DialogDescription>
                    </div>
                </div>
                <div className="px-6 pb-5 flex items-center justify-center gap-3">
                    <Button variant="outline" onClick={onCancel} disabled={loading}
                        className="border-border text-sm font-semibold px-5">
                        Cancel
                    </Button>
                    <button onClick={onConfirm} disabled={loading}
                        className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                        style={{ background: "#004C8F" }}>
                        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        Yes, Deactivate
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}