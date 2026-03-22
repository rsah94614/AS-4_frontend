"use client";

import Navbar from "@/components/layout/Navbar";
import ProtectedRoute from "@/components/features/auth/ProtectedRoute";
import PageTransition from "@/components/layout/PageTransition";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen overflow-hidden bg-[#F0F4F8]">
        {/* Top Navigation Bar */}
        <Navbar />

        {/* Main Content Area */}
        <main className="flex-1 min-h-0 overflow-auto">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </ProtectedRoute>
  );
}
