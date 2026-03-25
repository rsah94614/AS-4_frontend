import { render, screen, waitFor } from "@testing-library/react";
import DashboardPage from "@/app/(dashboard)/dashboard/page";
import { isAdminUser } from "@/lib/role-utils";

jest.mock("@/lib/role-utils", () => ({
    isAdminUser: jest.fn(),
}));

jest.mock("@/components/layout/AdminDashboard", () => function AdminDashboardMock() {
    return <div data-testid="admin-dashboard">Admin Dashboard</div>;
});

jest.mock("@/components/layout/UserDashboard", () => function UserDashboardMock() {
    return <div data-testid="user-dashboard">User Dashboard</div>;
});

const mockIsAdminUser = isAdminUser as jest.MockedFunction<typeof isAdminUser>;

describe("DashboardPage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders AdminDashboard when user is admin", async () => {
        mockIsAdminUser.mockReturnValue(true);
        render(<DashboardPage />);
        await waitFor(() => {
            expect(screen.getByTestId("admin-dashboard")).toBeInTheDocument();
        });
    });

    it("renders UserDashboard when user is not admin", async () => {
        mockIsAdminUser.mockReturnValue(false);
        render(<DashboardPage />);
        await waitFor(() => {
            expect(screen.getByTestId("user-dashboard")).toBeInTheDocument();
        });
    });
});
