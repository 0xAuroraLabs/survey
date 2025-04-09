"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/firebase"
import { collection, query, orderBy, getDocs, doc, updateDoc } from "firebase/firestore"
import { CheckCircle, XCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Submission {
  id: string
  name: string
  email: string
  city: string
  referredBy: string | null
  status: "pending" | "verified" | "rejected"
  createdAt: string
  type: string
  [key: string]: any
}

export function SurveyResponsesTable() {
  const { toast } = useToast()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const submissionsQuery = query(
          collection(db, "submissions"),
          orderBy("createdAt", "desc")
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

    fetchSubmissions()
  }, [])

  const filteredSubmissions = submissions.filter((submission) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      submission.name.toLowerCase().includes(searchLower) ||
      submission.email.toLowerCase().includes(searchLower) ||
      submission.city.toLowerCase().includes(searchLower)
    )
  })

  const handleVerify = async (id: string) => {
    try {
      const submissionRef = doc(db, "submissions", id);
      await updateDoc(submissionRef, {
        status: "verified"
      });

      setSubmissions(submissions.map((sub) => (sub.id === id ? { ...sub, status: "verified" } : sub)));

      toast({
        title: "Submission verified",
        description: "The submission has been marked as verified.",
      });
    } catch (error) {
      console.error("Error verifying submission:", error);
      toast({
        title: "Error",
        description: "Failed to verify submission.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (id: string) => {
    try {
      const submissionRef = doc(db, "submissions", id);
      await updateDoc(submissionRef, {
        status: "rejected"
      });

      setSubmissions(submissions.map((sub) => (sub.id === id ? { ...sub, status: "rejected" } : sub)));

      toast({
        title: "Submission rejected",
        description: "The submission has been marked as rejected.",
      });
    } catch (error) {
      console.error("Error rejecting submission:", error);
      toast({
        title: "Error",
        description: "Failed to reject submission.",
        variant: "destructive",
      });
    }
  };

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
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search by name, email, or city..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>City</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredSubmissions.map((submission) => (
            <TableRow key={submission.id}>
              <TableCell>{submission.name}</TableCell>
              <TableCell>{submission.email}</TableCell>
              <TableCell>{submission.city}</TableCell>
              <TableCell>{formatDate(submission.createdAt)}</TableCell>
              <TableCell>{getStatusBadge(submission.status)}</TableCell>
              <TableCell>
                <div className="flex justify-center space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedSubmission(submission)}
                      >
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Submission Details</DialogTitle>
                        <DialogDescription>
                          View detailed information about this submission
                        </DialogDescription>
                      </DialogHeader>
                      {selectedSubmission && (
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium">Basic Information</h4>
                            <p>Name: {selectedSubmission.name}</p>
                            <p>Email: {selectedSubmission.email}</p>
                            <p>City: {selectedSubmission.city}</p>
                            <p>Date: {formatDate(selectedSubmission.createdAt)}</p>
                            <p>Status: {selectedSubmission.status}</p>
                          </div>
                          {selectedSubmission.type === "pet-survey" && (
                            <div>
                              <h4 className="font-medium">Survey Responses</h4>
                              <p>Health Monitoring: {selectedSubmission.healthMonitoring}/5</p>
                              <p>Location Tracking: {selectedSubmission.locationTracking}/5</p>
                              <p>Activity Tracking: {selectedSubmission.activityTracking}/5</p>
                              <p>Feeding Reminders: {selectedSubmission.feedingReminders}/5</p>
                              <p>Environmental Sensors: {selectedSubmission.environmentalSensors}/5</p>
                              <p>Smart Alerts: {selectedSubmission.smartAlerts}/5</p>
                              <p>Mobile App Integration: {selectedSubmission.mobileAppIntegration}/5</p>
                              <p>Budget: {selectedSubmission.budget}</p>
                              <p>Recurring Costs: {selectedSubmission.recurringCosts}</p>
                              <p>Trust Level: {selectedSubmission.trustLevel}/5</p>
                              <p>Trust Factors: {selectedSubmission.trustFactors.join(", ")}</p>
                              {selectedSubmission.comments && (
                                <p>Comments: {selectedSubmission.comments}</p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  
                  {submission.status === "pending" && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-green-500" 
                        onClick={() => handleVerify(submission.id)}
                      >
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Verify
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-500" 
                        onClick={() => handleReject(submission.id)}
                      >
                        <XCircle className="mr-1 h-4 w-4" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
