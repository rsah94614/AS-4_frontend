"use client";

import { useState, useRef, useEffect } from "react";
import { ShoppingBag, Loader2, CheckCircle2, XCircle, Copy, Check } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { redeemReward, fetchWallet } from "@/services/rewards-service";
import { extractErrorMessage } from "@/lib/error-utils";
import { DialogState, RedemptionResponse } from "@/types/redeem-types";

type Phase = "confirm" | "loading" | "success" | "error";

interface Props {
  open: boolean;
  state: DialogState | null;
  availablePoints: number;
  walletId: string;
  employeeId: string;
  onClose: () => void;
  onSuccess: (result: RedemptionResponse, ptsSpent: number) => void;
}

/**
 * Polls the wallet endpoint until available_points drops by at least ptsSpent,
 * confirming the Redis Stream consumer has processed the deduction.
 *
 * @param employeeId   - used to fetch the wallet
 * @param pointsBefore - wallet balance BEFORE redemption
 * @param ptsSpent     - how many points were redeemed
 * @param signal       - AbortSignal to stop polling when dialog closes
 * @param maxAttempts  - max polls before giving up (default 10 = ~8s)
 * @param intervalMs   - delay between polls in ms (default 800ms)
 * @returns true if deduction confirmed, false if timed out or aborted
 */
async function waitForDeduction(
  employeeId: string,
  pointsBefore: number,
  ptsSpent: number,
  signal: AbortSignal,
  maxAttempts = 10,
  intervalMs = 800,
): Promise<boolean> {
  // Guard: never poll with a bad ID
  if (!employeeId || employeeId === "undefined" || employeeId === "null") {
    return false;
  }

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (signal.aborted) return false;

    await new Promise((r) => setTimeout(r, intervalMs));

    if (signal.aborted) return false;

    try {
      const wallet = await fetchWallet(employeeId);
      if (Number(wallet.available_points) <= Number(pointsBefore) - Number(ptsSpent)) {
        return true;
      }
    } catch {
      // Network blip — keep retrying until maxAttempts
    }
  }
  return false;
}

// ─────────── ReferenceRow ───────────────────────────────────────────────────

function ReferenceRow({ id }: { id: string | number }) {
  const [copied, setCopied] = useState(false);
  const raw = String(id);
  const hex = parseInt(raw, 10).toString(16).toUpperCase().padStart(8, "0");
  const display = `TXN-${hex.slice(0, 4)}-${hex.slice(4)}`;

  function handleCopy() {
    navigator.clipboard.writeText(raw);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex justify-between items-center text-xs text-slate-500 gap-4">
      <span className="shrink-0">Reference</span>
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="font-mono text-slate-600 text-[10px]">{display}</span>
        <button
          onClick={handleCopy}
          className="text-slate-400 hover:text-slate-600 transition-colors shrink-0"
          title={`Copy DB ID: ${raw}`}
        >
          {copied
            ? <Check size={11} className="text-emerald-500" />
            : <Copy size={11} />
          }
        </button>
      </div>
    </div>
  );
}

// ─────────── Inner body ─────────────────────────────────────────────────────

function RedeemDialogBody({
  state,
  availablePoints,
  walletId,
  employeeId,
  onClose,
  onSuccess,
}: Omit<Props, "open">) {
  const [comment, setComment] = useState("");
  const [phase, setPhase] = useState<Phase>("confirm");
  const [result, setResult] = useState<RedemptionResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [pollStatus, setPollStatus] = useState<"polling" | "confirmed" | "timeout">("polling");

  // Holds the AbortController for the active polling loop.
  // Aborting stops polling immediately when the dialog closes or unmounts.
  const abortRef = useRef<AbortController | null>(null);

  // Cancel any in-flight poll when the component unmounts (e.g. dialog destroyed mid-poll)
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const item = state?.phase === "confirm" ? state.item : null;

  // Wraps onClose so we always abort the polling loop before closing
  function handleClose() {
    abortRef.current?.abort();
    onClose();
  }

  async function handleConfirm() {
    if (!item) return;
    setPhase("loading");

    // Cancel any previous lingering poll, then create a fresh controller
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await redeemReward(
        walletId,
        item.catalog_id,
        item.default_points,
        comment || undefined,
      );

      // Show success screen immediately — don't make the user wait for polling
      setResult(res);
      setPollStatus("polling");
      setPhase("success");

      // Poll in background — update parent only when deduction is confirmed
      const confirmed = await waitForDeduction(
        employeeId,
        availablePoints,
        item.default_points,
        controller.signal, // ← signal wired in so poll stops on close
      );

      // If the dialog was closed mid-poll, don't touch any state
      if (controller.signal.aborted) return;

      if (confirmed) {
        setPollStatus("confirmed");
        onSuccess(res, item.default_points);
      } else {
        // Consumer is lagging — still call onSuccess so UI isn't stuck
        setPollStatus("timeout");
        onSuccess(res, item.default_points);
      }
    } catch (e) {
      if (controller.signal.aborted) return;
      setErrorMessage(extractErrorMessage(e, "Redemption failed"));
      setPhase("error");
    }
  }

  // ───────── CONFIRM ─────────────────────────────────────────────────────────
  if (phase === "confirm" && item) {
    return (
      <>
        <div className="px-7 pt-7 pb-5">
          <DialogHeader className="flex-row items-start gap-4 mb-5">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
              <ShoppingBag size={22} className="text-slate-700" />
            </div>
            <div className="flex-1 text-left">
              <DialogTitle className="text-lg font-bold text-slate-800">
                Confirm Redemption
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500 mt-1">
                You&apos;re about to redeem this reward from your points balance.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 mb-4">
            <p className="font-semibold text-slate-800 text-sm mb-1">
              {item.reward_name}
            </p>
            {item.description && (
              <p className="text-xs text-slate-400 mb-3">{item.description}</p>
            )}
            <div className="flex justify-between text-xs text-slate-500 pt-3 border-t border-slate-200">
              <span>Cost</span>
              <span className="font-bold text-slate-800">
                {item.default_points.toLocaleString()} pts
              </span>
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-1.5">
              <span>Balance after</span>
              <span
                className={`font-bold ${
                  availablePoints - item.default_points < 0
                    ? "text-red-500"
                    : "text-slate-800"
                }`}
              >
                {(availablePoints - item.default_points).toLocaleString()} pts
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="redeem-note" className="text-xs font-medium text-slate-500">
              Note (optional)
            </Label>
            <Input
              id="redeem-note"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. for team lunch"
              maxLength={200}
              className="rounded-md border-slate-100 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-slate-200"
            />
          </div>
        </div>

        <DialogFooter className="px-7 pb-7 flex gap-3 sm:flex-row">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1 rounded-xl border-slate-200 text-slate-600"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 rounded-xl bg-[#004C8F] hover:bg-[#0b487d] active:scale-[0.98] transition-all"
          >
            Confirm
          </Button>
        </DialogFooter>
      </>
    );
  }

  // ───────── LOADING ─────────────────────────────────────────────────────────
  if (phase === "loading") {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-7">
        <Loader2 size={36} className="text-[#004C8F] animate-spin mb-4" />
        <p className="text-sm text-slate-500 font-medium">
          Processing redemption…
        </p>
      </div>
    );
  }

  // ───────── SUCCESS ─────────────────────────────────────────────────────────
  if (phase === "success" && result && item) {
    return (
      <div className="flex flex-col items-center text-center px-7 py-10">
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-5">
          <CheckCircle2 size={32} className="text-emerald-500" />
        </div>

        <DialogHeader className="items-center mb-5">
          <DialogTitle className="text-lg font-bold text-slate-800">
            Redemption Successful!
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            <span className="font-semibold text-slate-700">
              {item.reward_name}
            </span>{" "}
            has been redeemed.
          </DialogDescription>
        </DialogHeader>

        <div className="w-full rounded-lg bg-slate-50 border border-slate-200 p-4 mb-4 text-left">
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span>Points spent</span>
            <span className="font-bold text-slate-800">
              {item.default_points.toLocaleString()}
            </span>
          </div>
          <ReferenceRow id={result.history_id} />
        </div>

        {/* Polling status indicator */}
        <div className="w-full mb-6">
          {pollStatus === "polling" && (
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
              <Loader2 size={11} className="animate-spin shrink-0" />
              <span>Syncing your balance…</span>
            </div>
          )}
          {pollStatus === "confirmed" && (
            <div className="flex items-center justify-center gap-2 text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
              <Check size={11} className="shrink-0" />
              <span>Balance updated successfully</span>
            </div>
          )}
          {pollStatus === "timeout" && (
            <div className="flex items-center justify-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              <span>Balance may take a moment to reflect</span>
            </div>
          )}
        </div>

        <Button
          onClick={handleClose}
          disabled={pollStatus === "polling"}
          className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {pollStatus === "polling" ? (
            <span className="flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" />
              Syncing…
            </span>
          ) : (
            "Done"
          )}
        </Button>
      </div>
    );
  }

  // ───────── ERROR ───────────────────────────────────────────────────────────
  if (phase === "error") {
    return (
      <div className="flex flex-col items-center text-center px-7 py-10">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-5">
          <XCircle size={32} className="text-red-500" />
        </div>
        <DialogHeader className="items-center mb-6">
          <DialogTitle className="text-lg font-bold text-slate-800">
            Redemption Failed
          </DialogTitle>
          <DialogDescription className="text-sm text-red-500">
            {errorMessage}
          </DialogDescription>
        </DialogHeader>
        <Button
          variant="outline"
          onClick={handleClose}
          className="w-full rounded-xl border-slate-200 text-slate-600"
        >
          Close
        </Button>
      </div>
    );
  }

  return null;
}

// ─────────── Outer shell ────────────────────────────────────────────────────

export default function RedeemDialog({
  open,
  state,
  availablePoints,
  walletId,
  employeeId,
  onClose,
  onSuccess,
}: Props) {
  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) onClose();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-md rounded-xl p-0 gap-0 overflow-hidden border-slate-200"
        showCloseButton={false}
      >
        <RedeemDialogBody
          key={String(open)}
          state={state}
          availablePoints={availablePoints}
          walletId={walletId}
          employeeId={employeeId}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}