import { User, Mail, Calendar, Briefcase, Building2, UserCircle, Tag, Award, Gift, Clock, Trophy, Target, Send } from "lucide-react";
import type { EmployeeDetail, ProfileActivityItem } from "@/types/profile-types";
import { useEffect, useState, type ReactNode } from "react";
import { fetchDashboardLeaderboard } from "@/services/analytics-service";

interface ProfileSectionsProps {
    profile: EmployeeDetail;
    activities: ProfileActivityItem[];
}

function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const diffMs = Date.now() - date.getTime();
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diffMs < hour) {
        const minutes = Math.max(1, Math.floor(diffMs / minute));
        return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
    }

    if (diffMs < day) {
        const hours = Math.max(1, Math.floor(diffMs / hour));
        return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    }

    const days = Math.max(1, Math.floor(diffMs / day));
    return `${days} day${days === 1 ? "" : "s"} ago`;
}

function getActivityAppearance(activity: ProfileActivityItem) {
    if (activity.type === "reward_redeemed") {
        return {
            icon: <Gift className="h-4 w-4" />,
            iconColor: "text-[#004C8F]",
            iconBg: "bg-[#EEF4FB]",
        };
    }

    if (activity.type === "recognition_sent") {
        return {
            icon: <Send className="h-4 w-4" />,
            iconColor: "text-[#004C8F]",
            iconBg: "bg-[#EEF4FB]",
        };
    }

    return {
        icon: <Award className="h-4 w-4" />,
        iconColor: "text-[#004C8F]",
        iconBg: "bg-[#EEF4FB]",
    };
}

export default function ProfileSections({ profile, activities }: ProfileSectionsProps) {
    const [rank, setRank] = useState<number | null>(null);

    useEffect(() => {
        async function loadRank() {
            try {
                const leaderboard = await fetchDashboardLeaderboard();
                if (leaderboard) {
                    const myEntry = leaderboard.find((entry) => entry.employee_id === profile.employee_id);
                    if (myEntry) setRank(myEntry.rank);
                }
            } catch (error) {
                console.error("Failed to load leaderboard rank:", error);
            }
        }

        if (profile?.employee_id) loadRank();
    }, [profile?.employee_id]);

    return (
        <div className="grid grid-cols-1 gap-6 pt-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-1">
                <section className="group relative overflow-hidden rounded-2xl border border-border bg-white p-6 shadow-xs transition-all hover:border-[#004C8F]/20 hover:shadow-md">
                    <div className="absolute right-0 top-0 -mr-10 -mt-10 h-32 w-32 rounded-full bg-[#EEF4FB] opacity-50 blur-3xl transition-opacity group-hover:opacity-100" />

                    <h3 className="relative z-10 mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        <User className="h-4 w-4 text-[#004C8F]" />
                        Basic Information
                    </h3>

                    <div className="relative z-10 space-y-5">
                        <InfoRow icon={<User className="h-4 w-4" />} label="Username" value={profile.username} />
                        <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={profile.email} />
                        <InfoRow
                            icon={<Calendar className="h-4 w-4" />}
                            label="Joined"
                            value={new Date(profile.date_of_joining).toLocaleDateString("en-US", {
                                month: "long",
                                year: "numeric",
                                day: "numeric",
                            })}
                        />
                        <InfoRow
                            icon={<Tag className="h-4 w-4" />}
                            label="Status"
                            value={profile.status?.status_name || (profile.is_active ? "Active" : "Inactive")}
                        />
                    </div>
                </section>

                <section className="group relative overflow-hidden rounded-2xl border border-border bg-white p-6 shadow-xs transition-all hover:border-[#E31837]/20 hover:shadow-md">
                    <div className="absolute right-0 top-0 -mr-10 -mt-10 h-32 w-32 rounded-full bg-[#FEF2F2] opacity-50 blur-3xl transition-opacity group-hover:opacity-100" />

                    <h3 className="relative z-10 mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        <Building2 className="h-4 w-4 text-[#004C8F]" />
                        Organization
                    </h3>

                    <div className="relative z-10 space-y-5">
                        <InfoRow
                            icon={<Briefcase className="h-4 w-4" />}
                            label="Designation"
                            value={profile.designation ? profile.designation.designation_name : "-"}
                            subValue={
                                profile.designation
                                    ? `Level ${profile.designation.level} - Code: ${profile.designation.designation_code}`
                                    : undefined
                            }
                        />
                        <InfoRow
                            icon={<Building2 className="h-4 w-4" />}
                            label="Department"
                            value={profile.department ? profile.department.department_name : "-"}
                            subValue={profile.department?.department_type?.type_name}
                        />
                        <InfoRow
                            icon={<UserCircle className="h-4 w-4" />}
                            label="Reporting Manager"
                            value={profile.manager ? profile.manager.username : "-"}
                            subValue={profile.manager?.email}
                        />
                    </div>
                </section>
            </div>

            <div className="space-y-6 lg:col-span-2">
                <section className="group relative overflow-hidden rounded-2xl border border-[#004C8F]/20 bg-gradient-to-br from-[#003A70] via-[#004C8F] to-[#1D6EC5] p-6 text-white shadow-sm transition-all hover:shadow-md sm:p-8">
                    <div className="absolute right-0 top-0 p-4 text-white opacity-10 transition-transform duration-500 group-hover:scale-110">
                        <Trophy className="-mr-16 -mt-16 h-56 w-56 rotate-12 transform" />
                    </div>

                    <h3 className="relative z-10 mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/80">
                        <Trophy className="h-4 w-4 text-white/80" />
                        Leaderboard Status
                    </h3>

                    <div className="relative z-10 flex flex-col justify-between gap-8 rounded-2xl border border-white/20 bg-white/10 p-6 shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-md md:flex-row md:items-end">
                        <div>
                            <p className="mb-1 text-sm font-medium tracking-wide text-white/70">Current Rank</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-6xl font-extrabold tracking-tight text-white drop-shadow-sm">
                                    {rank !== null ? `#${rank}` : "-"}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-8 pb-1">
                            <div className="flex flex-col gap-1">
                                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/60">
                                    <Target className="h-3.5 w-3.5 text-[#93C5FD]" /> Total Points
                                </p>
                                <p className="text-2xl font-bold text-white drop-shadow-sm">
                                    {profile.wallet?.total_earned_points?.toLocaleString() ?? 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="rounded-2xl border border-border bg-white p-6 shadow-xs">
                    <h3 className="mb-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        <Clock className="h-4 w-4 text-[#004C8F]" />
                        Recent Activity
                    </h3>

                    {activities.length > 0 ? (
                        <div className="space-y-4">
                            {activities.map((activity, index) => {
                                const appearance = getActivityAppearance(activity);

                                return (
                                    <ActivityRow
                                        key={activity.id}
                                        icon={appearance.icon}
                                        iconColor={appearance.iconColor}
                                        iconBg={appearance.iconBg}
                                        title={activity.title}
                                        time={formatRelativeTime(activity.occurred_at)}
                                        desc={activity.description}
                                        isLast={index === activities.length - 1}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-border bg-slate-50/70 px-5 py-8 text-center">
                            <p className="text-sm font-semibold text-slate-700">No recent activity yet</p>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Your recognitions and reward redemptions will appear here.
                            </p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

// Helpers

function InfoRow({
    icon,
    label,
    value,
    subValue,
}: {
    icon: ReactNode;
    label: string;
    value: string;
    subValue?: string;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <div className="opacity-70">{icon}</div>
                <span>{label}</span>
            </div>
            <div className="pl-6">
                <p className="break-words text-sm font-medium text-foreground">{value}</p>
                {subValue && <p className="mt-1 text-xs text-muted-foreground">{subValue}</p>}
            </div>
        </div>
    );
}

function ActivityRow({
    icon,
    iconColor,
    iconBg,
    title,
    time,
    desc,
    isLast = false,
}: {
    icon: ReactNode;
    iconColor: string;
    iconBg: string;
    title: string;
    time: string;
    desc: ReactNode;
    isLast?: boolean;
}) {
    return (
        <div className="relative flex items-start gap-4">
            {!isLast && <div className="absolute bottom-[-24px] left-[19px] top-10 w-px bg-border" />}
            <div
                className={`z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white shadow-sm ring-4 ring-[#F5F8FC] ${iconBg} ${iconColor}`}
            >
                {icon}
            </div>
            <div className="flex-1 pb-6">
                <div className="mb-1.5 flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                    <h4 className="text-sm font-semibold tracking-tight text-foreground">{title}</h4>
                    <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        {time}
                    </span>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
            </div>
        </div>
    );
}
