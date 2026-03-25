import React from "react"
import { render, screen } from "@testing-library/react"
import Navbar from "../Navbar"

jest.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}))

jest.mock("next/link", () => {
  const MockLink = ({ children, href, onClick }: { children: React.ReactNode, href: string, onClick?: () => void }) => {
    return (
      <a href={href} onClick={onClick}>
        {children}
      </a>
    )
  }
  MockLink.displayName = "MockLink";
  return MockLink;
});

jest.mock("next/image", () => {
  // eslint-disable-next-line @next/next/no-img-element
  const MockNavbarImage = () => <img alt="Mocked Image" />;
  MockNavbarImage.displayName = "MockNavbarImage";
  return MockNavbarImage;
});

jest.mock("@/services/auth-service", () => {
  const mockUser = { username: "John", roles: ["SUPER_ADMIN"] };
  return {
    __esModule: true, 
    default: { getUser: () => mockUser },
    auth: { getUser: () => mockUser }
  };
});

jest.mock("@/services/roles-service", () => ({
  routePermissionsApi: { getMyPermissions: jest.fn().mockResolvedValue(["/:/v1/employees"]) }
}));

jest.mock("@/lib/notification-store", () => {
  const mockStore = {
    notifications: [],
    unreadCount: 0,
    fetchNotifications: jest.fn().mockResolvedValue([]),
    fetchUnreadCount: jest.fn().mockResolvedValue(0),
    markOneAsRead: jest.fn()
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockUseStore: any = () => mockStore;
  mockUseStore.getState = () => mockStore;
  return { useNotificationStore: mockUseStore };
});

jest.mock("@/providers/AuthProvider", () => ({
  useAuth: () => ({ logoutUser: jest.fn() }),
}))

jest.mock("@/lib/role-utils", () => ({
  isAdminUser: () => true,
}))

describe("Navbar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the navbar for admin user", () => {
    render(<Navbar />)
    
    expect(screen.getByText("Dashboard")).toBeInTheDocument()
    // It shouldn't render "Log out" text directly, it renders an icon for desktop.
    // The mobile menu renders "Log out" text, let's verify Dashboard first.
  })
})
