import type { Notification } from "@/types/notification-types";
import {
    EmptyState,
    formatRelativeTime,
    LoadingSkeleton,
    TypeBadge,
} from "@/components/features/notifications/notifications-shared";

function NotificationRow({
    notification,
    onMarkRead,
}: {
    notification: Notification;
    onMarkRead: (id: string) => void;
}) {
    const isUnread = !notification.is_read;

    return (
        <button
            onClick={() => isUnread && onMarkRead(notification.notification_id)}
            className={`group flex w-full items-start gap-4 px-5 py-4 text-left transition-all duration-150 ${isUnread ? "cursor-pointer bg-[#F8FAFF]" : "cursor-default bg-transparent"}`}
        >
            <span className="flex w-3 shrink-0 justify-center pt-[7px]">
                {isUnread && <span className="block h-2 w-2 rounded-full bg-primary" />}
            </span>

            <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <TypeBadge type={notification.type} />
                    <span className="ml-auto shrink-0 text-[11px] tabular-nums text-muted-foreground">
                        {formatRelativeTime(notification.created_at)}
                    </span>
                </div>
                <p
                    className={`text-[13px] leading-snug ${isUnread ? "font-semibold text-[#0D1B2A]" : "font-normal text-[#6B7280]"}`}
                >
                    {notification.title}
                </p>
                {notification.message && (
                    <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">
                        {notification.message}
                    </p>
                )}
            </div>
        </button>
    );
}

export function NotificationList({
    notifications,
    unreadCount,
    loading,
    onMarkRead,
}: {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    onMarkRead: (id: string) => void;
}) {
    return (
        <div className="overflow-hidden rounded-sm border border-border">
            <div
                className="flex items-center justify-between border-b px-5 py-3"
                style={{ borderColor: "#E5E7EB", background: "#FAFAFA" }}
            >
                <span className="text-[10.5px] font-bold uppercase tracking-widest text-muted-foreground">
                    {unreadCount > 0 ? `${unreadCount} Unread` : "All Notifications"}
                </span>
                {unreadCount > 0 && (
                    <span className="text-[11px] text-muted-foreground">
                        Click a notification to mark as read
                    </span>
                )}
            </div>

            {loading ? (
                <LoadingSkeleton />
            ) : notifications.length === 0 ? (
                <EmptyState />
            ) : (
                <div className="divide-y divide-slate-50">
                    {notifications.map((notification) => (
                        <NotificationRow
                            key={notification.notification_id}
                            notification={notification}
                            onMarkRead={onMarkRead}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
