import React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import EmployeesPage from "../page"

jest.mock("@/components/shared/SuccessToast", () => ({
  useSuccessToast: () => ({ toasts: [], show: jest.fn() }),
  SuccessToastContainer: () => <div data-testid="mock-toast-container" />
}))

jest.mock("@/components/features/admin/shared/AdminControlPanelPageHeader", () => ({
  AdminPageHeader: ({ title }: { title: string }) => <div data-testid="mock-admin-header">{title}</div>
}))

jest.mock("@/components/features/admin/employees/EmployeeListSection", () => ({
  EmployeeListSection: () => <div data-testid="mock-employee-list-section" />
}))

jest.mock("@/components/features/admin/employees/BulkImportSection", () => ({
  BulkImportSection: () => <div data-testid="mock-bulk-import-section" />
}))

jest.mock("@/components/features/auth/ProtectedRoute", () => {
  const MockProtectedRoute = ({ children }: { children: React.ReactNode }) => <div data-testid="mock-protected-route">{children}</div>;
  MockProtectedRoute.displayName = "MockProtectedRoute";
  return {
    __esModule: true,
    default: MockProtectedRoute
  };
})

describe("EmployeesPage", () => {
  it("renders Employee Management header and ProtectedRoute", () => {
    render(<EmployeesPage />)
    expect(screen.getByTestId("mock-protected-route")).toBeInTheDocument()
    expect(screen.getByTestId("mock-admin-header")).toHaveTextContent("Employee Management")
  })

  it("renders EmployeeListSection by default", () => {
    render(<EmployeesPage />)
    expect(screen.getByTestId("mock-employee-list-section")).toBeInTheDocument()
    expect(screen.queryByTestId("mock-bulk-import-section")).not.toBeInTheDocument()
  })

  it("switches to BulkImportSection when Bulk Import tab is clicked", async () => {
    const user = userEvent.setup()
    render(<EmployeesPage />)
    
    await user.click(screen.getByText("Bulk Import"))
    
    expect(screen.getByTestId("mock-bulk-import-section")).toBeInTheDocument()
    expect(screen.queryByTestId("mock-employee-list-section")).not.toBeInTheDocument()
  })
})
