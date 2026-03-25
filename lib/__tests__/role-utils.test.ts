import { decodeJwtPayload, getRolesFromToken, isAdminUser, isSuperDev, ADMIN_ROLES, SUPER_DEV_ROLES } from "@/lib/role-utils";
import { auth } from "@/services/auth-service";
import { makeJwt, makeUser } from "@/test-utils/mock-auth";

jest.mock("@/services/auth-service", () => ({
    auth: {
        getAccessToken: jest.fn(),
        getUser: jest.fn(),
    },
}));

const mockGetAccessToken = auth.getAccessToken as jest.MockedFunction<typeof auth.getAccessToken>;
const mockGetUser = auth.getUser as jest.MockedFunction<typeof auth.getUser>;

describe("decodeJwtPayload", () => {
    beforeEach(() => jest.clearAllMocks());

    it("decodes a valid 3-part JWT", () => {
        const token = makeJwt({ sub: "user-1", roles: ["ADMIN"] });
        const payload = decodeJwtPayload(token);
        expect(payload).toEqual({ sub: "user-1", roles: ["ADMIN"] });
    });

    it("returns null for a 2-part token", () => {
        expect(decodeJwtPayload("header.payload")).toBeNull();
    });

    it("returns null for empty string", () => {
        expect(decodeJwtPayload("")).toBeNull();
    });

    it("returns null for garbage input", () => {
        expect(decodeJwtPayload("not.a.valid-base64!!!")).toBeNull();
    });
});

describe("getRolesFromToken", () => {
    beforeEach(() => jest.clearAllMocks());

    it("returns roles array from JWT", () => {
        mockGetAccessToken.mockReturnValue(makeJwt({ roles: ["ADMIN", "HR_ADMIN"] }));
        expect(getRolesFromToken()).toEqual(["ADMIN", "HR_ADMIN"]);
    });

    it("handles single role string", () => {
        mockGetAccessToken.mockReturnValue(makeJwt({ role: "EMPLOYEE" }));
        expect(getRolesFromToken()).toEqual(["EMPLOYEE"]);
    });

    it("returns empty array when no token", () => {
        mockGetAccessToken.mockReturnValue(null);
        expect(getRolesFromToken()).toEqual([]);
    });

    it("uppercases and trims roles", () => {
        mockGetAccessToken.mockReturnValue(makeJwt({ roles: [" admin ", "hr_admin"] }));
        expect(getRolesFromToken()).toEqual(["ADMIN", "HR_ADMIN"]);
    });
});

describe("isAdminUser", () => {
    beforeEach(() => jest.clearAllMocks());

    it("returns true when JWT has HR_ADMIN role", () => {
        mockGetAccessToken.mockReturnValue(makeJwt({ roles: ["HR_ADMIN"] }));
        expect(isAdminUser()).toBe(true);
    });

    it("returns true when JWT has ADMIN role", () => {
        mockGetAccessToken.mockReturnValue(makeJwt({ roles: ["ADMIN"] }));
        expect(isAdminUser()).toBe(true);
    });

    it("returns true when JWT has SUPER_ADMIN role", () => {
        mockGetAccessToken.mockReturnValue(makeJwt({ roles: ["SUPER_ADMIN"] }));
        expect(isAdminUser()).toBe(true);
    });

    it("falls back to cached user roles when JWT has no admin role", () => {
        mockGetAccessToken.mockReturnValue(makeJwt({ roles: ["EMPLOYEE"] }));
        mockGetUser.mockReturnValue(makeUser({ roles: ["HR_ADMIN"] }));
        expect(isAdminUser()).toBe(true);
    });

    it("returns false when neither JWT nor cached user has admin role", () => {
        mockGetAccessToken.mockReturnValue(makeJwt({ roles: ["EMPLOYEE"] }));
        mockGetUser.mockReturnValue(makeUser({ roles: ["EMPLOYEE"] }));
        expect(isAdminUser()).toBe(false);
    });

    it("returns false when no token and no user", () => {
        mockGetAccessToken.mockReturnValue(null);
        mockGetUser.mockReturnValue(null);
        expect(isAdminUser()).toBe(false);
    });
});

describe("isSuperDev", () => {
    beforeEach(() => jest.clearAllMocks());

    it("returns true for SUPER_ADMIN", () => {
        mockGetAccessToken.mockReturnValue(makeJwt({ roles: ["SUPER_ADMIN"] }));
        expect(isSuperDev()).toBe(true);
    });

    it("returns true for SUPER_DEV", () => {
        mockGetAccessToken.mockReturnValue(makeJwt({ roles: ["SUPER_DEV"] }));
        expect(isSuperDev()).toBe(true);
    });

    it("returns false for plain ADMIN", () => {
        mockGetAccessToken.mockReturnValue(makeJwt({ roles: ["ADMIN"] }));
        expect(isSuperDev()).toBe(false);
    });

    it("returns false when no token", () => {
        mockGetAccessToken.mockReturnValue(null);
        expect(isSuperDev()).toBe(false);
    });
});

describe("role constants", () => {
    it("ADMIN_ROLES includes expected roles", () => {
        expect(ADMIN_ROLES).toContain("HR_ADMIN");
        expect(ADMIN_ROLES).toContain("ADMIN");
        expect(ADMIN_ROLES).toContain("SUPER_ADMIN");
    });

    it("SUPER_DEV_ROLES does not include plain ADMIN", () => {
        expect(SUPER_DEV_ROLES).not.toContain("ADMIN");
    });
});
