"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, MessageSquare, BookOpen, BarChart2, Settings, LogOut } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

const navItems = [
  {
    name: "Home",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "AI Chat",
    href: "/dashboard/chat",
    icon: MessageSquare,
  },
  {
    name: "Courses & Materials",
    href: "/dashboard/courses",
    icon: BookOpen,
  },
  {
    name: "Learning Insights",
    href: "/dashboard/insights",
    icon: BarChart2,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export default function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="border-r" variant="sidebar" collapsible="icon">
      <SidebarHeader className="bg-teal-500 text-white py-4">
        <div className="flex items-center justify-center">
          <span className="text-xl font-bold">VirtuAId</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-teal-500 text-white">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                className="hover:bg-teal-600 data-[active=true]:bg-purple-600"
              >
                <Link href={item.href} className="flex items-center">
                  <item.icon className="h-5 w-5 mr-2" />
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="bg-teal-500 text-white">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="hover:bg-teal-600">
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

