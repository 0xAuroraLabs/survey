"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { db, collection, getDocs } from "@/lib/firebase"
import { Loader2, Users, UserCheck, UserX, Gift } from "lucide-react"
import { SurveyResponsesChart } from "@/components/survey-responses-chart"
import { SurveyResponsesTable } from "@/components/survey-responses-table"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function AdminAnalyticsDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    totalSubmissions: 0,
    submissionsByFeature: {} as Record<string, number>,
    submissionsByBudget: {} as Record<string, number>,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch users
        const usersSnapshot = await getDocs(collection(db, "users"))
        const totalUsers = usersSnapshot.size

        // For this demo, we'll consider users active if they have a lastLogin timestamp within the last 30 days
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        let activeUsers = 0
        usersSnapshot.forEach((doc) => {
          const userData = doc.data()
          if (userData.lastLogin && new Date(userData.lastLogin) > thirtyDaysAgo) {
            activeUsers++
          }
        })

        const inactiveUsers = totalUsers - activeUsers

        // Fetch submissions
        const submissionsSnapshot = await getDocs(collection(db, "submissions"))
        const totalSubmissions = submissionsSnapshot.size

        // Analyze submissions by feature importance
        const submissionsByFeature: Record<string, number> = {
          healthMonitoring: 0,
          locationTracking: 0,
          activityTracking: 0,
          feedingReminders: 0,
          environmentalSensors: 0,
          smartAlerts: 0,
          mobileAppIntegration: 0,
        }

        // Analyze submissions by budget
        const submissionsByBudget: Record<string, number> = {
          "less-than-6000": 0,
          "6000-8000": 0,
          "8000-10000": 0,
          "more-than-10000": 0,
        }

        // Count total ratings for each feature
        let featureTotalCount = 0

        submissionsSnapshot.forEach((doc) => {
          const data = doc.data()

          // Count budget preferences
          if (data.budget && submissionsByBudget[data.budget] !== undefined) {
            submissionsByBudget[data.budget]++
          }

          // Sum up feature ratings (we'll calculate averages later)
          Object.keys(submissionsByFeature).forEach((feature) => {
            if (data[feature]) {
              submissionsByFeature[feature] += Number.parseInt(data[feature])
              featureTotalCount++
            }
          })
        })

        // Calculate average ratings
        if (featureTotalCount > 0) {
          Object.keys(submissionsByFeature).forEach((feature) => {
            submissionsByFeature[feature] = Math.round((submissionsByFeature[feature] / totalSubmissions) * 100) / 100
          })
        }

        setStats({
          totalUsers,
          activeUsers,
          inactiveUsers,
          totalSubmissions,
          submissionsByFeature,
          submissionsByBudget,
        })
      } catch (error) {
        console.error("Error fetching analytics data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">Total registered users in the system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">Users active in the last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inactiveUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">Users not active in the last 30 days</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="responses">Survey Responses</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Survey Response Summary</CardTitle>
              <CardDescription>Overview of all survey responses and key metrics</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <SurveyResponsesChart />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="responses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Survey Responses</CardTitle>
              <CardDescription>Individual survey responses with detailed information</CardDescription>
            </CardHeader>
            <CardContent>
              <SurveyResponsesTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Rewards Management</CardTitle>
                <CardDescription>Manage reward distribution and claims</CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/admin/rewards">
                  <Gift className="mr-2 h-4 w-4" />
                  Manage Rewards
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-dashed p-8 text-center">
                <h3 className="font-medium mb-2">Rewards Management</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Review and manage reward claims from the dedicated rewards management page.
                </p>
                <Button asChild variant="default" size="sm">
                  <Link href="/dashboard/admin/rewards">Go to Rewards Dashboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
