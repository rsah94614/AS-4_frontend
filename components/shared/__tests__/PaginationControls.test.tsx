import React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import PaginationControls from "../PaginationControls"

describe("PaginationControls", () => {
  it("renders correctly with multiple pages", () => {
    render(<PaginationControls currentPage={2} totalPages={5} onPageChange={jest.fn()} />)
    
    expect(screen.getByText("1")).toBeInTheDocument()
    expect(screen.getByText("2")).toBeInTheDocument()
    expect(screen.getByText("5")).toBeInTheDocument()
  })

  it("does not render when totalPages is 1", () => {
    const { container } = render(<PaginationControls currentPage={1} totalPages={1} onPageChange={jest.fn()} />)
    expect(container).toBeEmptyDOMElement()
  })

  it("renders ellipses when totalPages > 5", () => {
    render(<PaginationControls currentPage={5} totalPages={10} onPageChange={jest.fn()} />)
    
    // We should see ellipses when current page is in the middle of a large list
    const ellipses = screen.getAllByText("...")
    expect(ellipses.length).toBeGreaterThan(0)
    expect(screen.getByText("5")).toBeInTheDocument()
    expect(screen.getByText("10")).toBeInTheDocument()
  })

  it("calls onPageChange when a page number is clicked", async () => {
    const user = userEvent.setup()
    const onPageChange = jest.fn()
    render(<PaginationControls currentPage={1} totalPages={5} onPageChange={onPageChange} />)
    
    await user.click(screen.getByText("3"))
    expect(onPageChange).toHaveBeenCalledWith(3)
  })

  it("calls onPageChange with correct values for next/prev buttons", async () => {
    const user = userEvent.setup()
    const onPageChange = jest.fn()
    render(<PaginationControls currentPage={3} totalPages={5} onPageChange={onPageChange} />)
    
    const buttons = screen.getAllByRole("button")
    const prevButton = buttons[0]
    const nextButton = buttons[buttons.length - 1]

    await user.click(prevButton)
    expect(onPageChange).toHaveBeenCalledWith(2)

    await user.click(nextButton)
    expect(onPageChange).toHaveBeenCalledWith(4)
  })
})
