import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminAnalyticsDashboard } from "@/components/admin-analytics-dashboard"
import { getCurrentUser } from "@/lib/session"

export default async function AdminAnalyticsPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Detailed insights into survey responses and user activity</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Survey Analytics</CardTitle>
          <CardDescription>Comprehensive analysis of survey responses and user engagement</CardDescription>
        </CardHeader>
        <CardContent>
          <AdminAnalyticsDashboard />
        </CardContent>
      </Card>
    </div>
  )
}
