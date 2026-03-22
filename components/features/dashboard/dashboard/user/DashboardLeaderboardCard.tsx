
interface DashboardLeaderboardCardProps {
    rank: number;
    name: string;
    initials: string;
    points: number;
    // color: string;
    image?: string | null;
}

export default function DashboardLeaderboardCard({
    rank,
    name,
    points,
}: DashboardLeaderboardCardProps) {
    return (
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 transition-colors group">
            <span className="w-5 text-right text-xs text-gray-400 font-semibold shrink-0 tabular-nums">
                {rank}
            </span>

            <span className="flex-1 text-sm font-medium text-gray-700 truncate group-hover:text-gray-900 transition-colors">
                {name}
            </span>
            <span className="text-xs font-bold text-gray-500 tabular-nums shrink-0">
                {points.toLocaleString()}
            </span>
        </div>
    );
}
