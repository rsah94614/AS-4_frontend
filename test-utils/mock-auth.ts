import type { User } from "@/services/auth-service";

const defaultUser: User = {
    employee_id: "emp-001",
    username: "john.doe",
    email: "john.doe@company.com",
    designation_id: "des-001",
    department_id: "dept-001",
    roles: ["EMPLOYEE"],
};

export function makeUser(overrides: Partial<User> = {}): User {
    return { ...defaultUser, ...overrides };
}

/**
 * Creates a base64-encoded JWT with the given payload.
 * The header and signature are dummy values — only the payload is decoded in tests.
 */
export function makeJwt(payload: Record<string, unknown> = {}): string {
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const body = btoa(JSON.stringify(payload));
    const signature = "test-signature";
    return `${header}.${body}.${signature}`;
}
