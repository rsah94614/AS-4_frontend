

export function formatNumber(n: number | null): string {
    if (n === null) return "—";
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toLocaleString();
}

export function getGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
}

export function formatMonthComparison(
    thisMonth: number | null,
    lastMonth: number | null
): string {
    if (thisMonth === null || lastMonth === null) return "—";
    if (lastMonth === 0) {
        return thisMonth > 0 ? "+100%" : "0%";
    }
    const pct = ((thisMonth - lastMonth) / lastMonth) * 100;
    const sign = pct >= 0 ? "+" : "";
    return `${sign}${pct.toFixed(0)}%`;
}


export function userInitials(username: string): string {
    const parts = username.split(/[._\s-]+/);
    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return username.slice(0, 2).toUpperCase();
}

export function formatTime(iso: string): string {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60_000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
}

export function formatDisplayName(username?: string | null, email?: string | null): string {
    if (!username) return "User";
    
    // Check if username is a UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    let base = username;
    if (uuidRegex.test(username)) {
        base = email ? email.split('@')[0] : "Employee";
    }
    
    // Capitalize and replace dots/underscores with spaces (e.g., john.doe -> John Doe)
    return base
        .replace(/[._-]/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());
}