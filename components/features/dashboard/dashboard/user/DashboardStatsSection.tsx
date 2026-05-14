"use client"

import { LayoutGrid, Users, Trophy, TrendingUp, X, Building2 } from "lucide-react"
import DashboardCard from "@/components/features/dashboard/dashboard/user/DashboardCard"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { PlatformStatsResponse } from "@/types/dashboard-types"
import { fetchDashboardPlatformStats } from "@/services/analytics-service"
import { employeeService } from "@/services/employee-service"
import { requireAuthenticatedUserId } from "@/lib/api-utils"
import type { Employee } from "@/services/employee-service"

const CARDS = [
    { label: "Total Points",     icon: Users,      key: "total_points"     as const, href: "/wallet" },
    { label: "Rewards Redeemed", icon: Trophy,     key: "rewards_redeemed" as const, href: "/redeem" },
    { label: "Reviews Received", icon: LayoutGrid, key: "reviews_received" as const, href: "/review" },
]

// ── Dept Group Modal ──────────────────────────────────────────────────────────
function DeptGroupModal({
    employees,
    onClose,
}: {
    employees: Employee[]
    onClose: () => void
}) {
    // Group by department_name
    const grouped = employees.reduce<Record<string, Employee[]>>((acc, e) => {
        const key = e.department_name ?? "Unknown"
        acc[key] = [...(acc[key] ?? []), e]
        return acc
    }, {})

    function getInitials(name: string) {
        return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()
    }

    return (
        <div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <Building2 size={18} className="text-[#004C8F]" />
                        <h2 className="text-[15px] font-bold text-[#004C8F]">
                            Your Department Group
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto flex-1 px-6 py-4 space-y-5">
                    {Object.entries(grouped).sort().map(([dept, members]) => (
                        <div key={dept}>
                            {/* Dept header */}
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-extrabold text-[#004C8F] uppercase tracking-widest">
                                    {dept}
                                </span>
                                <span className="text-[11px] font-bold bg-[#004C8F]/10 text-[#004C8F] px-2 py-0.5 rounded-full">
                                    {members.length}
                                </span>
                            </div>
                            {/* Member list */}
                            <div className="space-y-2">
                                {members.map((m) => (
                                    <div
                                        key={m.employee_id}
                                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-[#004C8F] flex items-center justify-center text-[11px] font-bold text-white shrink-0">
                                            {getInitials(`${m.first_name} ${m.last_name}`)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[13px] font-semibold text-gray-900 truncate">
                                                {m.first_name} {m.last_name}
                                            </p>
                                            <p className="text-[11px] text-gray-500 truncate">
                                                {m.designation_name ?? m.username}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
                    <p className="text-[11px] text-gray-500 text-center">
                        {employees.length} colleagues across {Object.keys(grouped).length} departments
                    </p>
                </div>
            </div>
        </div>
    )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function DashboardStatsSection() {
    const [data, setData] = useState<PlatformStatsResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [deptGroupEmployees, setDeptGroupEmployees] = useState<Employee[]>([])
    const [showModal, setShowModal] = useState(false)
    const router = useRouter()

    useEffect(() => {
        async function load() {
            setLoading(true)
            try {
                const myId = requireAuthenticatedUserId()

                const [statsResult, myDetail] = await Promise.all([
                    fetchDashboardPlatformStats(),
                    employeeService.getEmployee(myId),
                ])
                setData(statsResult)

                const myDeptTypeId = myDetail.department?.department_type_id ?? null
                if (myDeptTypeId) {
                    const res = await employeeService.listEmployees({
                        department_type_id: myDeptTypeId,
                        limit: 100,
                        is_active: true,
                    })
                    setDeptGroupEmployees(res.data.filter((e) => e.employee_id !== myId))
                }
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {CARDS.map((card) => (
                    <DashboardCard
                        key={card.label}
                        label={card.label}
                        stat={data?.[card.key]}
                        icon={card.icon}
                        loading={loading}
                        onClick={() => router.push(card.href)}
                    />
                ))}

                {/* Dept Group card */}
<DashboardCard
    label="My Dept Group"
    stat={loading ? undefined : {
        value: deptGroupEmployees.length,
        this_month: deptGroupEmployees.length,
        last_month: 0,
    }}
    icon={Building2}
    loading={loading}
    onClick={() => !loading && deptGroupEmployees.length > 0 && setShowModal(true)}
/>
            </div>

            {showModal && (
                <DeptGroupModal
                    employees={deptGroupEmployees}
                    onClose={() => setShowModal(false)}
                />
            )}
        </>
    )
}