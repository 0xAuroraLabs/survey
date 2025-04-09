import { redirect } from "next/navigation"
import { AdminAnalyticsDashboard } from "@/components/admin-analytics-dashboard"
import { getCurrentUser } from "@/lib/session"

export default async function AdminDashboardPage() {
  let user

  try {
    user = await getCurrentUser()
  } catch (error) {
    console.error("Error getting current user:", error)
    redirect("/admin/login")
  }

  if (!user) {
    redirect("/admin/login")
  }

  console.log("User role:", user.role)

  if (user.role !== "admin") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to access the admin dashboard.
          </p>
          <p className="text-muted-foreground mt-2">
            Please use the admin login page to access this section.
          </p>
          <a
            href="/admin/login"
            className="mt-4 inline-block bg-primary text-primary-foreground px-4 py-2 rounded"
          >
            Go to Admin Login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Analytics, user management, and survey responses</p>
      </div>

      <AdminAnalyticsDashboard />
    </div>
  )
}
