"use client";

import { useAuth } from "@/providers/AuthProvider";
import ProtectedRoute from "@/components/features/auth/ProtectedRoute";
import ProfileSkeleton from "@/components/features/profile/ProfileSkeleton";
import ProfileHeader from "@/components/features/profile/ProfileHeader";
import ProfileStats from "@/components/features/profile/ProfileStats";
import ProfileSections from "@/components/features/profile/ProfileSections";
import { Button } from "@/components/ui/button";
import { useProfileData } from "@/hooks/useProfileData";

const PAGE_WRAPPER =
    "flex-1 w-full min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_45%,#ffffff_100%)] mx-auto shadow-[0_10px_50px_rgba(15,23,42,0.05)]";
const PAGE_HEADER = "border-b border-gray-100 px-6 md:px-10 py-6";
const PAGE_HEADER_INNER = "flex items-start justify-between gap-4";
const PAGE_CONTENT = "px-6 md:px-10 py-8 md:py-10";
const HDFC_RED = "#E31837";
const HDFC_BLUE = "#004C8F";

export default function ProfilePage() {
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const { profile, metrics, activities, loading, error, retry } = useProfileData(
        !authLoading && isAuthenticated ? user?.employee_id : undefined
    );

    return (
        <ProtectedRoute>
            <div className={PAGE_WRAPPER}>
                <div className={PAGE_HEADER}>
                    <div className={PAGE_HEADER_INNER}>
                        <div>
                            <h1 className="text-2xl font-bold leading-tight" style={{ color: HDFC_BLUE }}>
                                My Profile
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                View your personal information and activity
                            </p>
                        </div>
                        <span className="hidden select-none items-center text-xl font-black tracking-tight md:flex">
                            <span style={{ color: HDFC_RED }}>A</span>
                            <span style={{ color: HDFC_BLUE }}>abhar</span>
                        </span>
                    </div>
                </div>

                <div className={PAGE_CONTENT}>
                    {(authLoading || loading) && <ProfileSkeleton />}

                    {!authLoading && !loading && error && (
                        <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-2xl border border-border bg-white p-8 shadow-sm">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                                <span className="text-2xl font-bold text-destructive">!</span>
                            </div>
                            <h3 className="mb-2 text-lg font-bold text-foreground">Failed to load profile</h3>
                            <p className="max-w-sm text-center text-sm text-muted-foreground">{error}</p>
                            <Button
                                onClick={() => void retry()}
                                className="mt-6 text-white shadow-sm"
                                style={{ background: HDFC_BLUE }}
                            >
                                Try Again
                            </Button>
                        </div>
                    )}

                    {!authLoading && !loading && !error && profile && (
                        <div className="animate-in space-y-6 fade-in slide-in-from-bottom-4 duration-500 md:space-y-8">
                            <div className="rounded-2xl border border-border bg-white shadow-sm">
                                <div className="p-6 sm:p-8 md:p-10">
                                    <ProfileHeader profile={profile} />
                                    <ProfileStats metrics={metrics} />
                                    <ProfileSections profile={profile} activities={activities} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
