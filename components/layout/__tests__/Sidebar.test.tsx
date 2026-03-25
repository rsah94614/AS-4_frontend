import React from "react"
import { render, screen } from "@testing-library/react"
import Sidebar from "../Sidebar"

jest.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}))

jest.mock("next/link", () => {
  const MockSidebarLink = ({ children, href, onClick }: { children: React.ReactNode, href: string, onClick?: () => void }) => {
    return (
      <a href={href} onClick={onClick}>
        {children}
      </a>
    )
  }
  MockSidebarLink.displayName = "MockSidebarLink";
  return MockSidebarLink;
});

jest.mock("next/image", () => {
  // eslint-disable-next-line @next/next/no-img-element
  const MockSidebarImage = () => <img alt="Mocked Image" />;
  MockSidebarImage.displayName = "MockSidebarImage";
  return MockSidebarImage;
});

jest.mock("@/providers/AuthProvider", () => ({
  useAuth: () => ({ logoutUser: jest.fn() }),
}))

jest.mock("@/lib/role-utils", () => ({
  isAdminUser: () => true,
}))

describe("Sidebar", () => {
  it("renders the sidebar with correct links for admin", () => {
    render(<Sidebar isOpen={true} onClose={jest.fn()} />)
    
    expect(screen.getByText("Dashboard")).toBeInTheDocument()
    expect(screen.getByText("Recognize")).toBeInTheDocument()
    expect(screen.getByText("Redeem")).toBeInTheDocument()
    expect(screen.getByText("Wallet")).toBeInTheDocument()
    expect(screen.getByText("History")).toBeInTheDocument()
    expect(screen.getByText("Control Panel")).toBeInTheDocument() // Admin only route
  })

  it("renders correctly when closed", () => {
    render(<Sidebar isOpen={false} onClose={jest.fn()} />)
    // The sidebar elements should still be in the document, just hidden via CSS translations.
    expect(screen.getByText("Dashboard")).toBeInTheDocument()
  })
})
