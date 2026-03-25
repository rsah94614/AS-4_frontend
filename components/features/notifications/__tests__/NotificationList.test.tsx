import React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { NotificationList } from "../NotificationList"

describe("NotificationList", () => {
  const mockNotifications = [
    { notification_id: "notif-1", title: "Test Notification", message: "Hello world", type: "SYSTEM", is_read: false, created_at: new Date().toISOString() },
    { notification_id: "notif-2", title: "System Alert", message: "Update available", type: "SYSTEM", is_read: true, created_at: new Date().toISOString() },
  ]

  it("renders correctly with notifications", () => {
    render(<NotificationList notifications={mockNotifications as unknown as Parameters<typeof NotificationList>[0]["notifications"]} unreadCount={1} loading={false} onMarkRead={jest.fn()} />)
    
    expect(screen.getByText("1 Unread")).toBeInTheDocument()
    expect(screen.getByText("Test Notification")).toBeInTheDocument()
    expect(screen.getByText("System Alert")).toBeInTheDocument()
  })

  it("renders empty state when no notifications are present", () => {
    render(<NotificationList notifications={[]} unreadCount={0} loading={false} onMarkRead={jest.fn()} />)
    expect(screen.getByText("All Notifications")).toBeInTheDocument()
    expect(screen.getByText(/No notifications yet/i)).toBeInTheDocument()
  })

  it("calls onMarkRead when an unread notification is clicked", async () => {
    const user = userEvent.setup()
    const onMarkRead = jest.fn()
    render(<NotificationList notifications={mockNotifications as unknown as Parameters<typeof NotificationList>[0]["notifications"]} unreadCount={1} loading={false} onMarkRead={onMarkRead} />)
    
    await user.click(screen.getByText("Test Notification"))
    expect(onMarkRead).toHaveBeenCalledWith("notif-1")
  })
  
  it("does not call onMarkRead when a read notification is clicked", async () => {
    const user = userEvent.setup()
    const onMarkRead = jest.fn()
    render(<NotificationList notifications={mockNotifications as unknown as Parameters<typeof NotificationList>[0]["notifications"]} unreadCount={0} loading={false} onMarkRead={onMarkRead} />)
    
    await user.click(screen.getByText("System Alert"))
    expect(onMarkRead).not.toHaveBeenCalled()
  })
})
