import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RewardModal } from "../RewardModal";
import { rewardsClient } from "@/services/api-clients";
import { extractErrorMessage } from "@/lib/error-utils";
import { Category, RewardItem } from "@/types/reward-types";

jest.mock("@/services/api-clients", () => ({
    rewardsClient: {
        post: jest.fn(),
        patch: jest.fn(),
    },
}));

jest.mock("@/lib/error-utils", () => ({
    extractErrorMessage: jest.fn((_err, fallback) => fallback || "Something went wrong"),
}));

const mockPost = rewardsClient.post as jest.MockedFunction<typeof rewardsClient.post>;
const mockPatch = rewardsClient.patch as jest.MockedFunction<typeof rewardsClient.patch>;

const mockCategories: Category[] = [
    {
        category_id: "cat-1",
        category_name: "Gift Cards",
        category_code: "GC",
        is_active: true,
        created_at: "2025-01-01T00:00:00Z",
    },
    {
        category_id: "cat-2",
        category_name: "Experiences",
        category_code: "EXP",
        is_active: true,
        created_at: "2025-01-01T00:00:00Z",
    },
];

const mockItem: RewardItem = {
    catalog_id: "rew-1",
    reward_name: "Amazon Gift Card $50",
    reward_code: "REW-AMZ-50",
    description: "A gift card for Amazon",
    default_points: 200,
    min_points: 200,
    max_points: 200,
    is_active: true,
    created_at: "2025-01-01T00:00:00Z",
    stock_status: "in_stock",
    available_stock: 10,
    category: {
        category_id: "cat-1",
        category_name: "Gift Cards",
        category_code: "GC",
    },
};

const defaultProps = {
    categories: mockCategories,
    isOpen: true,
    onClose: jest.fn(),
    onSave: jest.fn(),
};

describe("RewardModal", () => {
    beforeEach(() => jest.clearAllMocks());

    it("returns null when isOpen is false", () => {
        const { container } = render(
            <RewardModal {...defaultProps} isOpen={false} />
        );
        expect(container.innerHTML).toBe("");
    });

    it("renders 'Create Reward' title when no item is provided", () => {
        render(<RewardModal {...defaultProps} />);
        expect(screen.getByText("Create Reward")).toBeInTheDocument();
    });

    it("shows category and reward code fields in create mode", () => {
        render(<RewardModal {...defaultProps} />);
        expect(screen.getAllByText(/category/i)[0]).toBeInTheDocument();
        expect(screen.getByText(/reward code/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText("e.g. REW-AMZ-50")).toBeInTheDocument();
    });

    it("renders 'Update Reward' title when item is provided", () => {
        render(<RewardModal {...defaultProps} item={mockItem} />);
        expect(screen.getByText("Update Reward")).toBeInTheDocument();
    });

    it("hides category, code, and stock in edit mode and shows status toggle", () => {
        render(<RewardModal {...defaultProps} item={mockItem} />);
        expect(screen.queryByText(/reward code/i)).not.toBeInTheDocument();
        expect(screen.queryByPlaceholderText("e.g. REW-AMZ-50")).not.toBeInTheDocument();
        expect(screen.queryByText(/initial stock/i)).not.toBeInTheDocument();
        expect(screen.getByText("Status")).toBeInTheDocument();
        expect(screen.getByText("Active")).toBeInTheDocument();
    });

    it("calls onClose when Cancel is clicked", () => {
        render(<RewardModal {...defaultProps} />);
        fireEvent.click(screen.getByText("Cancel"));
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it("calls rewardsClient.post on create submit", async () => {
        mockPost.mockResolvedValueOnce({ data: {} } as never);
        render(<RewardModal {...defaultProps} />);

        fireEvent.change(screen.getByPlaceholderText("e.g. Amazon Gift Card $50"), {
            target: { value: "Test Reward" },
        });
        fireEvent.change(screen.getByPlaceholderText("e.g. REW-AMZ-50"), {
            target: { value: "TEST-CODE" },
        });

        fireEvent.click(screen.getByText("Create"));

        await waitFor(() => {
            expect(mockPost).toHaveBeenCalledTimes(1);
            expect(mockPost).toHaveBeenCalledWith("/catalog", expect.objectContaining({
                reward_name: "Test Reward",
                reward_code: "TEST-CODE",
            }));
        });

        expect(defaultProps.onSave).toHaveBeenCalledTimes(1);
    });

    it("calls rewardsClient.patch on edit submit", async () => {
        mockPatch.mockResolvedValueOnce({ data: {} } as never);
        render(<RewardModal {...defaultProps} item={mockItem} />);

        fireEvent.change(screen.getByDisplayValue("Amazon Gift Card $50"), {
            target: { value: "Updated Reward" },
        });

        fireEvent.click(screen.getByText("Update"));

        await waitFor(() => {
            expect(mockPatch).toHaveBeenCalledTimes(1);
            expect(mockPatch).toHaveBeenCalledWith(
                `/catalog/${mockItem.catalog_id}`,
                expect.objectContaining({
                    reward_name: "Updated Reward",
                })
            );
        });

        expect(defaultProps.onSave).toHaveBeenCalledTimes(1);
    });

    it("shows error message on API failure", async () => {
        mockPost.mockRejectedValueOnce(new Error("Network error"));
        render(<RewardModal {...defaultProps} />);

        fireEvent.change(screen.getByPlaceholderText("e.g. Amazon Gift Card $50"), {
            target: { value: "Test Reward" },
        });
        fireEvent.change(screen.getByPlaceholderText("e.g. REW-AMZ-50"), {
            target: { value: "TEST-CODE" },
        });

        fireEvent.click(screen.getByText("Create"));

        await waitFor(() => {
            expect(screen.getByText("Request failed")).toBeInTheDocument();
        });

        expect(extractErrorMessage).toHaveBeenCalled();
        expect(defaultProps.onSave).not.toHaveBeenCalled();
    });
});
