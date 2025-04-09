import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminUsersTable } from "@/components/admin-users-table"
import { getCurrentUser } from "@/lib/session"

export default async function AdminUsersPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>
        <p className="text-muted-foreground">View and manage all users in the system</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>A list of all users and their referral counts</CardDescription>
        </CardHeader>
        <CardContent>
          <AdminUsersTable />
        </CardContent>
      </Card>
    </div>
  )
}
