import type React from "react"
import { redirect } from "next/navigation"
import Image from "next/image"
import { DashboardNav } from "@/components/dashboard-nav"
import { UserNav } from "@/components/user-nav"
import { getCurrentUser } from "@/lib/session"
import { DashboardHeader } from "@/components/dashboard-header"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Try to get the current user
  let user

  try {
    user = await getCurrentUser()
  } catch (error) {
    console.error("Error getting current user in dashboard layout:", error)
    redirect("/")
  }

  // If no user is found, redirect to home
  if (!user) {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} />
      <div className="grid flex-1 md:grid-cols-[220px_1fr]">
        <aside className="hidden border-r bg-muted/40 md:block">
          <DashboardNav user={user} />
        </aside>
        <main className="flex flex-col p-6">{children}</main>
      </div>
    </div>
  )
}
