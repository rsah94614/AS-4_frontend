import type { EmployeeDetail } from "@/types/profile-types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Mail, Briefcase } from "lucide-react";

import { formatDisplayName } from "@/lib/dashboard-utils";

interface ProfileHeaderProps {
    profile: EmployeeDetail;
}

export default function ProfileHeader({ profile }: ProfileHeaderProps) {
    const joinedDate = new Date(profile.date_of_joining).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
    });

    return (
        <div className="flex flex-col justify-between gap-6 border-b border-border pb-6 md:flex-row md:items-start">
            <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:gap-6 sm:text-left">
                <Avatar className="h-24 w-24 shrink-0 ring-4 ring-[#F0F4F8] shadow-xl sm:h-28 sm:w-28">
                    <AvatarFallback className="bg-gradient-to-br from-[#003A70] to-[#004C8F] text-3xl font-bold text-white sm:text-4xl">
                        {formatDisplayName(profile.username, profile.email).charAt(0)}
                    </AvatarFallback>
                </Avatar>

                <div className="space-y-4 sm:pt-2">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            {formatDisplayName(profile.username, profile.email)}
                        </h1>
                        <div className="mt-1.5 flex flex-col gap-2 text-sm font-medium text-muted-foreground sm:flex-row sm:items-center sm:gap-4">
                            <div className="flex items-center justify-center gap-1.5 sm:justify-start">
                                <Mail className="h-4 w-4 text-[#004C8F]" />
                                <span>{profile.email}</span>
                            </div>
                            <div className="hidden text-border sm:block">|</div>
                            <div className="flex items-center justify-center gap-1.5 sm:justify-start">
                                <Briefcase className="h-4 w-4 text-[#004C8F]" />
                                <span>{profile.designation?.designation_name || "Employee"}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1 sm:justify-start">
                        <Badge
                            variant={profile.is_active ? "default" : "destructive"}
                            className={`gap-1.5 rounded-md border px-2.5 py-0.5 ${
                                profile.is_active
                                    ? "border-(--chart-5)/20 bg-(--chart-5)/10 text-chart-5 hover:bg-(--chart-5)/20"
                                    : "border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/20"
                            }`}
                        >
                            <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                    profile.is_active ? "bg-chart-5" : "bg-destructive"
                                }`}
                            />
                            {profile.is_active ? "Active" : "Inactive"}
                        </Badge>

                        {profile.roles.map((role) => (
                            <Badge
                                key={role.role_id}
                                variant="secondary"
                                className="rounded-md border border-[#D8E6F7] bg-[#EEF4FB] px-2.5 py-0.5 text-[#004C8F] hover:bg-[#e4eefb]"
                            >
                                {role.role_name}
                            </Badge>
                        ))}
                    </div>

                    <div className="flex items-center justify-center gap-1.5 pt-1 text-xs font-medium text-muted-foreground sm:justify-start">
                        <CalendarDays className="h-3.5 w-3.5 text-[#004C8F]" />
                        <span>Member since {joinedDate}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
