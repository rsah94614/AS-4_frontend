import { render, screen, waitFor } from "@testing-library/react";
import ProtectedRoute from "@/components/features/auth/ProtectedRoute";
import { auth } from "@/services/auth-service";
import { routePermissionsApi } from "@/services/roles-service";
import { isAdminUser } from "@/lib/role-utils";

const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock("next/navigation", () => ({
    useRouter: () => ({ push: mockPush, back: mockBack }),
}));

jest.mock("@/services/roles-service", () => ({
    routePermissionsApi: {
        getMyPermissions: jest.fn(),
    },
}));

jest.mock("@/services/auth-service", () => ({
    auth: {
        isAuthenticated: jest.fn(),
        getUser: jest.fn(),
        getRefreshToken: jest.fn(),
        refreshAccessToken: jest.fn(),
    },
}));

jest.mock("@/lib/role-utils", () => ({
    isAdminUser: jest.fn(),
}));

const mockIsAuthenticated = auth.isAuthenticated as jest.MockedFunction<typeof auth.isAuthenticated>;
const mockGetRefreshToken = auth.getRefreshToken as jest.MockedFunction<typeof auth.getRefreshToken>;
const mockRefreshAccessToken = auth.refreshAccessToken as jest.MockedFunction<typeof auth.refreshAccessToken>;
const mockGetUser = auth.getUser as jest.Mock;
const mockGetMyPermissions = routePermissionsApi.getMyPermissions as jest.Mock;
const mockIsAdminUser = isAdminUser as jest.MockedFunction<typeof isAdminUser>;

describe("ProtectedRoute", () => {
    beforeEach(() => {
        mockGetUser.mockReturnValue({ roles: [] });
        mockGetMyPermissions.mockResolvedValue([]);
        mockIsAuthenticated.mockReturnValue(false);
        mockGetRefreshToken.mockReturnValue(null);
        mockIsAdminUser.mockReturnValue(false);
        jest.clearAllMocks();
    });

    it("renders children when authenticated", async () => {
        mockIsAuthenticated.mockReturnValue(true);
        mockIsAdminUser.mockReturnValue(false);

        render(
            <ProtectedRoute>
                <div>Protected Content</div>
            </ProtectedRoute>
        );

        await waitFor(() => {
            expect(screen.getByText("Protected Content")).toBeInTheDocument();
        });
    });

    it("redirects to /login when not authenticated", async () => {
        mockIsAuthenticated.mockReturnValue(false);
        mockGetRefreshToken.mockReturnValue(null);

        render(
            <ProtectedRoute>
                <div>Protected Content</div>
            </ProtectedRoute>
        );

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith("/login");
        });
    });

    it("redirects to custom redirectTo", async () => {
        mockIsAuthenticated.mockReturnValue(false);
        mockGetRefreshToken.mockReturnValue(null);

        render(
            <ProtectedRoute redirectTo="/custom-login">
                <div>Protected Content</div>
            </ProtectedRoute>
        );

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith("/custom-login");
        });
    });

    it("attempts token refresh when has refresh token", async () => {
        mockIsAuthenticated.mockReturnValue(false);
        mockGetRefreshToken.mockReturnValue("refresh-tok");
        mockRefreshAccessToken.mockResolvedValue(true);
        mockIsAdminUser.mockReturnValue(false);

        render(
            <ProtectedRoute>
                <div>Protected Content</div>
            </ProtectedRoute>
        );

        await waitFor(() => {
            expect(mockRefreshAccessToken).toHaveBeenCalled();
            expect(screen.getByText("Protected Content")).toBeInTheDocument();
        });
    });

    it("shows Access Restricted when adminOnly and user is not admin", async () => {
        mockIsAuthenticated.mockReturnValue(true);
        mockIsAdminUser.mockReturnValue(false);

        render(
            <ProtectedRoute adminOnly>
                <div>Admin Content</div>
            </ProtectedRoute>
        );

        await waitFor(() => {
            expect(screen.getByText("Access Restricted")).toBeInTheDocument();
        });

        expect(screen.queryByText("Admin Content")).not.toBeInTheDocument();
    });

    it("renders children when adminOnly and user is admin", async () => {
        mockIsAuthenticated.mockReturnValue(true);
        mockIsAdminUser.mockReturnValue(true);
        mockGetUser.mockReturnValue({ roles: ["SUPER_ADMIN"] });

        render(
            <ProtectedRoute adminOnly>
                <div>Admin Content</div>
            </ProtectedRoute>
        );

        await waitFor(() => {
            expect(screen.getByText("Admin Content")).toBeInTheDocument();
        });
    });

    it("shows Go Back and Dashboard buttons on Access Restricted", async () => {
        mockIsAuthenticated.mockReturnValue(true);
        mockIsAdminUser.mockReturnValue(false);

        render(
            <ProtectedRoute adminOnly>
                <div>Admin Content</div>
            </ProtectedRoute>
        );

        await waitFor(() => {
            expect(screen.getByText("Go Back")).toBeInTheDocument();
            expect(screen.getByText("Dashboard")).toBeInTheDocument();
        });
    });
});
