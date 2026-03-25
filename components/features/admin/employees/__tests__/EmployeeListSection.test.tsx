import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import { EmployeeListSection } from "../EmployeeListSection"
import { employeesClient, orgClient } from "@/services/api-clients"

jest.mock("@/services/api-clients", () => ({
  employeesClient: {
    get: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
  },
  orgClient: {
    get: jest.fn(),
  }
}))

jest.mock("../../shared/HowItWorks", () => {
  const MockHowItWorks = () => <div data-testid="mock-how-it-works" />;
  MockHowItWorks.displayName = "MockHowItWorks";
  return MockHowItWorks;
});

jest.mock("@/components/features/admin/shared/AdminSearchBar", () => {
  const MockSearchBar = () => <div data-testid="mock-search-bar" />;
  MockSearchBar.displayName = "MockSearchBar";
  return { AdminSearchBar: MockSearchBar };
});

jest.mock("@/components/shared/PaginationControls", () => {
  const MockPagination = () => <div data-testid="mock-pagination" />;
  MockPagination.displayName = "MockPagination";
  return MockPagination;
});

jest.mock("../ConfirmDeactivateDialog", () => {
  const MockConfirmDialog = () => <div data-testid="mock-confirm-dialog" />;
  MockConfirmDialog.displayName = "MockConfirmDialog";
  return { ConfirmDeactivateDialog: MockConfirmDialog };
});

jest.mock("../CreateEmployeeDialog", () => {
  const MockCreateDialog = () => <div data-testid="mock-create-dialog" />;
  MockCreateDialog.displayName = "MockCreateDialog";
  return { CreateEmployeeDialog: MockCreateDialog };
});

jest.mock("../EmployeeDetailDialog", () => {
  const MockDetailDialog = () => <div data-testid="mock-detail-dialog" />;
  MockDetailDialog.displayName = "MockDetailDialog";
  return { EmployeeDetailDialog: MockDetailDialog };
});

jest.mock("../StatusBadge", () => {
  const MockStatusBadge = () => <div data-testid="mock-status-badge" />;
  MockStatusBadge.displayName = "MockStatusBadge";
  return { StatusBadge: MockStatusBadge };
});

describe("EmployeeListSection", () => {
  const mockToast = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock successful meta data fetch
    ;(orgClient.get as jest.Mock)
      .mockResolvedValueOnce({ data: { data: [{ designation_id: "d1", designation_name: "Manager" }] } }) // designations
      .mockResolvedValueOnce({ data: { data: [{ department_id: "dept1", department_name: "Engineering" }] } }) // departments

    // Mock successful list fetch
    ;(employeesClient.get as jest.Mock).mockImplementation((url: string) => {
      if (url === "/list") {
        return Promise.resolve({
          data: {
            data: [
              { employee_id: "emp1", username: "Alice", email: "alice@test.com", is_active: true, date_of_joining: "2024-01-01" },
              { employee_id: "emp2", username: "Bob", email: "bob@test.com", is_active: false, date_of_joining: "2024-02-01" },
            ],
            pagination: { total: 2, total_pages: 1, has_previous: false, has_next: false }
          }
        })
      }
      return Promise.resolve({ data: {} })
    })
  })

  it("renders correctly with loaded data", async () => {
    render(<EmployeeListSection toast={mockToast} />)
    
    expect(screen.getByText("Employees")).toBeInTheDocument()
    
    // Header should be visible immediately, table will load
    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument()
      expect(screen.getByText("alice@test.com")).toBeInTheDocument()
      expect(screen.getByText("Bob")).toBeInTheDocument()
    })
  })

  it("shows zero state when no employees are returned", async () => {
    ;(employeesClient.get as jest.Mock).mockResolvedValue({
      data: {
        data: [],
        pagination: { total: 0, total_pages: 0, has_previous: false, has_next: false }
      }
    })
    
    render(<EmployeeListSection toast={mockToast} />)
    
    await waitFor(() => {
      expect(screen.getByText("No employees yet")).toBeInTheDocument()
    })
  })
})
