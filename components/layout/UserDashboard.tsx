import DashboardHeroSection from "../features/dashboard/dashboard/user/DashboardHeroSection";
import DashboardLeaderboardSection from "../features/dashboard/dashboard/user/DashboardLeaderboardSection";
import DashboardRecognitionSection from "../features/dashboard/dashboard/user/DashboardRecognitionSection";
import DashboardStatsSection from "../features/dashboard/dashboard/user/DashboardStatsSection";



export default function UserDashboard() {
    return (
        <div className="flex-1 w-full min-h-screen bg-white shadow-[0_10px_50px_rgba(0,0,0,0.04)]">
            <div className="space-y-6 ">
                {/* Hero greeting */}
                <DashboardHeroSection />
                {/* Stats */}
                <DashboardStatsSection />

                {/* Reviews + Leaderboard */}
                <div className="grid grid-cols-1 p-8 lg:grid-cols-5 gap-6">
                    <DashboardRecognitionSection />
                    <DashboardLeaderboardSection />
                </div>
            </div>
        </div>
    )
}