"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Trophy, Building2, UserRound, Users, Tags, Star,
    ShieldAlert, Loader2, Shield, ClipboardList,
    Activity, ArrowUpRight
} from 'lucide-react';
import { auth } from '@/services/auth-service';
import { PageHeader } from '@/components/shared/PageHeader';
import { routePermissionsApi } from '@/services/roles-service';

// ── Card definitions ──────────────────────────────────────────────────────────
//
// Each card is visible only if the user has at least one WRITE permission
// (POST / PUT / PATCH / DELETE) whose path starts with `pathPrefix`.
//
// Exception: Audit Logs has no write routes by design — it uses
// `readOnlyAccess: true` and checks for any GET permission instead.
//
// This naturally handles the Employee role problem:
//   Employee has GET:/v1/rewards/catalog  → read only → NO Rewards card
//   HR_ADMIN has POST:/v1/rewards/catalog → write     → YES Rewards card
// ─────────────────────────────────────────────────────────────────────────────

const categories = [
    {
        title: 'Audit Logs',
        description: 'Track and review all system activity and admin actions.',
        href: '/audit-logs',
        icon: ClipboardList,
        pathPrefix: '/v1/organizations/audit-logs',
        readOnlyAccess: true,   // no write routes exist — GET is enough
    },
    {
        title: 'Departments',
        description: 'Configure organisational department structures.',
        href: '/departments',
        icon: Building2,
        pathPrefix: '/v1/organizations/departments',
        readOnlyAccess: false,  // requires POST/PUT/PATCH/DELETE
    },
    {
        title: 'Designations',
        description: 'Manage employee job titles and hierarchy levels.',
        href: '/designations',
        icon: UserRound,
        pathPrefix: '/v1/organizations/designations',
        readOnlyAccess: false,
    },
    {
        title: 'Employees',
        description: 'View and manage staff profiles and access.',
        href: '/employees',
        icon: Users,
        pathPrefix: '/v1/employees',
        readOnlyAccess: false,
    },
    {
        title: 'Reward Categories',
        description: 'Organise rewards into logical groupings.',
        href: '/reward-categories',
        icon: Tags,
        pathPrefix: '/v1/rewards/categories',
        readOnlyAccess: false,
    },
    {
        title: 'Rewards',
        description: 'Manage individual reward items and point values.',
        href: '/rewards',
        icon: Trophy,
        pathPrefix: '/v1/rewards/catalog',
        readOnlyAccess: false,
    },
    {
        title: 'Review Categories',
        description: 'Manage review category tags and their point multipliers.',
        href: '/review-categories',
        icon: Tags,
        pathPrefix: '/v1/recognitions/review-categories',
        readOnlyAccess: false,
    },
    {
        title: 'Reviews',
        description: 'Monitor all peer reviews. Low ratings are flagged automatically.',
        href: '/reviews',
        icon: Star,
        pathPrefix: '/v1/recognitions/reviews',
        readOnlyAccess: false,
    },
    {
        title: 'Roles',
        description: 'Manage roles, assignments and route-level permissions.',
        href: '/roles',
        icon: Shield,
        pathPrefix: '/v1/roles',
        readOnlyAccess: false,
    },
    {
        title: 'Statuses',
        description: 'Define and manage employee and reward status types.',
        href: '/statuses',
        icon: Activity,
        pathPrefix: '/v1/organizations/statuses',
        readOnlyAccess: false,
    },
];

const WRITE_METHODS = ['POST:', 'PUT:', 'PATCH:', 'DELETE:'];

/**
 * Self-service routes that every authenticated employee has by default.
 * Even though some of these paths share a prefix with control-panel routes
 * (e.g. PUT:/v1/employees/notifications/… starts with /v1/employees,
 *  POST:/v1/recognitions/reviews starts with /v1/recognitions/reviews),
 * they must NEVER grant control-panel card access.
 *
 * Keep this list in sync with the identical constant in ProtectedRoute.tsx.
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

function cardIsAccessible(
    card: typeof categories[number],
    myKeys: string[],
): boolean {
    // Strip self-service routes before checking.
    // Prevents employee-role routes (e.g. PUT:/v1/employees/notifications/…)
    // from falsely matching admin path prefixes (e.g. /v1/employees).
    const adminKeys = myKeys.filter(k => !SELF_SERVICE_ROUTES.has(k));

    if (card.readOnlyAccess) {
        // Audit Logs — any GET permission on this path is enough.
        return adminKeys.some(k =>
            k.startsWith('GET:') &&
            k.slice(k.indexOf(':') + 1).startsWith(card.pathPrefix)
        );
    }

    // All other cards — must have at least one write-method permission
    // whose path starts with this card's prefix.
    return adminKeys.some(k =>
        WRITE_METHODS.some(m => k.startsWith(m)) &&
        k.slice(k.indexOf(':') + 1).startsWith(card.pathPrefix)
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ControlPanelHub() {
    const router = useRouter();
    const user = auth.getUser();

    const [permissionsLoading, setPermissionsLoading] = useState(true);
    const [visibleCategories, setVisibleCategories] = useState<typeof categories>([]);

    useEffect(() => {
        if (!user) { router.replace('/login'); return; }

        const userRoleCodes: string[] = user.roles ?? [];

        if (userRoleCodes.includes('SUPER_ADMIN')) {
            setVisibleCategories(categories);
            setPermissionsLoading(false);
            return;
        }

        (async () => {
            try {
                const myKeys: string[] = await routePermissionsApi.getMyPermissions();
                setVisibleCategories(
                    categories.filter(cat => cardIsAccessible(cat, myKeys))
                );
            } catch {
                setVisibleCategories([]);
            } finally {
                setPermissionsLoading(false);
            }
        })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!user) {
        return (
            <div className="flex items-center justify-center py-32">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#003580' }} />
            </div>
        );
    }

    return (
        <div className="flex-1 w-full bg-white shadow-[0_10px_50px_rgba(0,0,0,0.04)] overflow-hidden min-h-[calc(100vh-2rem)] sm:min-h-[calc(100vh-3rem)] transition-all">

            <PageHeader title="Control Panel" subtitle="System administration & configuration" />

            <div className="px-4 sm:px-6 md:px-10 py-6 sm:py-8 w-full">
                {permissionsLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 h-40 animate-pulse" />
                        ))}
                    </div>
                ) : visibleCategories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3">
                        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                            <ShieldAlert size={24} className="text-gray-300" />
                        </div>
                        <p className="text-sm font-semibold text-gray-500">
                            No control panel sections are accessible with your current roles.
                        </p>
                        <p className="text-xs text-gray-400">
                            Contact a Super Admin to update your route permissions.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {visibleCategories.map((cat) => (
                            <Link key={cat.href} href={cat.href} className="group block">
                                <div className="relative rounded-xl border border-slate-300 bg-white flex flex-col overflow-hidden h-full transition-all duration-300 shadow-md shadow-slate-400 cursor-pointer hover:shadow-xl hover:shadow-slate-300 hover:-translate-y-0.5">
                                    <div className="flex flex-col flex-1 p-5">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110">
                                                <cat.icon size={22} className="text-blue-600" />
                                            </div>
                                            <ArrowUpRight size={15} className="text-slate-300 group-hover:text-[#004C8F] transition-colors duration-200 mt-0.5" />
                                        </div>
                                        <p className="font-semibold text-slate-800 text-sm leading-snug mb-1">{cat.title}</p>
                                        <p className="text-xs text-slate-400 line-clamp-2 mb-3">{cat.description}</p>
                                        <div className="mt-auto pt-3 border-t border-slate-50">
                                            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-[#004C8F] transition-colors duration-200">
                                                Manage →
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}