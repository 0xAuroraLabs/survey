"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { db } from "@/lib/firebase"
import { collection, query, orderBy, getDocs, limit, doc, updateDoc } from "firebase/firestore"

interface Submission {
  id: string
  name: string
  email: string
  referredBy: string | null
  status: "pending" | "verified" | "rejected"
  createdAt: string
}

export function AdminRecentSubmissions() {
  const { toast } = useToast()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSubmissions = async () => {
    try {
      // Query recent submissions
      const submissionsQuery = query(
        collection(db, "submissions"),
        orderBy("createdAt", "desc"),
        limit(5)
      )

      const querySnapshot = await getDocs(submissionsQuery)
      const submissionsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Submission[]

      setSubmissions(submissionsData)
    } catch (error) {
      console.error("Error fetching submissions:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date)
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

  const handleVerify = async (id: string) => {
    try {
      const submissionRef = doc(db, "submissions", id)
      await updateDoc(submissionRef, {
        status: "verified"
      })

      setSubmissions(submissions.map((sub) => (sub.id === id ? { ...sub, status: "verified" } : sub)))

      toast({
        title: "Submission verified",
        description: "The submission has been marked as verified.",
      })
    } catch (error) {
      console.error("Error verifying submission:", error)
      toast({
        title: "Error",
        description: "Failed to verify submission.",
        variant: "destructive",
      })
    }
  }

  const handleReject = async (id: string) => {
    try {
      const submissionRef = doc(db, "submissions", id)
      await updateDoc(submissionRef, {
        status: "rejected"
      })

      setSubmissions(submissions.map((sub) => (sub.id === id ? { ...sub, status: "rejected" } : sub)))

      toast({
        title: "Submission rejected",
        description: "The submission has been marked as rejected.",
      })
    } catch (error) {
      console.error("Error rejecting submission:", error)
      toast({
        title: "Error",
        description: "Failed to reject submission.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (submissions.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">No submissions yet.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {submissions.map((submission) => (
        <div key={submission.id} className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="space-y-1">
              <p className="font-medium">{submission.name}</p>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-muted-foreground">{submission.email}</p>
                <p className="text-xs text-muted-foreground">{formatDate(submission.createdAt)}</p>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusBadge(submission.status)}
                {submission.referredBy && (
                  <p className="text-xs text-muted-foreground">
                    Referred by: {submission.referredBy.substring(0, 8)}...
                  </p>
                )}
              </div>
            </div>
          </div>

          {submission.status === "pending" && (
            <div className="flex space-x-2">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleVerify(submission.id)}>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="sr-only">Verify</span>
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleReject(submission.id)}>
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="sr-only">Reject</span>
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
