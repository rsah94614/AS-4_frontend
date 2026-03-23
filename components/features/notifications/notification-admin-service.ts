import { ADMIN_ROLES } from "@/lib/role-utils";
import {
    employeesClient as employeeClient,
    orgClient,
    recognitionClient,
} from "@/services/api-clients";
import type {
    AnnouncementRequest,
    AnnouncementResponse,
    DigestEmailRequest,
    DigestResponse,
    WeeklyDigestData,
} from "@/types/notification-types";
import { toIsoDatetime } from "@/components/features/notifications/notifications-shared";

export interface Department {
    department_id: string;
    department_name: string;
}

export interface EmployeeOption {
    employee_id: string;
    username: string;
    email: string;
}

export interface ManagerOption {
    employee_id: string;
    username: string;
    email: string;
}

export async function postAnnouncement(
    payload: AnnouncementRequest
): Promise<AnnouncementResponse> {
    const res = await employeeClient.post<AnnouncementResponse>(
        "/notifications/announcements",
        payload
    );
    return res.data;
}

export async function fetchDepartments(): Promise<Department[]> {
    const res = await orgClient.get("/departments", { params: { limit: 100 } });
    const data = res.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.departments)) return data.departments;
    if (Array.isArray(data.data)) return data.data;
    return [];
}

export async function fetchEmployeeOptions(search: string): Promise<EmployeeOption[]> {
    const params: Record<string, string> = { limit: "30" };
    if (search) params.search = search;
    const res = await employeeClient.get("/list", { params });
    const data = res.data;
    return Array.isArray(data) ? data : (data.employees ?? data.data ?? []);
}

export async function getDigest(
    weekStart?: string,
    managerId?: string
): Promise<WeeklyDigestData> {
    const params: Record<string, string> = {};
    if (weekStart) params.week_start = toIsoDatetime(weekStart);
    if (managerId) params.manager_id = managerId;
    const res = await recognitionClient.get<WeeklyDigestData>("/digest", { params });
    return res.data;
}

export async function postDigest(payload: DigestEmailRequest): Promise<DigestResponse> {
    const body: Record<string, string> = { manager_email: payload.manager_email };
    if (payload.week_start) body.week_start = toIsoDatetime(payload.week_start);
    if (payload.manager_id) body.manager_id = payload.manager_id;

    const res = await recognitionClient.post<DigestResponse>("/digest/send", body);
    return res.data;
}

export async function fetchManagerOptions(): Promise<ManagerOption[]> {
    const allowed = new Set([...ADMIN_ROLES, "MANAGER"]);

    const [rolesRes, empRes] = await Promise.all([
        employeeClient.get("/roles/employees").then((r) => r.data).catch(() => []),
        employeeClient.get("/list", { params: { limit: 100 } }).then((r) => r.data).catch(() => ({})),
    ]);

    const allowedEmails = new Set<string>();
    const roleRows: { is_active: boolean; employee: { email: string }; role: { code: string } }[] =
        Array.isArray(rolesRes) ? rolesRes : [];

    for (const row of roleRows) {
        if (row.is_active && allowed.has(row.role?.code?.toUpperCase())) {
            allowedEmails.add(row.employee?.email);
        }
    }

    const employeeRows: EmployeeOption[] =
        Array.isArray(empRes) ? empRes : (empRes.employees ?? empRes.data ?? []);

    return employeeRows
        .filter((employee) => allowedEmails.has(employee.email))
        .map((employee) => ({
            employee_id: employee.employee_id,
            username: employee.username,
            email: employee.email,
        }));
}
