"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Gift,
  Ticket,
  RefreshCw,
  ArrowDownCircle,
  TrendingUp,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
  Zap,
  Clock,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { walletClient } from "@/services/api-clients";
import { auth } from "@/services/auth-service";
import { extractErrorMessage } from "@/lib/error-utils";
import PaginationControls from "@/components/shared/PaginationControls";
import { PageHeader } from "@/components/shared/PageHeader";
import type {
  WalletData,
  PointsSummary,
  Transaction,
  TransactionListResponse,
} from "@/types/wallet-types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function useCountUp(target: number, duration = 1000) {
  const [value, setValue] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    if (target === prev.current) return;
    const start = prev.current;
    const diff = target - start;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      const e = 1 - Math.pow(1 - p, 4);
      setValue(Math.round(start + diff * e));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    prev.current = target;
  }, [target, duration]);
  return value;
}

function getTxnTitle(txn: Transaction): string {
  const desc = txn.description ?? "";
  const code = txn.transaction_type.code ?? "";
  const cleaned = desc
    .replace(/\s+[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, "")
    .trim();
  if (code === "POINTS_REDEEMED") return "Reward Redeemed";
  if (code === "REVIEW_CREDIT") return "Performance Review Reward";
  if (cleaned.toLowerCase().includes("reward redemption")) return "Reward Redeemed";
  if (cleaned.toLowerCase().includes("review")) return "Performance Review Reward";
  return cleaned || txn.transaction_type.name;
}

function getStatus(txn: Transaction): { label: string; color: string } {
  const code = txn.status.code;
  const isCredit = txn.transaction_type.is_credit;
  if (["TXN_COMPLETED", "SUCCESS", "COMPLETED"].includes(code))
    return { label: isCredit ? "Credited" : "Redeemed", color: isCredit ? "#10b981" : "#004C8F" };
  if (["TXN_FAILED", "FAILED"].includes(code)) return { label: "Failed", color: "#ef4444" };
  if (["TXN_PENDING", "PENDING", "TXN_PROCESSING", "PROCESSING"].includes(code))
    return { label: "Pending", color: "#f59e0b" };
  if (["TXN_REVERSED", "REVERSED"].includes(code)) return { label: "Reversed", color: "#94a3b8" };
  return { label: txn.status.name, color: "#94a3b8" };
}

// ─── Fetchers ─────────────────────────────────────────────────────────────────

async function fetchWallet(employeeId: string): Promise<WalletData> {
  try {
    const res = await walletClient.get<WalletData>(`/employees/${employeeId}`);
    return res.data;
  } catch (e: unknown) {
    throw new Error(extractErrorMessage(e, "Failed to load wallet"));
  }
}

async function fetchPointsSummary(walletId: string): Promise<PointsSummary> {
  try {
    const res = await walletClient.get<PointsSummary>(`/${walletId}/points-summary`);
    return res.data;
  } catch (e: unknown) {
    throw new Error(extractErrorMessage(e, "Failed to load points summary"));
  }
}

async function fetchTransactions(
  walletId: string,
  page: number,
  limit: number
): Promise<TransactionListResponse> {
  try {
    const params = new URLSearchParams({
      wallet_id: walletId,
      page: String(page),
      limit: String(limit),
    });
    const res = await walletClient.get<TransactionListResponse>(
      `/transactions?${params.toString()}`
    );
    return res.data;
  } catch (e: unknown) {
    throw new Error(extractErrorMessage(e, "Failed to load transactions"));
  }
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Pulse({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-100 ${className}`} />;
}

function PageSkeleton() {
  return (
    <div className="flex-1 w-full min-h-screen" style={{ background: "#F0F4FA" }}>
      <PageHeader title="Wallet" subtitle="Manage your points balance and transactions" />
      <div className="w-full px-6 py-8 flex flex-col gap-6">
        <Pulse className="h-56 rounded-3xl" />
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => <Pulse key={i} className="h-28" />)}
        </div>
        <div className="grid grid-cols-[1fr_300px] gap-5">
          <Pulse className="h-96" />
          <div className="flex flex-col gap-4">
            <Pulse className="h-44" />
            <Pulse className="h-44" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Error Banner ─────────────────────────────────────────────────────────────

function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-2xl bg-red-50 border border-red-100 px-5 py-4 flex items-center justify-between">
      <p className="text-sm text-red-600 font-medium">{message}</p>
      <button
        onClick={onRetry}
        className="flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-100 px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors ml-4 shrink-0"
      >
        <RefreshCw size={11} /> Retry
      </button>
    </div>
  );
}

// ─── Hero Card ────────────────────────────────────────────────────────────────

function HeroCard({ balance, loading }: { balance: number; loading: boolean }) {
  return (
    <div
      className="relative rounded-3xl overflow-hidden select-none"
      style={{
        background: "linear-gradient(135deg, #001f4d 0%, #003880 40%, #0055b3 100%)",
        minHeight: 224,
        boxShadow: "0 24px 60px rgba(0,60,140,0.35), 0 4px 16px rgba(0,0,0,0.12)",
      }}
    >
      {/* Glow blobs */}
      <div style={{ position: "absolute", top: -80, right: -60, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,179,237,0.18) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -60, left: -40, width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle, rgba(129,140,248,0.14) 0%, transparent 70%)", pointerEvents: "none" }} />
      {/* Grid overlay */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" }} />

      <div className="relative z-10 p-8 flex flex-col justify-between" style={{ minHeight: 200 }}>
        {/* Top label */}
        <div>
          <p className="text-[10px] font-bold tracking-[0.18em] uppercase mb-1" style={{ color: "rgba(147,197,253,0.7)" }}>
            Rewards Wallet
          </p>
          <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>
            Employee Points Account
          </p>
        </div>

        {/* Balance + Redeem on same row */}
        <div className="flex items-end justify-between mt-6">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.1em] uppercase mb-2" style={{ color: "rgba(147,197,253,0.6)" }}>
              Available Points
            </p>
            {loading ? (
              <div className="animate-pulse rounded-xl" style={{ width: 160, height: 56, background: "rgba(255,255,255,0.08)" }} />
            ) : (
              <p className="font-bold tabular-nums leading-none" style={{ fontSize: 54, color: "#fff", letterSpacing: "-0.03em" }}>
                {balance.toLocaleString()}
                <span style={{ fontSize: 20, fontWeight: 400, color: "rgba(255,255,255,0.38)", marginLeft: 8 }}>pts</span>
              </p>
            )}
          </div>
          <Link href="/redeem">
            <button
              className="flex items-center gap-2 font-semibold text-sm transition-all active:scale-95 hover:brightness-110"
              style={{ background: "rgba(255,255,255,0.13)", border: "1px solid rgba(255,255,255,0.22)", color: "#fff", borderRadius: 12, padding: "10px 22px" }}
            >
              Redeem Points <ArrowUpRight size={15} />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, icon: Icon, iconBg, iconColor, valueColor,
}: {
  label: string; value: number; icon: React.ElementType;
  iconBg: string; iconColor: string; valueColor: string;
}) {
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: "#fff", border: "1px solid #E8EDF5", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: iconBg }}>
        <Icon size={18} style={{ color: iconColor }} />
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "#94a3b8" }}>{label}</p>
        <p className="text-2xl font-bold tabular-nums" style={{ color: valueColor, letterSpacing: "-0.02em" }}>
          {value.toLocaleString()}
        </p>
      </div>
    </div>
  );
}

// ─── Transaction Row ──────────────────────────────────────────────────────────

function TransactionRow({ txn }: { txn: Transaction }) {
  const router = useRouter();
  const isCredit = txn.transaction_type.is_credit;
  const isRedemption =
    txn.transaction_type.code === "POINTS_REDEEMED" ||
    (txn.reference_number ?? "").startsWith("redemption:");
  const historyId = isRedemption
    ? txn.reference_number?.replace("redemption:", "").trim()
    : txn.transaction_id;

  const title = getTxnTitle(txn);
  const { label: statusLabel, color: statusColor } = getStatus(txn);

  return (
    <div
      onClick={() => historyId && router.push(`/history?open=${historyId}`)}
      className="flex items-center gap-4 px-5 py-4 transition-colors"
      style={{ cursor: historyId ? "pointer" : "default" }}
      onMouseEnter={(e) => { if (historyId) (e.currentTarget as HTMLDivElement).style.background = "#F7FAFF"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
    >
      <div className="shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: isCredit ? "linear-gradient(135deg,#d1fae5,#a7f3d0)" : "linear-gradient(135deg,#dbeafe,#bfdbfe)" }}>
        {isCredit
          ? <ArrowDownLeft size={18} style={{ color: "#059669" }} />
          : <ArrowUpRight size={18} style={{ color: "#2563eb" }} />}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: "#0f172a" }}>{title}</p>
        <p className="text-xs mt-0.5 font-mono" style={{ color: "#94a3b8" }}>
          {formatDate(txn.transaction_at)} · {formatTime(txn.transaction_at)}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-sm font-bold tabular-nums" style={{ color: isCredit ? "#059669" : "#0f172a" }}>
          {isCredit }{txn.amount.toLocaleString()} pts
        </p>
        <p className="text-[10px] font-bold uppercase tracking-wider mt-1" style={{ color: statusColor }}>
          {statusLabel}
        </p>
      </div>

      {historyId && <ChevronRight size={14} className="shrink-0" style={{ color: "#cbd5e1" }} />}
    </div>
  );
}

// ─── Period Summary ───────────────────────────────────────────────────────────

function PeriodSummary({ summary, loading }: { summary: PointsSummary | null; loading: boolean }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1px solid #E8EDF5", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
      <div className="flex items-center gap-2.5 px-5 py-4" style={{ borderBottom: "1px solid #F1F5FB" }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#EEF4FB" }}>
          <BarChart3 size={15} style={{ color: "#004C8F" }} />
        </div>
        <p className="text-sm font-bold" style={{ color: "#0f172a" }}>Period Summary</p>
      </div>
      <div className="p-4 flex flex-col gap-3">
        {[
          { label: "This Month", value: summary?.points_this_month ?? 0 },
          { label: "This Year", value: summary?.points_this_year ?? 0 },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: "#F7FAFF", border: "1px solid #E8EDF5" }}>
            <p className="text-sm font-medium" style={{ color: "#64748b" }}>{label}</p>
            {loading ? (
              <div className="animate-pulse rounded-lg" style={{ width: 72, height: 20, background: "#e2e8f0" }} />
            ) : (
              <p className="text-base font-bold tabular-nums" style={{ color: "#004C8F" }}>
                {value.toLocaleString()}
                <span className="text-xs font-normal ml-1" style={{ color: "#94a3b8" }}>pts</span>
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Quick Actions ────────────────────────────────────────────────────────────

function QuickActions() {
  const actions = [
    { label: "Redeem a Reward", sub: "Use your points", icon: Gift, href: "/redeem", iconBg: "#EEF4FB", iconColor: "#004C8F" },
    { label: "View Full History", sub: "All transactions", icon: Clock, href: "/history", iconBg: "#ECFDF5", iconColor: "#059669" },
  ];
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1px solid #E8EDF5", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
      <div className="flex items-center gap-2.5 px-5 py-4" style={{ borderBottom: "1px solid #F1F5FB" }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#EEF4FB" }}>
          <Zap size={15} style={{ color: "#004C8F" }} />
        </div>
        <p className="text-sm font-bold" style={{ color: "#0f172a" }}>Quick Actions</p>
      </div>
      <div className="p-3 flex flex-col gap-1">
        {actions.map(({ label, sub, icon: Icon, href, iconBg, iconColor }) => (
          <Link key={label} href={href}>
            <div
              className="flex items-center gap-3.5 px-3 py-3 rounded-xl transition-colors cursor-pointer"
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "#F7FAFF"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: iconBg }}>
                <Icon size={16} style={{ color: iconColor }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: "#0f172a" }}>{label}</p>
                <p className="text-xs" style={{ color: "#94a3b8" }}>{sub}</p>
              </div>
              <ChevronRight size={14} style={{ color: "#cbd5e1" }} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TXN_PAGE_SIZE = 10;

export default function WalletPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [summary, setSummary] = useState<PointsSummary | null>(null);
  const [txnData, setTxnData] = useState<TransactionListResponse | null>(null);
  const [txnPage, setTxnPage] = useState(1);
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingTxns, setLoadingTxns] = useState(true);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [txnError, setTxnError] = useState<string | null>(null);

  const displayBalance = useCountUp(loadingWallet ? 0 : wallet?.available_points ?? 0);

  const loadWallet = useCallback(async () => {
    const user = auth.getUser();
    if (!user?.employee_id) {
      setWalletError("Not authenticated. Please log in.");
      setLoadingWallet(false);
      setLoadingSummary(false);
      return;
    }
    setLoadingWallet(true);
    setLoadingSummary(true);
    setWalletError(null);
    try {
      const walletData = await fetchWallet(user.employee_id);
      setWallet(walletData);
      setLoadingWallet(false);
      try {
        const sumData = await fetchPointsSummary(walletData.wallet_id);
        setSummary(sumData);
      } finally {
        setLoadingSummary(false);
      }
    } catch (e) {
      setWalletError(extractErrorMessage(e, "Failed to load wallet data."));
      setLoadingSummary(false);
    } finally {
      setLoadingWallet(false);
    }
  }, []);

  const loadTransactions = useCallback(async (walletId: string, page: number) => {
    setLoadingTxns(true);
    setTxnError(null);
    try {
      const data = await fetchTransactions(walletId, page, TXN_PAGE_SIZE);
      setTxnData(data);
    } catch (e) {
      setTxnError(extractErrorMessage(e, "Failed to load transactions."));
    } finally {
      setLoadingTxns(false);
    }
  }, []);

  useEffect(() => { loadWallet(); }, [loadWallet]);

  useEffect(() => {
    if (wallet?.wallet_id) loadTransactions(wallet.wallet_id, txnPage);
  }, [wallet?.wallet_id, txnPage, loadTransactions]);

  const totalPages = txnData ? Math.max(1, Math.ceil(txnData.total / TXN_PAGE_SIZE)) : 1;

  if (loadingWallet) return <PageSkeleton />;

  return (
    <div className="flex-1 w-full min-h-screen" style={{ background: "#F0F4FA" }}>
      <PageHeader title="Wallet" subtitle="Manage your points balance and transactions" />

      <div className="w-full px-6 md:px-10 py-8 flex flex-col gap-6">

        {/* Hero */}
        <HeroCard balance={displayBalance} loading={loadingWallet} />

        {walletError && <ErrorBanner message={walletError} onRetry={loadWallet} />}

        {/* Stats */}
        {wallet && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Available" value={wallet.available_points} icon={TrendingUp}
              iconBg="linear-gradient(135deg,#dbeafe,#bfdbfe)" iconColor="#2563eb" valueColor="#004C8F" />
            <StatCard label="Total Earned" value={wallet.total_earned_points} icon={Gift}
              iconBg="linear-gradient(135deg,#d1fae5,#a7f3d0)" iconColor="#059669" valueColor="#065f46" />
            <StatCard label="Redeemed" value={wallet.redeemed_points} icon={Ticket}
              iconBg="linear-gradient(135deg,#fce7f3,#fbcfe8)" iconColor="#db2777" valueColor="#9d174d" />
          </div>
        )}

        {/* Two-col */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 items-start">

          {/* Transactions */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1px solid #E8EDF5", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid #F1F5FB" }}>
              <div>
                <h3 className="text-sm font-bold" style={{ color: "#0f172a" }}>Recent Activity</h3>
                {txnData && (
                  <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                    {txnData.total.toLocaleString()} transactions total
                  </p>
                )}
              </div>
              <button
                onClick={() => wallet?.wallet_id && loadTransactions(wallet.wallet_id, txnPage)}
                disabled={loadingTxns || !wallet}
                className="flex items-center gap-1.5 text-xs font-semibold rounded-xl px-3 py-2 transition-colors disabled:opacity-40"
                style={{ color: "#004C8F", background: "#EEF4FB", border: "1px solid #D8E6F7" }}
              >
                <RefreshCw size={11} className={loadingTxns ? "animate-spin" : ""} /> Refresh
              </button>
            </div>

            <div>
              {txnError && (
                <div className="p-4">
                  <ErrorBanner message={txnError} onRetry={() => wallet && loadTransactions(wallet.wallet_id, txnPage)} />
                </div>
              )}

              {loadingTxns ? (
                <div className="flex flex-col gap-3 p-5">
                  {Array.from({ length: 5 }).map((_, i) => <Pulse key={i} className="h-16" />)}
                </div>
              ) : txnData?.transactions.length === 0 ? (
                <div className="flex flex-col items-center py-16 gap-3" style={{ color: "#cbd5e1" }}>
                  <ArrowDownCircle size={36} strokeWidth={1} />
                  <p className="text-sm font-medium">No transactions yet</p>
                </div>
              ) : (
                <div>
                  {txnData?.transactions.map((txn, idx) => (
                    <div key={txn.transaction_id}>
                      <TransactionRow txn={txn} />
                      {idx < (txnData.transactions.length - 1) && (
                        <div style={{ height: 1, background: "#F1F5FB", marginLeft: 72, marginRight: 20 }} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {!loadingTxns && txnData && txnData.total > TXN_PAGE_SIZE && (
              <div className="px-5 py-3" style={{ borderTop: "1px solid #F1F5FB" }}>
                <PaginationControls
                  currentPage={txnPage}
                  totalPages={totalPages}
                  hasPrevious={txnPage > 1}
                  hasNext={txnPage < totalPages}
                  onPageChange={setTxnPage}
                  className="mt-0"
                />
              </div>
            )}

            <Link href="/history">
              <div
                className="flex items-center justify-center gap-1.5 py-3.5 text-sm font-semibold transition-colors cursor-pointer"
                style={{ borderTop: "1px solid #F1F5FB", color: "#004C8F" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "#F7FAFF"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
              >
                View All Activity <ChevronRight size={14} />
              </div>
            </Link>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            <PeriodSummary summary={summary} loading={loadingSummary} />
            <QuickActions />
          </div>
        </div>
      </div>
    </div>
  );
}