import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ReviewComposeForm from "../ReviewComposeForm"

// Mock sub-components to isolate form logic
jest.mock("../CategoryPicker", () => {
  const MockCategoryPicker = ({ selectedIds, onChange }: { selectedIds: string[], onChange: (ids: string[]) => void }) => (
    <div data-testid="mock-category-picker">
      <button onClick={() => onChange([...selectedIds, "cat-1"])}>Add Category</button>
    </div>
  );
  MockCategoryPicker.displayName = "MockCategoryPicker";
  return MockCategoryPicker;
});

jest.mock("../ReceiverPicker", () => {
  const MockReceiverPicker = ({ receiverId, onSelect }: { receiverId: string, onSelect: (id: string) => void }) => (
    <div data-testid="mock-receiver-picker">
      <select value={receiverId} onChange={(e) => onSelect(e.target.value)} data-testid="receiver-select">
        <option value="">Select receiver...</option>
        <option value="emp-1">John Doe</option>
      </select>
    </div>
  );
  MockReceiverPicker.displayName = "MockReceiverPicker";
  return MockReceiverPicker;
});

jest.mock("../ReviewWork", () => {
  const MockReviewWork = () => <div data-testid="mock-review-sidebar" />;
  MockReviewWork.displayName = "MockReviewWork";
  return MockReviewWork;
});

jest.mock("../ReviewSuccessView", () => {
  const MockReviewSuccessView = () => <div data-testid="mock-success-view" />;
  MockReviewSuccessView.displayName = "MockReviewSuccessView";
  return MockReviewSuccessView;
});

describe("ReviewComposeForm", () => {
  const defaultProps = {
    view: "compose" as const,
    allReceivers: [{ id: "emp-1", auth_id: "auth-1", first_name: "John", last_name: "Doe", email: "john@test.com", role: "EMPLOYEE", status: "ACTIVE", isManager: false } as unknown as Parameters<typeof ReviewComposeForm>[0]["allReceivers"][0]],
    receiverId: "",
    onReceiverChange: jest.fn(),
    reviewedThisMonth: new Set<string>(),
    categories: [
      { category_id: "cat-1", name: "Innovation", multiplier: 1, is_active: true } as unknown as Parameters<typeof ReviewComposeForm>[0]["categories"][0]
    ],
    categoryIds: [],
    onCategoryIdsChange: jest.fn(),
    comment: "",
    onCommentChange: jest.fn(),
    files: [],
    onFilesChange: jest.fn(),
    fileRef: { current: null },
    submitting: false,
    onSubmit: jest.fn(),
    givenThisMonth: 0,
    uniquePeopleCount: 0,
    totalReviews: 10,
    onToast: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders correctly in compose mode", () => {
    render(<ReviewComposeForm {...defaultProps} />)
    expect(screen.getByText("New Recognition")).toBeInTheDocument()
    expect(screen.getByTestId("mock-receiver-picker")).toBeInTheDocument()
    expect(screen.getByTestId("mock-category-picker")).toBeInTheDocument()
    expect(screen.getByRole("textbox", { name: /Your Feedback/i })).toBeInTheDocument()
  })

  it("renders success view when view is 'submitted'", () => {
    render(<ReviewComposeForm {...defaultProps} view="submitted" submittedData={{} as unknown as Parameters<typeof ReviewComposeForm>[0]["submittedData"]} />)
    expect(screen.getByTestId("mock-success-view")).toBeInTheDocument()
  })

  it("validates empty submission", async () => {
    render(<ReviewComposeForm {...defaultProps} />)

    const submitBtn = screen.getByRole("button", { name: /submit/i })
    expect(submitBtn).toBeDisabled()
    expect(defaultProps.onSubmit).not.toHaveBeenCalled()
  })

  it("validates receiver selection", async () => {
    const user = userEvent.setup()
    const onReceiverChange = jest.fn()
    render(<ReviewComposeForm {...defaultProps} onReceiverChange={onReceiverChange} />)

    await user.selectOptions(screen.getByTestId("receiver-select"), "emp-1")

    expect(onReceiverChange).toHaveBeenCalledWith("emp-1")
  })

  it("validates comment length", async () => {
    const user = userEvent.setup()
    render(<ReviewComposeForm {...defaultProps} comment="short" />)

    const textbox = screen.getByRole("textbox", { name: /Your Feedback/i })
    await user.click(textbox)
    await user.tab() // Blur

    expect(screen.getByText("Feedback must be at least 10 characters.")).toBeInTheDocument()
  })

  it("sanitizes injected characters", async () => {
    userEvent.setup()
    const onCommentChange = jest.fn()
    render(<ReviewComposeForm {...defaultProps} onCommentChange={onCommentChange} />)

    const textbox = screen.getByRole("textbox", { name: /Your Feedback/i })

    // Test that HTML tags are considered an injection attempt
    const injectionStr = "<script>alert(1)</script>"
    fireEvent.change(textbox, { target: { value: injectionStr } })

    expect(screen.getByText("Your feedback contains disallowed characters or patterns.")).toBeInTheDocument()
  })

  it("allows submission with valid data", async () => {
    const user = userEvent.setup()
    render(<ReviewComposeForm
      {...defaultProps}
      receiverId="emp-1"
      categoryIds={["cat-1"]}
      comment="This is a valid feedback comment with enough length."
    />)

    const submitBtn = screen.getByRole("button", { name: /submit/i })
    await user.click(submitBtn)

    expect(defaultProps.onSubmit).toHaveBeenCalled()
  })
})
