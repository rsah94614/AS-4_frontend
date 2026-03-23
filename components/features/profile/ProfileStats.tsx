import { Award, Gift, Send } from "lucide-react";
import type { ProfileMetrics } from "@/types/profile-types";

interface ProfileStatsProps {
    metrics: ProfileMetrics;
}

export default function ProfileStats({ metrics }: ProfileStatsProps) {
    const stats = [
        {
            icon: <Award className="w-6 h-6 text-[#004C8F]" />,
            label: "Recognitions",
            value: metrics.recognitions_received,
            subtext: "Received",
            bg: "bg-[#EEF4FB]",
            border: "border-[#D8E6F7]"
        },
        {
            icon: <Send className="w-6 h-6 text-[#004C8F]" />,
            label: "Recognitions",
            value: metrics.recognitions_given,
            subtext: "Sent",
            bg: "bg-emerald-50",
            border: "border-emerald-100"
        },
        {
            icon: <Gift className="w-6 h-6 text-[#004C8F]" />,
            label: "Rewards",
            value: metrics.rewards_redeemed,
            subtext: "Redeemed",
            bg: "bg-[#FEF2F2]",
            border: "border-[#FECACA]"
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-8 border-b border-border">
            {stats.map((stat, i) => (
                <div key={i} className="flex items-center gap-4 bg-white border border-border rounded-2xl p-5 shadow-xs transition-shadow hover:shadow-md group">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center border ${stat.bg} ${stat.border} group-hover:scale-110 transition-transform duration-300`}>
                        {stat.icon}
                    </div>
                    <div>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl font-extrabold text-foreground tracking-tight">{stat.value}</span>
                        </div>
                        <p className="text-sm font-semibold text-foreground mt-0.5">{stat.label}</p>
                        <p className="text-xs font-medium text-muted-foreground mt-0.5">{stat.subtext}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
