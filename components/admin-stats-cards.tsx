"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Gift, Link, Users } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"

export function AdminStatsCards() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSubmissions: 0,
    pendingRewards: 0,
    loading: true,
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get total users
        const usersSnapshot = await getDocs(collection(db, "users"))
        const totalUsers = usersSnapshot.size

        // Get total submissions
        const submissionsSnapshot = await getDocs(collection(db, "submissions"))
        const totalSubmissions = submissionsSnapshot.size

        // Get pending rewards
        const pendingRewardsQuery = query(
          collection(db, "rewards"),
          where("status", "==", "pending")
        )
        const pendingRewardsSnapshot = await getDocs(pendingRewardsQuery)

        setStats({
          totalUsers,
          totalSubmissions,
          pendingRewards: pendingRewardsSnapshot.size,
          loading: false,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
        setStats((prev) => ({ ...prev, loading: false }))
      }
    }

    fetchStats()
  }, [])

  if (stats.loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <Skeleton className="h-4 w-24" />
              </CardTitle>
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
          <Link className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Rewards</CardTitle>
          <Gift className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pendingRewards}</div>
        </CardContent>
      </Card>
    </div>
  )
}
