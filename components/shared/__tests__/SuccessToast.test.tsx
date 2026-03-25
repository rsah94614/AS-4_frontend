import React from "react"
import { render, screen } from "@testing-library/react"
import { SuccessToastContainer } from "../SuccessToast"

describe("SuccessToast", () => {
  it("renders success toasts correctly", () => {
    const toasts = [
      { id: 1, message: "Task completed!", type: "success" as const }
    ]
    render(<SuccessToastContainer toasts={toasts} />)
    expect(screen.getByText("Task completed!")).toBeInTheDocument()
  })

  it("renders error toasts correctly", () => {
    const toasts = [
      { id: 2, message: "Task failed!", type: "error" as const }
    ]
    render(<SuccessToastContainer toasts={toasts} />)
    expect(screen.getByText("Task failed!")).toBeInTheDocument()
  })

  it("renders multiple toasts", () => {
    const toasts = [
      { id: 1, message: "Success 1", type: "success" as const },
      { id: 2, message: "Error 2", type: "error" as const }
    ]
    render(<SuccessToastContainer toasts={toasts} />)
    expect(screen.getByText("Success 1")).toBeInTheDocument()
    expect(screen.getByText("Error 2")).toBeInTheDocument()
  })

  it("returns null when there are no toasts", () => {
    const { container } = render(<SuccessToastContainer toasts={[]} />)
    expect(container).toBeEmptyDOMElement()
  })
})
