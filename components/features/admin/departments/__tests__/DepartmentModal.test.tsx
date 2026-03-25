import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DepartmentModal } from "@/components/features/admin/departments/DepartmentModal";
import { departmentService } from "@/services/department-service";
import { Department, DepartmentType } from "@/types/department-types";

jest.mock("@/services/department-service", () => ({
    departmentService: {
        getById: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    },
}));

jest.mock("@/lib/error-utils", () => ({
    extractErrorMessage: jest.fn((err) => err?.message || "Something went wrong"),
}));

const mockCreate = departmentService.create as jest.MockedFunction<typeof departmentService.create>;
const mockUpdate = departmentService.update as jest.MockedFunction<typeof departmentService.update>;
const mockGetById = departmentService.getById as jest.MockedFunction<typeof departmentService.getById>;

const departmentTypes: DepartmentType[] = [
    { department_type_id: "dt-1", type_name: "Business Unit", type_code: "BU" },
    { department_type_id: "dt-2", type_name: "Support", type_code: "SUP" },
];

const selectedDepartment: Department = {
    department_id: "dep-1",
    department_name: "Engineering",
    department_code: "ENG",
    department_type: { type_name: "Business Unit", type_code: "BU" },
    manager: null,
    is_active: true,
    created_at: "2025-01-01T00:00:00Z",
};

const defaultProps = {
    open: true,
    onClose: jest.fn(),
    onSuccess: jest.fn(),
    selectedDepartment: null as Department | null,
    departmentTypes,
};

describe("DepartmentModal", () => {
    beforeEach(() => jest.clearAllMocks());

    it("renders 'Add Department' title when no selectedDepartment", () => {
        render(<DepartmentModal {...defaultProps} />);
        expect(screen.getByText("Add Department")).toBeInTheDocument();
    });

    it("renders form fields (name, code, type select)", () => {
        render(<DepartmentModal {...defaultProps} />);
        expect(screen.getByPlaceholderText("e.g. Engineering")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("e.g. ENG001")).toBeInTheDocument();
        expect(screen.getByText("Select a type\u2026")).toBeInTheDocument();
    });

    it("renders 'Edit Department' title when selectedDepartment is provided", async () => {
        mockGetById.mockResolvedValue({
            ...selectedDepartment,
            employee_count: 5,
            updated_at: null,
        });

        render(
            <DepartmentModal
                {...defaultProps}
                selectedDepartment={selectedDepartment}
            />
        );

        expect(screen.getByText("Edit Department")).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText(/5 employees/)).toBeInTheDocument();
        });
    });

    it("calls departmentService.create on new department submit", async () => {
        mockCreate.mockResolvedValue(undefined as never);

        render(<DepartmentModal {...defaultProps} />);

        fireEvent.change(screen.getByPlaceholderText("e.g. Engineering"), {
            target: { value: "Marketing" },
        });
        fireEvent.change(screen.getByPlaceholderText("e.g. ENG001"), {
            target: { value: "mkt" },
        });

        fireEvent.submit(screen.getByPlaceholderText("e.g. Engineering").closest("form")!);

        await waitFor(() => {
            expect(mockCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    department_name: "Marketing",
                    department_code: "MKT",
                })
            );
        });

        expect(defaultProps.onSuccess).toHaveBeenCalled();
        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it("calls departmentService.update on edit submit", async () => {
        mockGetById.mockResolvedValue({
            ...selectedDepartment,
            employee_count: 3,
            updated_at: null,
        });
        mockUpdate.mockResolvedValue(undefined as never);

        render(
            <DepartmentModal
                {...defaultProps}
                selectedDepartment={selectedDepartment}
            />
        );

        await waitFor(() => {
            expect(screen.getByDisplayValue("Engineering")).toBeInTheDocument();
        });

        fireEvent.change(screen.getByDisplayValue("Engineering"), {
            target: { value: "Engineering v2" },
        });

        fireEvent.submit(screen.getByDisplayValue("Engineering v2").closest("form")!);

        await waitFor(() => {
            expect(mockUpdate).toHaveBeenCalledWith(
                "dep-1",
                expect.objectContaining({
                    department_name: "Engineering v2",
                    department_code: "ENG",
                })
            );
        });

        expect(defaultProps.onSuccess).toHaveBeenCalled();
        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it("shows error message on API failure", async () => {
        mockCreate.mockRejectedValue(new Error("Network error"));

        render(<DepartmentModal {...defaultProps} />);

        fireEvent.change(screen.getByPlaceholderText("e.g. Engineering"), {
            target: { value: "Sales" },
        });
        fireEvent.change(screen.getByPlaceholderText("e.g. ENG001"), {
            target: { value: "SAL" },
        });

        fireEvent.submit(screen.getByPlaceholderText("e.g. Engineering").closest("form")!);

        await waitFor(() => {
            expect(screen.getByText("Network error")).toBeInTheDocument();
        });

        expect(defaultProps.onSuccess).not.toHaveBeenCalled();
        expect(defaultProps.onClose).not.toHaveBeenCalled();
    });

    it("calls onClose when Cancel is clicked", () => {
        render(<DepartmentModal {...defaultProps} />);

        fireEvent.click(screen.getByText("Cancel"));

        expect(defaultProps.onClose).toHaveBeenCalled();
    });
});
