import { employeeService, detailToTeamMember, listItemToTeamMember, getTeamMembersForUI } from "@/services/employee-service";
import { employeesClient } from "@/services/api-clients";
import { requireAuthenticatedUserId } from "@/lib/api-utils";

jest.mock("@/services/api-clients", () => ({
    employeesClient: {
        get: jest.fn(),
    },
}));

jest.mock("@/lib/api-utils", () => ({
    requireAuthenticatedUserId: jest.fn(),
}));

jest.mock("@/lib/error-utils", () => ({
    extractErrorMessage: jest.fn((_err, fallback) => fallback || "error"),
}));

const mockGet = employeesClient.get as jest.MockedFunction<typeof employeesClient.get>;
const mockAuthUserId = requireAuthenticatedUserId as jest.MockedFunction<typeof requireAuthenticatedUserId>;

describe("detailToTeamMember", () => {
    it("converts EmployeeDetail to TeamMember", () => {
        const detail = {
            employee_id: "e1",
            username: "alice",
            email: "alice@test.com",
            is_active: true,
            date_of_joining: "2024-01-01",
            created_at: "2024-01-01",
            designation: { designation_id: "d1", designation_name: "Engineer", designation_code: "ENG", level: 1 },
        };
        const result = detailToTeamMember(detail);
        expect(result).toEqual({ id: "e1", name: "alice", email: "alice@test.com", designation: "Engineer" });
    });
});

describe("listItemToTeamMember", () => {
    it("converts Employee to TeamMember", () => {
        const emp = {
            employee_id: "e2",
            username: "bob",
            email: "bob@test.com",
            designation_name: "Manager",
            is_active: true,
            date_of_joining: "2024-01-01",
            created_at: "2024-01-01",
        };
        const result = listItemToTeamMember(emp);
        expect(result).toEqual({ id: "e2", name: "bob", email: "bob@test.com", designation: "Manager" });
    });
});

describe("employeeService", () => {
    beforeEach(() => jest.clearAllMocks());

    describe("getEmployee", () => {
        it("returns employee detail", async () => {
            const detail = { employee_id: "e1", username: "alice" };
            mockGet.mockResolvedValue({ data: detail } as never);
            const result = await employeeService.getEmployee("e1");
            expect(result).toEqual(detail);
            expect(mockGet).toHaveBeenCalledWith("/e1");
        });

        it("throws on error", async () => {
            mockGet.mockRejectedValue(new Error("not found"));
            await expect(employeeService.getEmployee("e1")).rejects.toThrow("Failed to fetch employee");
        });
    });

    describe("listEmployees", () => {
        it("builds query params and returns data", async () => {
            const response = { data: [{ employee_id: "e1" }], pagination: { total: 1 } };
            mockGet.mockResolvedValue({ data: response } as never);

            const result = await employeeService.listEmployees({ page: 1, limit: 10, search: "alice" });
            expect(result).toEqual(response);
            const url = mockGet.mock.calls[0][0] as string;
            expect(url).toContain("page=1");
            expect(url).toContain("limit=10");
            expect(url).toContain("search=alice");
        });
    });
});

describe("getTeamMembersForUI", () => {
    beforeEach(() => jest.clearAllMocks());

    it("returns team data when user has a manager", async () => {
        mockAuthUserId.mockReturnValue("me");

        // First call: getEmployee(myId)
        mockGet.mockResolvedValueOnce({
            data: {
                employee_id: "me",
                username: "me",
                email: "me@test.com",
                is_active: true,
                date_of_joining: "2024-01-01",
                created_at: "2024-01-01",
                manager: { employee_id: "mgr", username: "manager", email: "mgr@test.com" },
            },
        } as never);

        // Second call: getEmployee(managerId)
        mockGet.mockResolvedValueOnce({
            data: {
                employee_id: "mgr",
                username: "manager",
                email: "mgr@test.com",
                is_active: true,
                date_of_joining: "2024-01-01",
                created_at: "2024-01-01",
            },
        } as never);

        // Third call: listEmployees (colleagues)
        mockGet.mockResolvedValueOnce({
            data: {
                data: [
                    { employee_id: "me", username: "me", email: "me@test.com", is_active: true, date_of_joining: "2024-01-01", created_at: "2024-01-01" },
                    { employee_id: "peer", username: "peer", email: "peer@test.com", is_active: true, date_of_joining: "2024-01-01", created_at: "2024-01-01" },
                ],
                pagination: {},
            },
        } as never);

        const result = await getTeamMembersForUI();
        expect(result.loggedInUser.id).toBe("me");
        expect(result.teamLeader?.id).toBe("mgr");
        // me should be filtered out from teamMembers
        expect(result.teamMembers).toHaveLength(1);
        expect(result.teamMembers[0].id).toBe("peer");
    });
});
