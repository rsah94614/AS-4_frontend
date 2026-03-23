"use client";

import { useEffect, useState } from "react";
import { AlertCircle, BarChart3, CheckCheck, Megaphone, RefreshCw } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { getRolesFromToken } from "@/lib/role-utils";
import { AnnouncementPanel } from "@/components/features/notifications/AnnouncementPanel";
import { DigestPanel } from "@/components/features/notifications/DigestPanel";
import { NotificationList } from "@/components/features/notifications/NotificationList";
import { AdminPanel } from "@/components/features/notifications/notifications-shared";

type UserRole = "SUPER_ADMIN" | "HR_ADMIN" | "MANAGER" | "EMPLOYEE" | "ADMIN";

const CAN_POST_ANNOUNCEMENT: UserRole[] = ["SUPER_ADMIN", "HR_ADMIN", "ADMIN"];
const CAN_GET_DIGEST: UserRole[] = ["SUPER_ADMIN", "HR_ADMIN", "MANAGER", "ADMIN"];
const CAN_POST_DIGEST: UserRole[] = ["SUPER_ADMIN", "HR_ADMIN", "ADMIN"];

export default function NotificationsPage() {
    const { notifications, unreadCount, loading, error, markOne, markAll, reload } =
        useNotifications(100);

    const [roles, setRoles] = useState<UserRole[]>([]);
    const [mounted, setMounted] = useState(false);
    const [canViewDigest, setCanViewDigest] = useState(false);

    useEffect(() => {
        const currentRoles = getRolesFromToken() as UserRole[];
        setRoles(currentRoles);

        const hasRoleAccess = CAN_GET_DIGEST.some((r) => currentRoles.includes(r as UserRole));
        if (hasRoleAccess) {
            setCanViewDigest(true);
            setMounted(true);
            return;
        }

        async function verifyManagerAccess() {
            try {
                const { auth } = await import("@/services/auth-service");
                const { employeeService } = await import("@/services/employee-service");
                const user = auth.getUser();
                if (user?.employee_id) {
                    const detail = await employeeService.getEmployee(user.employee_id);
                    // Grant access if they have a manager_id (are in a team) OR if they are a manager themselves
                    if (detail.manager?.employee_id) {
                        setCanViewDigest(true);
                    } else {
                        const directReports = await employeeService.listEmployees({ manager_id: user.employee_id, limit: 1, is_active: true });
                        if (directReports.data && directReports.data.length > 0) {
                            setCanViewDigest(true);
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to verify manager digest access:", error);
            } finally {
                setMounted(true);
            }
        }

        verifyManagerAccess();
    }, []);

    const canAnnounce = CAN_POST_ANNOUNCEMENT.some((role) => roles.includes(role));
    const canSendDigest = CAN_POST_DIGEST.some((role) => roles.includes(role));
    const showAdminArea = mounted && (canAnnounce || canViewDigest);
    const hasUnread = unreadCount > 0;

    return (
        <div className="flex-1 min-h-[calc(100vh-4rem)] w-full overflow-hidden bg-white transition-all md:min-h-[calc(100vh-5rem)]">
            <div className="border-b border-border bg-white px-4 py-5 sm:px-6 md:px-10">
                <div className="mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-[20px] font-bold leading-tight text-primary">
                            Notifications
                        </h1>
                        <p className="mt-0.5 text-[14px] text-muted-foreground">
                            Stay updated with alerts and upcoming announcements
                        </p>
                    </div>
                    <span className="hidden shrink-0 select-none items-center text-xl font-black tracking-tight lg:flex">
                        <span className="text-destructive">A</span>
                        <span className="text-primary">abhar</span>
                    </span>
                </div>
            </div>

            <div className="mx-auto w-full px-4 py-6 align-top sm:px-6 sm:py-8 md:px-10">
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-[10.5px] font-bold uppercase tracking-widest text-muted-foreground">
                            Inbox Actions
                        </p>
                    </div>
                    <div className="flex items-center justify-between gap-2 sm:justify-end">
                        <button
                            onClick={reload}
                            className="rounded-sm p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                            title="Refresh"
                            aria-label="Refresh notifications"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </button>
                        <button
                            onClick={markAll}
                            disabled={!hasUnread || loading}
                            className={`flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-sm px-3.5 py-2 text-[13px] font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none ${hasUnread ? "bg-primary" : "bg-slate-400"}`}
                        >
                            <CheckCheck className="h-4 w-4" />
                            Mark all read
                        </button>
                    </div>
                </div>

                {error && (
                    <div
                        className="mb-4 flex items-start gap-2 rounded-sm px-4 py-3 text-[13px]"
                        style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#991B1B" }}
                    >
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        {error}
                    </div>
                )}

                {showAdminArea && (
                    <div className="mb-6">
                        <p className="mb-3 text-[10.5px] font-bold uppercase tracking-widest text-muted-foreground">
                            Admin Controls
                        </p>

                        {canAnnounce && (
                            <AdminPanel
                                label="Send Announcement"
                                icon={<Megaphone className="h-4 w-4" />}
                                accentColorStr="#004C8F"
                                accentClassStr="text-primary"
                            >
                                <AnnouncementPanel onDone={reload} />
                            </AdminPanel>
                        )}

                        {canViewDigest && (
                            <AdminPanel
                                label="Recognition Digest"
                                icon={<BarChart3 className="h-4 w-4" />}
                                accentColorStr="#004C8F"
                                accentClassStr="text-primary"
                            >
                                <DigestPanel canSend={canSendDigest} />
                            </AdminPanel>
                        )}
                    </div>
                )}

                <NotificationList
                    notifications={notifications}
                    unreadCount={unreadCount}
                    loading={loading}
                    onMarkRead={markOne}
                />
            </div>
        </div>
    );
}
