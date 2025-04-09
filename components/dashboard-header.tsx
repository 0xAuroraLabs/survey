"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { UserNav } from "@/components/user-nav"

interface DashboardHeaderProps {
  user: {
    role: string
  }
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <a href="/" className="mr-6 flex items-center space-x-2">
            <div className="w-10 h-10">
              <Image 
                src="/images/without-bg.png" 
                alt="Aurora Labs Logo" 
                width={40} 
                height={40}
                className="w-full h-full"
              />
            </div>
            <span className="font-bold text-aurora">Aurora Labs</span>
          </a>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <div 
              onClick={() => handleNavigation("/dashboard", false)}
              className="transition-colors hover:text-aurora cursor-pointer"
            >
              Dashboard
            </div>
            <div 
              onClick={() => handleNavigation("/dashboard/rewards", true)}
              className="transition-colors hover:text-aurora cursor-pointer"
            >
              Rewards
            </div>
            {user.role === "admin" && (
              <div 
                onClick={() => handleNavigation("/dashboard/admin", false)}
                className="transition-colors hover:text-aurora cursor-pointer"
              >
                Admin
              </div>
            )}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <UserNav user={user} />
          </div>
        </div>
      </div>
    </header>
  )
} 