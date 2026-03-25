import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import NotificationsPage from "../page"
import { useNotifications } from "@/hooks/useNotifications"
import { getRolesFromToken } from "@/lib/role-utils"

jest.mock("@/hooks/useNotifications", () => ({
  useNotifications: jest.fn(),
}))

jest.mock("@/lib/role-utils", () => ({
  getRolesFromToken: jest.fn(),
}))

jest.mock("@/components/features/notifications/AnnouncementPanel", () => ({ AnnouncementPanel: () => <div data-testid="mock-announcement-panel" /> }))
jest.mock("@/components/features/notifications/DigestPanel", () => ({ DigestPanel: () => <div data-testid="mock-digest-panel" /> }))
jest.mock("@/components/features/notifications/NotificationList", () => ({ NotificationList: () => <div data-testid="mock-notification-list" /> }))
jest.mock("@/components/features/notifications/notifications-shared", () => ({
  AdminPanel: ({ children, label }: { children: React.ReactNode; label: string }) => <div data-testid={`mock-admin-panel-${label}`}>{children}</div>
}))

describe("NotificationsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useNotifications as jest.Mock).mockReturnValue({
      notifications: [],
      unreadCount: 0,
      loading: false,
      error: null,
      markOne: jest.fn(),
      markAll: jest.fn(),
      reload: jest.fn(),
    })
  })

  it("renders correctly for employee (no admin panels)", async () => {
    ;(getRolesFromToken as jest.Mock).mockReturnValue(["EMPLOYEE"])
    render(<NotificationsPage />)
    
    expect(screen.getByText("Notifications")).toBeInTheDocument()
    expect(screen.getByTestId("mock-notification-list")).toBeInTheDocument()
    expect(screen.queryByText("Admin Controls")).not.toBeInTheDocument()
  })

  it("renders admin panels for SUPER_ADMIN", async () => {
    ;(getRolesFromToken as jest.Mock).mockReturnValue(["SUPER_ADMIN"])
    render(<NotificationsPage />)
    
    await waitFor(() => {
      expect(screen.getByText("Admin Controls")).toBeInTheDocument()
      expect(screen.getByTestId("mock-admin-panel-Send Announcement")).toBeInTheDocument()
      expect(screen.getByTestId("mock-admin-panel-Recognition Digest")).toBeInTheDocument()
    })
  })

  it("shows error alert when hook returns an error", () => {
    ;(getRolesFromToken as jest.Mock).mockReturnValue(["EMPLOYEE"])
    ;(useNotifications as jest.Mock).mockReturnValue({
      notifications: [],
      unreadCount: 0,
      loading: false,
      error: "Failed to load notifications",
      markOne: jest.fn(),
      markAll: jest.fn(),
      reload: jest.fn(),
    })
    
    render(<NotificationsPage />)
    expect(screen.getByText("Failed to load notifications")).toBeInTheDocument()
  })
})
