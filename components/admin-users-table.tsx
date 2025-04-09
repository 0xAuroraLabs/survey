"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, orderBy, query } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface User {
  uid: string
  displayName: string
  email: string
  role: string
  referralCount: number
  rewardsEarned: number
  rewardsClaimed: number
  createdAt: string
}

export function AdminUsersTable() {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const q = query(collection(db, "users"), orderBy("createdAt", "desc"))

        const querySnapshot = await getDocs(q)
        const usersData: User[] = []

        querySnapshot.forEach((doc) => {
          const data = doc.data()
          usersData.push({
            uid: doc.id,
            displayName: data.displayName || "Unknown User",
            email: data.email || "No Email",
            role: data.role || "user",
            referralCount: data.referralCount || 0,
            rewardsEarned: Math.floor((data.referralCount || 0) / 10),
            rewardsClaimed: data.rewardsClaimed || 0,
            createdAt: data.createdAt || new Date().toISOString(),
          })
        })

        setUsers(usersData)
      } catch (error) {
        console.error("Error fetching users:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  const exportToCsv = () => {
    try {
      // Create CSV content
      const headers = ["Name", "Email", "Role", "Referrals", "Rewards Earned", "Rewards Claimed", "Created At"]
      const csvContent = [
        headers.join(","),
        ...users.map((user) =>
          [
            `"${user.displayName}"`,
            `"${user.email}"`,
            `"${user.role}"`,
            user.referralCount,
            user.rewardsEarned,
            user.rewardsClaimed,
            `"${formatDate(user.createdAt)}"`,
          ].join(","),
        ),
      ].join("\n")

      // Create download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `users-export-${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Export successful",
        description: "Users data has been exported to CSV.",
      })
    } catch (error) {
      console.error("Error exporting to CSV:", error)
      toast({
        title: "Export failed",
        description: "Failed to export users data.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="flex justify-end pb-4">
          <Skeleton className="h-10 w-32" />
        </div>
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-end pb-4">
        <Button variant="outline" onClick={exportToCsv}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Referrals</TableHead>
            <TableHead className="text-right">Rewards</TableHead>
            <TableHead>Joined</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.uid}>
              <TableCell className="font-medium">{user.displayName}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                {user.role === "admin" ? (
                  <Badge variant="default">Admin</Badge>
                ) : (
                  <Badge variant="secondary">User</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">{user.referralCount}</TableCell>
              <TableCell className="text-right">
                {user.rewardsClaimed} / {user.rewardsEarned}
              </TableCell>
              <TableCell>{formatDate(user.createdAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
