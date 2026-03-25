import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ForgotPasswordPage from "../page"
import { forgotPassword } from "@/services/auth-service"

jest.mock("@/services/auth-service", () => ({
  forgotPassword: jest.fn(),
}))

jest.mock("next/image", () => {
  // eslint-disable-next-line @next/next/no-img-element
  const MockImage = () => <img alt="Mocked Image" />;
  MockImage.displayName = "MockImage";
  return MockImage;
});
jest.mock("next/link", () => {
  const MockLink = ({ children, href }: { children: React.ReactNode, href: string }) => <a href={href}>{children}</a>;
  MockLink.displayName = "MockLink";
  return MockLink;
});

describe("ForgotPasswordPage", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders correctly", () => {
    render(<ForgotPasswordPage />)
    expect(screen.getByText("Forgot your password?")).toBeInTheDocument()
    expect(screen.getByRole("textbox", { name: /Email/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Send reset link/i })).toBeInTheDocument()
  })

  it("validates empty email", async () => {
    const user = userEvent.setup()
    render(<ForgotPasswordPage />)

    const button = screen.getByRole("button", { name: /Send reset link/i })
    await user.click(button)

    expect(screen.getByText("Email address is required")).toBeInTheDocument()
    expect(forgotPassword).not.toHaveBeenCalled()
  })

  it("submits valid email and shows success state", async () => {
    const user = userEvent.setup()
    ;(forgotPassword as jest.Mock).mockResolvedValueOnce({ success: true })

    render(<ForgotPasswordPage />)

    const input = screen.getByRole("textbox", { name: /Email/i })
    await user.type(input, "test@hdfc.com")

    const button = screen.getByRole("button", { name: /Send reset link/i })
    await user.click(button)

    await waitFor(() => {
      expect(forgotPassword).toHaveBeenCalledWith("test@hdfc.com")
      expect(screen.getByText("Check your email")).toBeInTheDocument()
      expect(screen.getByText("test@hdfc.com")).toBeInTheDocument()
    })
  })

  it("shows error when submission fails", async () => {
    const user = userEvent.setup()
    ;(forgotPassword as jest.Mock).mockResolvedValueOnce({ success: false, error: "Email not found" })

    render(<ForgotPasswordPage />)

    const input = screen.getByRole("textbox", { name: /Email/i })
    await user.type(input, "nonexistent@hdfc.com")

    const button = screen.getByRole("button", { name: /Send reset link/i })
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByText("Email not found")).toBeInTheDocument()
    })
  })

  it("allows sending another email from success state", async () => {
    const user = userEvent.setup()
    ;(forgotPassword as jest.Mock).mockResolvedValueOnce({ success: true })

    render(<ForgotPasswordPage />)

    const input = screen.getByRole("textbox", { name: /Email/i })
    await user.type(input, "test@hdfc.com")
    await user.click(screen.getByRole("button", { name: /Send reset link/i }))

    await waitFor(() => {
      expect(screen.getByText("Check your email")).toBeInTheDocument()
    })

    const sendAnotherBtn = screen.getByRole("button", { name: /Send another email/i })
    await user.click(sendAnotherBtn)

    expect(screen.getByText("Forgot your password?")).toBeInTheDocument()
    expect(screen.getByRole("textbox", { name: /Email/i })).toHaveValue("")
  })
})
