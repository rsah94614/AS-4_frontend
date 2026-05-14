import type { HistoryItem, PeriodFilter, TypeFilter } from "../types/history-types";

function normalizeFilterValue(value?: string | null): string {
    return value?.trim().toLowerCase() ?? "";
}

/** Returns true if the item matches the chosen period filter */
export function matchesPeriod(item: HistoryItem, period: PeriodFilter): boolean {
    if (period === "All History") return true;
    if (period === "Redeem History") return !!item.reward_catalog;
    if (period === "Points History") return !item.reward_catalog;
    return true;
}

export function getHistoryCategoryValue(item: HistoryItem): string | null {
    const categoryCode = item.reward_catalog?.category_code?.trim();
    if (categoryCode) {
        return categoryCode;
    }

    const categoryName = item.reward_catalog?.category_name?.trim();
    if (categoryName) {
        return categoryName;
    }

    return null;
}

export function getHistoryCategoryLabel(item: HistoryItem): string | null {
    const categoryName = item.reward_catalog?.category_name?.trim();
    if (categoryName) {
        return categoryName;
    }

    const categoryCode = item.reward_catalog?.category_code?.trim();
    if (categoryCode) {
        return categoryCode;
    }

    return null;
}

/** Returns true if the item matches the chosen transaction-type filter */
export function matchesType(item: HistoryItem, type: TypeFilter): boolean {
    if (type === "All") return true;
    return normalizeFilterValue(getHistoryCategoryValue(item)) === normalizeFilterValue(type);
}

/** Derives a human-readable message for a history row */
export function getMessage(item: HistoryItem): string {
    if (item.reward_catalog) {
        return `You redeemed "${item.reward_catalog.reward_name}"`;
    }
    // Check reviewer first (review-based credits)
    if (item.reviewer) {
        const name = [item.reviewer.first_name, item.reviewer.last_name]
            .filter(Boolean).join(" ");
        return `${name || item.reviewer.username} recognized you`;
    }
    // Fall back to granted_by (admin manual credits)
    const granter = item.employees_reward_history_granted_byToemployees;
    if (granter) {
        const name = [granter.first_name, granter.last_name].filter(Boolean).join(" ");
        return `${name || granter.username} recognized you`;
    }
    return "Points awarded";
}


export const PAGE_SIZE = 10;

export const periodOptions: PeriodFilter[] = [
    "All History",
    "Points History",
    "Redeem History",
];
