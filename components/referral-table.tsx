"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { db } from "@/lib/firebase"
import { collection, query, where, orderBy, getDocs, onSnapshot, limit } from "firebase/firestore"

interface Submission {
  id: string
  name: string
  email: string
  status: "pending" | "verified" | "rejected"
  createdAt: string
  referredBy?: string
}

interface ReferralTableProps {
  userId: string
}

export function ReferralTable({ userId }: ReferralTableProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      console.error("ReferralTable: userId is missing")
      setError("Unable to load referrals: missing user ID")
      setLoading(false)
      return
    }

    console.log(`Setting up referrals listener for user: ${userId}`)
    
    try {
      // Set up a real-time listener for submissions
      const submissionsQuery = query(
        collection(db, "submissions"),
        where("referredBy", "==", userId),
        orderBy("createdAt", "desc"),
        limit(50) // Increased limit to ensure we catch all submissions
      )

      const unsubscribe = onSnapshot(submissionsQuery, (snapshot) => {
        const submissionsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Submission[]
        
        setSubmissions(submissionsData)
        setLoading(false)
        setError(null)
        
        console.log("Real-time referrals updated:", {
          userId,
          count: submissionsData.length,
          submissions: submissionsData.map(s => ({ 
            id: s.id,
            name: s.name, 
            email: s.email,
            createdAt: s.createdAt,
            status: s.status
          }))
        })
      }, (error) => {
        console.error("Error in referrals listener:", error)
        setError(`Failed to load referrals: ${error.message}`)
        setLoading(false)
      })

      // Clean up listener
      return () => {
        console.log("Cleaning up referrals listener")
        unsubscribe()
      }
    } catch (err) {
      console.error("Error setting up referrals listener:", err)
      setError(`Error setting up referrals listener: ${err instanceof Error ? err.message : String(err)}`)
      setLoading(false)
    }
  }, [userId])

  const formatDate = (dateString: any) => {
    try {
      if (!dateString) return "No date";
      
      // Handle both timestamp objects and string dates
      let date: Date;
      if (typeof dateString === 'object' && dateString.toDate) {
        date = dateString.toDate();
      } else {
        date = new Date(dateString);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric"
      }).format(date);
    } catch (err) {
      console.error("Error formatting date:", dateString, err);
      return "Invalid date";
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge variant="default">Verified</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed border-destructive">
        <div className="text-center">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      </div>
    )
  }

  if (submissions.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">No referrals yet. Share your link to get started!</p>
        </div>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {submissions.map((submission) => (
          <TableRow key={submission.id}>
            <TableCell className="font-medium">{submission.name}</TableCell>
            <TableCell>{submission.email}</TableCell>
            <TableCell>{formatDate(submission.createdAt)}</TableCell>
            <TableCell>{getStatusBadge(submission.status)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
