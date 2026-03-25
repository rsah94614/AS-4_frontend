import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DesignationModal } from "@/components/features/admin/designations/DesignationModal";
import { designationService } from "@/services/designation-service";

jest.mock("@/services/designation-service", () => ({
    designationService: {
        getById: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    },
}));

jest.mock("@/lib/error-utils", () => ({
    extractErrorMessage: jest.fn((err) => err?.message || "Something went wrong"),
}));

const mockCreate = designationService.create as jest.MockedFunction<typeof designationService.create>;
const mockGetById = designationService.getById as jest.MockedFunction<typeof designationService.getById>;

const defaultProps = {
    open: true,
    onClose: jest.fn(),
    onSuccess: jest.fn(),
    selectedDesignation: null,
};

describe("DesignationModal", () => {
    beforeEach(() => jest.clearAllMocks());

    it("renders 'Add Designation' title when no selectedDesignation", () => {
        render(<DesignationModal {...defaultProps} />);
        expect(screen.getByText("Add Designation")).toBeInTheDocument();
    });

    it("renders all form fields (name, code, level, description)", () => {
        render(<DesignationModal {...defaultProps} />);
        expect(screen.getByPlaceholderText("e.g. Senior Software Engineer")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("e.g. SR_SWE")).toBeInTheDocument();
        expect(screen.getByDisplayValue("1")).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText(/Brief summary of the role/i)
        ).toBeInTheDocument();
    });

    it("shows 'Edit Designation' when selectedDesignation is provided", async () => {
        const selected = {
            designation_id: "d1",
            designation_name: "Manager",
            designation_code: "MGR",
            level: 3,
        };

        mockGetById.mockResolvedValue({
            designation_id: "d1",
            designation_name: "Manager",
            designation_code: "MGR",
            level: 3,
            description: "Manages team",
            employee_count: 5,
            updated_at: new Date().toISOString(),
            is_active: true,
            created_at: new Date().toISOString(),
        });

        render(
            <DesignationModal {...defaultProps} selectedDesignation={selected as unknown as Parameters<typeof DesignationModal>[0]["selectedDesignation"]} />
        );

        expect(screen.getByText("Edit Designation")).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.getByText("5 employees assigned")).toBeInTheDocument();
        });
    });

    it("calls designationService.create on submit", async () => {
        mockCreate.mockResolvedValue({} as unknown as Awaited<ReturnType<typeof mockCreate>>);

        render(<DesignationModal {...defaultProps} />);

        fireEvent.change(screen.getByPlaceholderText("e.g. Senior Software Engineer"), {
            target: { value: "Lead Engineer" },
        });
        fireEvent.change(screen.getByPlaceholderText("e.g. SR_SWE"), {
            target: { value: "lead_eng" },
        });

        fireEvent.click(screen.getByText("Create"));

        await waitFor(() => {
            expect(mockCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    designation_name: "Lead Engineer",
                    designation_code: "LEAD_ENG",
                    level: 1,
                })
            );
        });
    });

    it("shows error on API failure", async () => {
        mockCreate.mockRejectedValue(new Error("Network error"));

        render(<DesignationModal {...defaultProps} />);

        fireEvent.change(screen.getByPlaceholderText("e.g. Senior Software Engineer"), {
            target: { value: "Test" },
        });
        fireEvent.change(screen.getByPlaceholderText("e.g. SR_SWE"), {
            target: { value: "TST" },
        });

        fireEvent.click(screen.getByText("Create"));

        await waitFor(() => {
            expect(screen.getByText("Network error")).toBeInTheDocument();
        });
    });

    it("calls onClose when Cancel is clicked", () => {
        render(<DesignationModal {...defaultProps} />);
        fireEvent.click(screen.getByText("Cancel"));
        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it("shows level error for level > 6", () => {
        render(<DesignationModal {...defaultProps} />);

        const levelInput = screen.getByDisplayValue("1");
        fireEvent.change(levelInput, { target: { value: "7" } });

        expect(screen.getByText("Maximum hierarchy level is 6.")).toBeInTheDocument();
    });
});
