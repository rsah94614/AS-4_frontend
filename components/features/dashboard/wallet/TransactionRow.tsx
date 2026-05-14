import { TrendingUp, Ticket } from "lucide-react";
import { Transaction } from "@/types/wallet-types";
import { formatDate, formatTime } from "@/lib/wallet-utils";

// Extracts a clean label from messy backend descriptions
function parseDescription(txn: Transaction): { title: string; subtitle?: string } {
  const desc = txn.description ?? "";
  const typeCode = txn.transaction_type.code ?? "";
  const typeName = txn.transaction_type.name ?? "";

  // "Points deducted for reward redemption <uuid>" → strip the UUID
  if (desc.toLowerCase().includes("reward redemption")) {
    return {
      title: "Reward Redeemed",
      subtitle: txn.reference_number
        ? `Ref: redemption:${txn.reference_number.replace("redemption:", "").slice(0, 8)}…`
        : undefined,
    };
  }

  // "Points credited from review <uuid>" → strip the UUID
  if (desc.toLowerCase().includes("review")) {
    return {
      title: "Performance Review Reward",
      subtitle: txn.reference_number
        ? `Review: ${txn.reference_number.slice(0, 8)}…`
        : undefined,
    };
  }

  // "REVIEW_CREDIT review → N pts" style
  if (typeCode === "REVIEW_CREDIT") {
    return { title: "Performance Review Reward" };
  }

  // "POINTS_REDEEMED"
  if (typeCode === "POINTS_REDEEMED") {
    return { title: "Reward Redeemed" };
  }

  // Clean up any trailing UUID from any description (fallback)
  const uuidPattern =
    /\s+[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
  const cleaned = desc.replace(uuidPattern, "").trim();

  return { title: cleaned || typeName };
}

// Maps real DB status codes → badge style
function StatusBadge({ code, name }: { code: string; name: string }) {
  const completed = ["TXN_COMPLETED", "SUCCESS", "COMPLETED"].includes(code);
  const failed = ["TXN_FAILED", "FAILED"].includes(code);
  const pending = ["TXN_PENDING", "TXN_PROCESSING", "PENDING", "PROCESSING"].includes(code);
  const reversed = ["TXN_REVERSED", "REVERSED"].includes(code);

  // Pick a friendly display label
  const label = completed
    ? "Completed"
    : failed
    ? "Failed"
    : pending
    ? "Pending"
    : reversed
    ? "Reversed"
    : name; // fallback to whatever the backend sends

  const cls = completed
    ? "bg-emerald-50 text-emerald-700"
    : failed
    ? "bg-red-50 text-red-600"
    : pending
    ? "bg-blue-50 text-blue-600"
    : reversed
    ? "bg-gray-100 text-gray-500"
    : "bg-amber-50 text-amber-700";

  return (
    <span
      className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-md mt-1.5 tracking-wider ${cls}`}
    >
      {label}
    </span>
  );
}

export function TransactionRow({ txn }: { txn: Transaction }) {
  const isCredit = txn.transaction_type.is_credit;
  const { title, subtitle } = parseDescription(txn);

  // For reference pill: prefer the clean part after "redemption:" prefix
  const refDisplay = txn.reference_number
    ? txn.reference_number.replace(/^redemption:/, "").slice(0, 12)
    : null;

  return (
    <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-white border border-gray-100 rounded-2xl p-5 group hover:border-indigo-100 hover:shadow-md hover:bg-indigo-50/30 transition-all duration-200 cursor-default">
      <div className="flex items-center gap-4 min-w-0">
        <div
          className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform ${
            isCredit ? "bg-emerald-100" : "bg-fuchsia-100"
          }`}
        >
          {isCredit ? (
            <TrendingUp size={20} className="text-emerald-600" />
          ) : (
            <Ticket size={20} className="text-fuchsia-600" />
          )}
        </div>

        <div className="min-w-0">
          {/* Clean title — no UUIDs */}
          <p className="text-base font-semibold text-gray-900 line-clamp-1 group-hover:text-indigo-900 transition-colors">
            {title}
          </p>

          <p className="text-xs text-gray-500 mt-1 font-medium flex items-center flex-wrap gap-1">
            <span>{formatDate(txn.transaction_at)}</span>
            <span className="mx-0.5">•</span>
            <span>{formatTime(txn.transaction_at)}</span>

            {/* Subtitle (e.g. short review/redemption ref) */}
            {subtitle && (
              <span className="text-gray-400 italic">{subtitle}</span>
            )}

            {/* Short reference pill */}
            {refDisplay && !subtitle && (
              <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-[10px] text-gray-400">
                #{refDisplay}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-gray-50 shrink-0 sm:ml-4">
        <p
          className={`text-lg font-bold tracking-tight ${
            isCredit ? "text-emerald-600" : "text-gray-900"
          }`}
        >
          {isCredit ? "+" : "-"}
          {txn.amount.toLocaleString()} pts
        </p>

        <StatusBadge code={txn.status.code} name={txn.status.name} />
      </div>
    </div>
  );
}