import type React from "react"
import type { Metadata } from "next"
import { SidebarProvider } from "@/components/ui/sidebar-provider"
import DashboardSidebar from "@/components/dashboard/sidebar"

export const metadata: Metadata = {
  title: "VirtuAId Dashboard",
  description: "Your AI-powered learning assistant",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Don't show the sidebar on the chat page
  const pathname = typeof window !== "undefined" ? window.location.pathname : ""
  const isChatPage = pathname.includes("/dashboard/chat")

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        {!isChatPage && <DashboardSidebar />}
        <main className={`flex-1 bg-gray-50 ${!isChatPage ? "" : "w-full"}`}>{children}</main>
      </div>
    </SidebarProvider>
  )
}

