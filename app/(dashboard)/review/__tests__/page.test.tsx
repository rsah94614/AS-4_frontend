import React from "react"
import { render, screen } from "@testing-library/react"
import ReviewPage from "../page"
import { useReviewPage } from "@/hooks/useReviewPage"

jest.mock("@/components/shared/PageHeader", () => ({ PageHeader: () => <div data-testid="mock-page-header" /> }))
jest.mock("@/components/features/dashboard/review/ReviewComposeForm", () => {
  const MockComposeForm = () => <div data-testid="mock-compose-form" />;
  MockComposeForm.displayName = "MockComposeForm";
  return MockComposeForm;
});

jest.mock("@/components/features/dashboard/review/ReviewListSection", () => {
  const MockListSection = () => <div data-testid="mock-list-section" />;
  MockListSection.displayName = "MockListSection";
  return MockListSection;
});

jest.mock("@/components/features/dashboard/review/ReviewToast", () => {
  const MockToast = () => <div data-testid="mock-toast" />;
  MockToast.displayName = "MockToast";
  return MockToast;
});

jest.mock("@/components/features/dashboard/review/ReviewPageSkeleton", () => {
  const MockSkeleton = () => <div data-testid="mock-skeleton" />;
  MockSkeleton.displayName = "MockSkeleton";
  return MockSkeleton;
});

jest.mock("@/hooks/useReviewPage", () => ({
  useReviewPage: jest.fn(),
}))

jest.mock("@/hooks/useReviewerWeight", () => ({
  useReviewerWeight: () => ({ weight: 1.0 }),
}))

describe("ReviewPage", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders loading skeleton when data is loading and categories are empty", () => {
    ;(useReviewPage as jest.Mock).mockReturnValue({
      loadingData: true,
      categories: [],
      reviewedThisMonth: new Set(),
      toast: null,
    })

    render(<ReviewPage />)
    expect(screen.getByTestId("mock-skeleton")).toBeInTheDocument()
    expect(screen.queryByTestId("mock-compose-form")).not.toBeInTheDocument()
  })

  it("renders compose form and list section when data is loaded", () => {
    ;(useReviewPage as jest.Mock).mockReturnValue({
      loadingData: false,
      categories: [{ id: "1", name: "Innovation" }],
      reviewedThisMonth: new Set(),
      filteredReviews: [],
      toast: null,
    })

    render(<ReviewPage />)
    expect(screen.getByTestId("mock-compose-form")).toBeInTheDocument()
    expect(screen.getByTestId("mock-list-section")).toBeInTheDocument()
    expect(screen.queryByTestId("mock-skeleton")).not.toBeInTheDocument()
  })

  it("renders toast when toast state exists", () => {
    ;(useReviewPage as jest.Mock).mockReturnValue({
      loadingData: false,
      categories: [{ id: "1" }],
      reviewedThisMonth: new Set(),
      filteredReviews: [],
      toast: { msg: "Success!", kind: "success" },
    })

    render(<ReviewPage />)
    expect(screen.getByTestId("mock-toast")).toBeInTheDocument()
  })
})
