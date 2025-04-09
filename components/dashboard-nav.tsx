"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { BarChart, Gift, Home, LinkIcon, Settings, Users, FileText, Award, PieChart } from "lucide-react"

interface DashboardNavProps {
  user: {
    role: string
  }
}

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname()
  const router = useRouter()

  // Custom handler for navigation to force refresh on specific routes
  const handleNavigation = (href: string, forceRefresh = false) => {
    if (forceRefresh) {
      // Force full refresh by changing the window location
      window.location.href = href
    } else {
      // Use Next.js router for standard navigation
      router.push(href)
    }
  }

  const routes = [
    {
      href: "/dashboard",
      label: "Overview",
      icon: Home,
      active: pathname === "/dashboard",
      forceRefresh: false,
    },
    {
      href: "/dashboard/rewards",
      label: "Rewards",
      icon: Gift,
      active: pathname === "/dashboard/rewards",
      forceRefresh: true,
    },
    {
      href: "/form",
      label: "Take Survey",
      icon: FileText,
      active: pathname === "/form",
      forceRefresh: false,
    },
    {
      href: "/dashboard/settings",
      label: "Settings",
      icon: Settings,
      active: pathname === "/dashboard/settings",
      forceRefresh: false,
    },
  ]

  // Admin-only routes
  const adminRoutes = [
    {
      href: "/dashboard/admin",
      label: "Admin Dashboard",
      icon: BarChart,
      active: pathname === "/dashboard/admin",
      forceRefresh: false,
    },
    {
      href: "/dashboard/admin/users",
      label: "Manage Users",
      icon: Users,
      active: pathname === "/dashboard/admin/users",
      forceRefresh: false,
    },
    {
      href: "/dashboard/admin/submissions",
      label: "Survey Responses",
      icon: FileText,
      active: pathname === "/dashboard/admin/submissions",
      forceRefresh: false,
    },
    {
      href: "/dashboard/admin/rewards",
      label: "Manage Rewards",
      icon: Award,
      active: pathname === "/dashboard/admin/rewards",
      forceRefresh: false,
    },
    {
      href: "/dashboard/admin/analytics",
      label: "Analytics",
      icon: PieChart,
      active: pathname === "/dashboard/admin/analytics",
      forceRefresh: false,
    },
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-center p-4">
        <div className="w-12 h-12">
          <Image 
            src="/images/without-bg.png" 
            alt="Auroral Labs Logo" 
            width={48} 
            height={48}
            className="w-full h-full"
          />
        </div>
      </div>
      <nav className="grid items-start px-2 py-4">
        {routes.map((route) => (
          <div
            key={route.href}
            onClick={() => handleNavigation(route.href, route.forceRefresh)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer",
              route.active ? "bg-accent text-accent-foreground" : "transparent",
            )}
          >
            <route.icon className="h-4 w-4" />
            {route.label}
          </div>
        ))}

        {user.role === "admin" && (
          <>
            <div className="my-2 px-3">
              <div className="text-xs font-medium">Admin</div>
            </div>
            {adminRoutes.map((route) => (
              <div
                key={route.href}
                onClick={() => handleNavigation(route.href, route.forceRefresh)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer",
                  route.active ? "bg-accent text-accent-foreground" : "transparent",
                )}
              >
                <route.icon className="h-4 w-4" />
                {route.label}
              </div>
            ))}
          </>
        )}
      </nav>
      <div className="mt-auto p-4">
        <div className="rounded-lg bg-muted p-3">
          <h3 className="text-sm font-medium">Auroral Labs</h3>
          <p className="text-xs text-muted-foreground mt-1">Enhancing pet lives through innovative technology</p>
        </div>
      </div>
    </div>
  )
}
