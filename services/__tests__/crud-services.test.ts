import { departmentService } from "@/services/department-service";
import { designationService } from "@/services/designation-service";
import { fetchAuditLogs, fetchStatuses, createStatus, updateStatus } from "@/services/org-service";
import { rolesApi, employeeRolesApi, routePermissionsApi } from "@/services/roles-service";
import { orgClient, rolesClient } from "@/services/api-clients";

jest.mock("@/services/api-clients", () => ({
    orgClient: {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
    },
    rolesClient: jest.fn(),
}));

jest.mock("@/lib/error-utils", () => ({
    extractErrorMessage: jest.fn((_err, fallback) => fallback || "error"),
}));

const mockOrgGet = orgClient.get as jest.MockedFunction<typeof orgClient.get>;
const mockOrgPost = orgClient.post as jest.MockedFunction<typeof orgClient.post>;
const mockOrgPut = orgClient.put as jest.MockedFunction<typeof orgClient.put>;
const mockRolesClient = rolesClient as unknown as jest.MockedFunction<typeof rolesClient>;

describe("departmentService", () => {
    beforeEach(() => jest.clearAllMocks());

    it("list calls GET /departments with params", async () => {
        mockOrgGet.mockResolvedValue({ data: { data: [], pagination: {} } } as never);
        await departmentService.list({ page: 1, limit: 10, search: "eng" });
        expect(mockOrgGet).toHaveBeenCalledWith("/departments", expect.objectContaining({
            params: expect.objectContaining({ page: 1, limit: 10, search: "eng" }),
        }));
    });

    it("getById calls GET /departments/:id", async () => {
        mockOrgGet.mockResolvedValue({ data: { department_id: "d1" } } as never);
        const result = await departmentService.getById("d1");
        expect(result.department_id).toBe("d1");
    });

    it("create calls POST /departments", async () => {
        mockOrgPost.mockResolvedValue({ data: { department_name: "New" } } as never);
        const result = await departmentService.create({ department_name: "New" } as never);
        expect(result.department_name).toBe("New");
    });

    it("update calls PUT /departments/:id", async () => {
        mockOrgPut.mockResolvedValue({ data: { department_name: "Updated" } } as never);
        const result = await departmentService.update("d1", { department_name: "Updated" } as never);
        expect(result.department_name).toBe("Updated");
    });

    it("listTypes handles array response", async () => {
        mockOrgGet.mockResolvedValue({ data: [{ type_id: "t1" }] } as never);
        const result = await departmentService.listTypes();
        expect(result).toHaveLength(1);
    });

    it("listTypes handles wrapped response", async () => {
        mockOrgGet.mockResolvedValue({ data: { data: [{ type_id: "t1" }] } } as never);
        const result = await departmentService.listTypes();
        expect(result).toHaveLength(1);
    });

    it("throws on error", async () => {
        mockOrgGet.mockRejectedValue(new Error("fail"));
        await expect(departmentService.list()).rejects.toThrow("Failed to list departments");
    });
});

describe("designationService", () => {
    beforeEach(() => jest.clearAllMocks());

    it("list calls GET /designations", async () => {
        mockOrgGet.mockResolvedValue({ data: { data: [], pagination: {} } } as never);
        await designationService.list({ page: 1 });
        expect(mockOrgGet).toHaveBeenCalledWith("/designations", expect.any(Object));
    });

    it("getById returns designation", async () => {
        mockOrgGet.mockResolvedValue({ data: { designation_id: "d1" } } as never);
        const result = await designationService.getById("d1");
        expect(result.designation_id).toBe("d1");
    });

    it("create posts payload", async () => {
        mockOrgPost.mockResolvedValue({ data: { designation_name: "VP" } } as never);
        const result = await designationService.create({ designation_name: "VP" } as never);
        expect(result.designation_name).toBe("VP");
    });

    it("update puts payload", async () => {
        mockOrgPut.mockResolvedValue({ data: { designation_name: "Updated" } } as never);
        const result = await designationService.update("d1", { designation_name: "Updated" } as never);
        expect(result.designation_name).toBe("Updated");
    });
});

describe("org-service", () => {
    beforeEach(() => jest.clearAllMocks());

    describe("fetchAuditLogs", () => {
        it("returns data and pagination", async () => {
            mockOrgGet.mockResolvedValue({
                data: { data: [{ audit_log_id: "a1" }], pagination: { total: 1 } },
            } as never);
            const result = await fetchAuditLogs({ page: 1 });
            expect(result.data).toHaveLength(1);
        });
    });

    describe("fetchStatuses", () => {
        it("returns status list", async () => {
            mockOrgGet.mockResolvedValue({ data: [{ status_id: "s1" }] } as never);
            const result = await fetchStatuses();
            expect(result).toHaveLength(1);
        });

        it("passes entity_type param", async () => {
            mockOrgGet.mockResolvedValue({ data: [] } as never);
            await fetchStatuses("EMPLOYEE" as never);
            expect(mockOrgGet).toHaveBeenCalledWith("/statuses", {
                params: { entity_type: "EMPLOYEE" },
            });
        });
    });

    describe("createStatus", () => {
        it("posts status", async () => {
            mockOrgPost.mockResolvedValue({ data: { status_name: "Active" } } as never);
            const result = await createStatus({
                status_code: "ACTIVE",
                status_name: "Active",
                description: "desc",
                entity_type: "EMPLOYEE" as never,
            });
            expect(result.status_name).toBe("Active");
        });
    });

    describe("updateStatus", () => {
        it("puts status update", async () => {
            mockOrgPut.mockResolvedValue({ data: { status_name: "Updated" } } as never);
            const result = await updateStatus("s1", { status_name: "Updated", description: "new desc" });
            expect(result.status_name).toBe("Updated");
        });
    });
});

describe("roles-service", () => {
    beforeEach(() => jest.clearAllMocks());

    describe("rolesApi", () => {
        it("listRoles calls GET /list", async () => {
            mockRolesClient.mockResolvedValue({ data: [{ role_id: "r1" }] } as never);
            const result = await rolesApi.listRoles();
            expect(result).toEqual([{ role_id: "r1" }]);
            expect(mockRolesClient).toHaveBeenCalledWith(expect.objectContaining({
                url: "/list",
                method: "GET",
            }));
        });

        it("createRole calls POST /create", async () => {
            mockRolesClient.mockResolvedValue({ data: { role_id: "r2" } } as never);
            await rolesApi.createRole({ role_name: "Admin", role_code: "ADMIN" });
            expect(mockRolesClient).toHaveBeenCalledWith(expect.objectContaining({
                url: "/create",
                method: "POST",
            }));
        });
    });

    describe("employeeRolesApi", () => {
        it("listEmployeeRoles calls GET /employees", async () => {
            mockRolesClient.mockResolvedValue({ data: [] } as never);
            await employeeRolesApi.listEmployeeRoles();
            expect(mockRolesClient).toHaveBeenCalledWith(expect.objectContaining({ url: "/employees" }));
        });

        it("assignRole calls POST /assign", async () => {
            mockRolesClient.mockResolvedValue({ data: {} } as never);
            await employeeRolesApi.assignRole({ employee_id: "e1", role_id: "r1" });
            expect(mockRolesClient).toHaveBeenCalledWith(expect.objectContaining({
                url: "/assign",
                method: "POST",
            }));
        });
    });

    describe("routePermissionsApi", () => {
        it("listRoutePermissions calls GET /route-permissions", async () => {
            mockRolesClient.mockResolvedValue({ data: [] } as never);
            await routePermissionsApi.listRoutePermissions();
            expect(mockRolesClient).toHaveBeenCalledWith(expect.objectContaining({
                url: "/route-permissions",
            }));
        });
    });
});
