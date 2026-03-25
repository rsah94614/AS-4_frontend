// components/ProtectedRoute.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'
import { auth } from '@/services/auth-service'
import { routePermissionsApi } from '@/services/roles-service'
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react'
import Link from 'next/link'

const WRITE_METHODS = ['POST:', 'PUT:', 'PATCH:', 'DELETE:'];

// Control panel layout check — user qualifies if they have ANY write
// permission under any control panel section.
const CONTROL_PANEL_WRITE_PREFIXES = [
    '/v1/organizations/departments',
    '/v1/organizations/designations',
    '/v1/organizations/statuses',
    '/v1/employees',
    '/v1/rewards/catalog',
    '/v1/rewards/categories',
    '/v1/recognitions/review-categories',
    '/v1/recognitions/reviews',
    '/v1/roles',
];

/**
 * Self-service routes that every authenticated employee has by default.
 * Even though some of these paths share a prefix with control-panel routes
 * (e.g. PUT:/v1/employees/notifications/… starts with /v1/employees),
 * they must NEVER grant control-panel access.
 *
 * Add new self-service routes here whenever they are introduced so that
 * the permission gate stays accurate without backend changes.
 */
const SELF_SERVICE_ROUTES = new Set([
    // Auth
    'POST:/v1/auth/logout',
    'POST:/v1/auth/signup',
    'POST:/v1/auth/bulk-import',

    // Employee self-service — notifications
    'PUT:/v1/employees/notifications/read-all',
    'PUT:/v1/employees/notifications/{notification_id}/read',

    // Peer-review submission (not admin management)
    'POST:/v1/recognitions/reviews',
    'PUT:/v1/recognitions/reviews/{id}',

    // Reward redemption
    'POST:/v1/rewards/redeem',
]);

interface ProtectedRouteProps {
    children: React.ReactNode
    redirectTo?: string
    /**
     * Enables the permission gate.
     * Without this, only basic auth is checked.
     */
    adminOnly?: boolean
    /**
     * Path prefix for this specific control panel page.
     * Access is granted if the user has at least one WRITE permission
     * (POST/PUT/PATCH/DELETE) whose path starts with this prefix.
     *
     * Exception — pass readOnlyAccess=true for pages like Audit Logs
     * that have no write routes (GET permission is then sufficient).
     *
     *   Page               pathPrefix                         readOnlyAccess
     *   ─────────────────  ─────────────────────────────────  ──────────────
     *   Audit Logs         /v1/organizations/audit-logs       true
     *   Departments        /v1/organizations/departments      false
     *   Designations       /v1/organizations/designations     false
     *   Statuses           /v1/organizations/statuses         false
     *   Employees          /v1/employees                      false
     *   Rewards            /v1/rewards/catalog                false
     *   Reward Categories  /v1/rewards/categories             false
     *   Reviews            /v1/recognitions/reviews           false
     *   Review Categories  /v1/recognitions/review-categories false
     *   Roles              /v1/roles                          false
     *
     * When pathPrefix is omitted with adminOnly=true, checks for ANY
     * write permission across all control panel sections (layout use).
     *
     * SUPER_ADMIN always bypasses all checks.
     */
    adminOnlyKey?: string
    pathPrefix?: string
    readOnlyAccess?: boolean
}

export default function ProtectedRoute({
    children,
    redirectTo = '/login',
    adminOnly = false,
    pathPrefix,
    readOnlyAccess = false,
}: ProtectedRouteProps) {
    const router = useRouter()
    const [isChecking, setIsChecking] = useState(true)
    const [isAuthorized, setIsAuthorized] = useState(false)

    useEffect(() => {
        const checkAuth = async () => {
            // ── 1. Auth check ─────────────────────────────────────────────
            let authed = false
            if (auth.isAuthenticated()) {
                authed = true
            } else if (auth.getRefreshToken()) {
                const refreshed = await auth.refreshAccessToken()
                if (refreshed) authed = true
            }

            if (!authed) {
                router.push(redirectTo)
                return
            }

            if (!adminOnly) {
                setIsAuthorized(true)
                setIsChecking(false)
                return
            }

            // ── 2. SUPER_ADMIN bypasses everything ────────────────────────
            const user = auth.getUser()
            const roles: string[] = user?.roles ?? []
            if (roles.includes('SUPER_ADMIN')) {
                setIsAuthorized(true)
                setIsChecking(false)
                return
            }

            // ── 3. Permission check ───────────────────────────────────────
            try {
                const allKeys: string[] = await routePermissionsApi.getMyPermissions()

                // Strip self-service routes before any admin check.
                // This prevents employee-role routes (e.g. PUT:/v1/employees/notifications/…)
                // from falsely matching admin path prefixes (e.g. /v1/employees).
                const adminKeys = allKeys.filter(k => !SELF_SERVICE_ROUTES.has(k))

                let hasAccess = false

                if (pathPrefix) {
                    if (readOnlyAccess) {
                        // Audit Logs — any GET on this prefix is enough
                        hasAccess = adminKeys.some(k =>
                            k.startsWith('GET:') &&
                            k.slice(k.indexOf(':') + 1).startsWith(pathPrefix)
                        )
                    } else {
                        // All other pages — must have a write permission
                        hasAccess = adminKeys.some(k =>
                            WRITE_METHODS.some(m => k.startsWith(m)) &&
                            k.slice(k.indexOf(':') + 1).startsWith(pathPrefix)
                        )
                    }
                } else {
                    // Layout check — can the user access ANY control panel section?
                    hasAccess = adminKeys.some(k =>
                        WRITE_METHODS.some(m => k.startsWith(m)) &&
                        CONTROL_PANEL_WRITE_PREFIXES.some(prefix =>
                            k.slice(k.indexOf(':') + 1).startsWith(prefix)
                        )
                    )
                    // Also allow Audit Log-only users (read-only admins)
                    if (!hasAccess) {
                        hasAccess = adminKeys.some(k =>
                            k.startsWith('GET:') &&
                            k.slice(k.indexOf(':') + 1).startsWith('/v1/organizations/audit-logs')
                        )
                    }
                }

                setIsAuthorized(hasAccess)
            } catch {
                setIsAuthorized(false)
            } finally {
                setIsChecking(false)
            }
        }

        checkAuth()
    }, [router, redirectTo, adminOnly, pathPrefix, readOnlyAccess])

    // ── Loading skeleton ──────────────────────────────────────────────────────
    if (isChecking) {
        return (
            <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#eef0f8" }}>
                <div className="flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden">
                    <div className="h-14 bg-white border-b border-gray-200 px-6 flex items-center gap-4 shrink-0">
                        <Skeleton className="h-7 w-7 rounded-lg" />
                        <Skeleton className="h-5 w-28" />
                        <div className="ml-auto flex items-center gap-3">
                            <Skeleton className="h-7 w-7 rounded-full" />
                            <Skeleton className="h-8 w-28 rounded-lg" />
                            <Skeleton className="h-7 w-7 rounded-lg" />
                        </div>
                    </div>
                    <div className="flex-1 min-h-0 overflow-auto">
                        <div className="bg-white mx-auto shadow-[0_10px_50px_rgba(0,0,0,0.04)] min-h-screen">
                            <div className="px-8 md:px-10 py-6 border-b border-gray-100">
                                <Skeleton className="h-6 w-48 mb-2" />
                                <Skeleton className="h-3.5 w-72" />
                            </div>
                            <div className="px-8 md:px-10 py-8 space-y-6">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-10 w-64 rounded-xl" />
                                    <Skeleton className="h-8 w-20 rounded-lg" />
                                    <Skeleton className="h-8 w-20 rounded-lg" />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {Array.from({ length: 8 }).map((_, i) => (
                                        <Skeleton key={i} className="h-40 rounded-xl" />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // ── Access denied ─────────────────────────────────────────────────────────
    if (adminOnly && !isAuthorized) {
        return (
            <div className="min-h-screen w-full bg-[#f8fafc] flex items-center justify-center p-6">
                <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
                    <div className="relative inline-block">
                        <div className="absolute inset-0 bg-red-100 rounded-full blur-2xl opacity-50" />
                        <div className="relative w-24 h-24 bg-white rounded-3xl shadow-xl border border-red-50 flex items-center justify-center mx-auto">
                            <ShieldAlert size={48} className="text-[#E31837]" strokeWidth={1.5} />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-[#004C8F] tracking-tight mb-2">
                            Access Restricted
                        </h1>
                        <p className="text-gray-500 text-sm leading-relaxed px-4">
                            You don&apos;t have permission to view this section.
                            Please contact your HR manager if you believe this is an error.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
                        <button
                            onClick={() => router.back()}
                            className="px-6 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            <ArrowLeft size={16} />
                            Go Back
                        </button>
                        <Link
                            href="/dashboard"
                            className="px-6 py-2.5 rounded-xl bg-[#004C8F] text-white text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md active:scale-95 no-underline"
                        >
                            <Home size={16} />
                            Dashboard
                        </Link>
                    </div>
                    <p className="text-[11px] text-gray-400 font-medium pt-8 uppercase tracking-[0.2em]">
                        Aabhar • Security Portal
                    </p>
                </div>
            </div>
        )
    }

    return <>{children}</>
}