import { renderHook, waitFor } from "@testing-library/react";

jest.mock("@/services/department-service", () => ({
    departmentService: {
        list: jest.fn().mockResolvedValue({ data: [], pagination: { total: 0 } }),
        listTypes: jest.fn().mockResolvedValue([]),
        getById: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    },
}));

jest.mock("@/services/designation-service", () => ({
    designationService: {
        list: jest.fn().mockResolvedValue({ data: [], pagination: { total: 0 } }),
        getById: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    },
}));

jest.mock("@/services/api-clients", () => ({
    orgClient: { get: jest.fn().mockResolvedValue({ data: [] }), post: jest.fn(), put: jest.fn() },
    employeesClient: { get: jest.fn().mockResolvedValue({ data: { data: [], pagination: {} } }), put: jest.fn() },
    rewardsClient: { get: jest.fn().mockResolvedValue({ data: [] }), post: jest.fn(), patch: jest.fn() },
    walletClient: { get: jest.fn().mockResolvedValue({ data: {} }) },
    rolesClient: jest.fn().mockResolvedValue({ data: [] }),
    recognitionClient: {
        get: jest.fn().mockResolvedValue({ data: { data: [], pagination: { total: 0, total_pages: 0 } } }),
        post: jest.fn(),
    },
    analyticsClient: { get: jest.fn().mockResolvedValue({ data: {} }) },
}));

jest.mock("@/services/auth-service", () => ({
    auth: {
        getAccessToken: jest.fn(),
        getUser: jest.fn(() => ({ employee_id: "emp-1", roles: ["EMPLOYEE"] })),
        getRefreshToken: jest.fn(),
        isAuthenticated: jest.fn(() => true),
        isTokenExpired: jest.fn(() => false),
        clearTokens: jest.fn(),
        setTokens: jest.fn(),
        refreshAccessToken: jest.fn(),
    },
}));

jest.mock("@/lib/api-utils", () => ({
    requireAuthenticatedUserId: jest.fn().mockReturnValue("emp-1"),
    createAuthenticatedClient: jest.fn(),
    categorizeFileUrls: jest.fn(() => ({})),
}));

jest.mock("@/lib/error-utils", () => ({
    extractErrorMessage: jest.fn((_err, fallback) => fallback || "error"),
}));

jest.mock("@/services/employee-service", () => ({
    getTeamMembersForUI: jest.fn().mockResolvedValue({
        loggedInUser: { id: "emp-1", name: "Test" },
        teamMembers: [],
        teamLeader: null,
    }),
    employeeService: {
        getEmployee: jest.fn().mockResolvedValue({ employee_id: "emp-1", username: "test" }),
        listEmployees: jest.fn().mockResolvedValue({ data: [], pagination: {} }),
    },
}));

describe("useDepartments hook", () => {
    it("can be imported and rendered", async () => {
        const { useDepartments } = await import("@/hooks/useDepartments");
        const { result } = renderHook(() => useDepartments());
        expect(result.current.loading).toBe(true);
        await waitFor(() => expect(result.current.loading).toBe(false));
    });
});

describe("useDesignations hook", () => {
    it("can be imported and rendered", async () => {
        const { useDesignations } = await import("@/hooks/useDesignations");
        const { result } = renderHook(() => useDesignations());
        expect(result.current.loading).toBe(true);
        await waitFor(() => expect(result.current.loading).toBe(false));
    });
});

describe("useTeams hook", () => {
    it("can be imported and rendered", async () => {
        const { useTeams } = await import("@/hooks/useTeams");
        const { result } = renderHook(() => useTeams());
        expect(result.current.loading).toBe(true);
        await waitFor(() => expect(result.current.loading).toBe(false));
    });
});
