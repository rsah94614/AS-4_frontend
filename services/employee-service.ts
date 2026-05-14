import { requireAuthenticatedUserId } from '@/lib/api-utils'
import { extractErrorMessage } from '@/lib/error-utils'
import { employeesClient, orgClient } from '@/services/api-clients'


// ─── Types matching backend schemas.py ───────────────────────────────────────

export interface Employee {
    employee_id: string
    username: string
    first_name: string
    last_name: string
    email: string
    designation_id?: string
    designation_name?: string
    department_id?: string
    department_name?: string
    department_type_id?: string   // used for cross-team filtering
    manager_id?: string
    manager_name?: string
    status_id?: string
    status_name?: string
    is_active: boolean
    date_of_joining: string
    created_at: string
    updated_at?: string
}

export interface EmployeeDetail {
    employee_id: string
    username: string
    first_name: string
    last_name: string
    email: string
    is_active: boolean
    date_of_joining: string
    designation?: {
        designation_id: string
        designation_name: string
        designation_code: string
        level: number
    }
    department?: {
        department_id: string
        department_name: string
        department_code: string
        department_type_id?: string   // used for cross-team filtering
    }
    manager?: {
        employee_id: string
        first_name: string
        last_name: string
        username: string
        email: string
    }
    status?: {
        status_id: string
        status_code: string
        status_name: string
    }
    roles?: { role_id: string; role_name: string; role_code: string }[]
    created_at: string
    updated_at?: string
}

export interface TeamMember {
    id: string
    name: string
    email?: string
    designation?: string
    department_type_id?: string
}

// ─── Converters ──────────────────────────────────────────────────────────────

export function detailToTeamMember(e: EmployeeDetail): TeamMember {
    return {
        id: e.employee_id,
        name: `${e.first_name} ${e.last_name}`,
        email: e.email,
        designation: e.designation?.designation_name,
        department_type_id: e.department?.department_type_id,
    }
}

export function listItemToTeamMember(e: Employee): TeamMember {
    return {
        id: e.employee_id,
        name: `${e.first_name} ${e.last_name}`,
        email: e.email,
        designation: e.designation_name,
        department_type_id: e.department_type_id,
    }
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const employeeService = {
    async getEmployee(id: string): Promise<EmployeeDetail> {
        try {
            const res = await employeesClient.get<EmployeeDetail>(`/${id}`)
            return res.data
        } catch (error) {
            throw new Error(extractErrorMessage(error, 'Failed to fetch employee'))
        }
    },

    async listEmployees(params?: {
    page?: number
    limit?: number
    manager_id?: string
    department_id?: string
    department_type_id?: string   // ← ADD
    is_active?: boolean
    search?: string
    sort_by?: string
    sort_order?: string
}): Promise<{ data: Employee[]; pagination: Record<string, unknown> }> {
    const q = new URLSearchParams()
    if (params?.page)               q.set('page',               String(params.page))
    if (params?.limit)              q.set('limit',               String(params.limit))
    if (params?.manager_id)         q.set('manager_id',          params.manager_id)
    if (params?.department_id)      q.set('department_id',       params.department_id)
    if (params?.department_type_id) q.set('department_type_id',  params.department_type_id)  // ← ADD
    if (params?.is_active != null)  q.set('is_active',           String(params.is_active))
    if (params?.search)             q.set('search',              params.search)
    if (params?.sort_by)            q.set('sort_by',             params.sort_by)
    if (params?.sort_order)         q.set('sort_order',          params.sort_order)

        try {
            const res = await employeesClient.get<{ data: Employee[]; pagination: Record<string, unknown> }>(
                `/list?${q.toString()}`
            )
            return res.data
        } catch (error) {
            throw new Error(extractErrorMessage(error, 'Failed to fetch employees'))
        }
    },
}

// ─── Department helper ────────────────────────────────────────────────────────

/**
 * Resolves the department_type_id for a given department_id.
 * Calls GET /aabhar/v1/organization/departments/:id via organizationClient.
 * Returns null if the call fails — callers should treat null as "no filter".
 */
async function getDepartmentTypeId(departmentId: string): Promise<string | null> {
    try {
        const res = await orgClient.get<{
            department_type?: { department_type_id?: string }
        }>(`/departments/${departmentId}`)
        return res.data.department_type?.department_type_id ?? null
    } catch {
        return null
    }
}

// ─── Main helper used by useReviewPage ───────────────────────────────────────

/**
 * Fetches the receiver list for the New Recognition form.
 *
 * Cross-team filtering (department_type):
 *   Previously this returned everyone who shared the same manager, which
 *   included people from completely different department groups (e.g. HR
 *   showing up alongside engineers because admin.user is everyone's manager).
 *
 *   Now we resolve the logged-in user's department_type_id and filter the
 *   candidate list to only employees whose department shares the same type.
 *   This mirrors the backend check in create_review():
 *     reviewer_dept.department_type_id === receiver_dept.department_type_id
 *
 *   If we can't resolve the type (API error), we fall back to unfiltered
 *   so the form still works — the backend will still block invalid combos.
 */
export async function getTeamMembersForUI(): Promise<{
    loggedInUser: TeamMember
    teamMembers: TeamMember[]
    teamLeader: TeamMember | null
}> {
    const myId = requireAuthenticatedUserId()
    const myDetail = await employeeService.getEmployee(myId)

    const myDeptTypeId = myDetail.department?.department_type_id ?? null

    if (!myDeptTypeId) {
        // Can't filter — return empty so backend blocks any wrong submission
        return {
            loggedInUser: detailToTeamMember(myDetail),
            teamMembers: [],
            teamLeader: null,
        }
    }

    // Single query — all employees in same department_type, excluding self
    const colleaguesRes = await employeeService.listEmployees({
        department_type_id: myDeptTypeId,
        limit: 100,
        is_active: true,
    })

    const everyone = colleaguesRes.data.filter((e) => e.employee_id !== myId)

    const managerId = myDetail.manager?.employee_id
    const teamLeaderData = managerId
        ? everyone.find((e) => e.employee_id === managerId) ?? null
        : null
    const teamMembers = everyone.filter((e) => e.employee_id !== managerId)

    return {
        loggedInUser: detailToTeamMember(myDetail),
        teamMembers:  teamMembers.map(listItemToTeamMember),
        teamLeader:   teamLeaderData ? listItemToTeamMember(teamLeaderData) : null,
    }
}