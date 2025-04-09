import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminSubmissionsTable } from "@/components/admin-submissions-table"
import { getCurrentUser } from "@/lib/session"

export default async function AdminSubmissionsPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tighter">Survey Submissions</h1>
        <p className="text-muted-foreground">View, manage, and export all survey submissions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Submissions</CardTitle>
          <CardDescription>A list of all survey submissions with referral information</CardDescription>
        </CardHeader>
        <CardContent>
          <AdminSubmissionsTable />
        </CardContent>
      </Card>
    </div>
  )
}
