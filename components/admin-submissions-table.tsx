"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { collection, getDocs, orderBy, query, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Download, Edit, Eye, MoreHorizontal, Trash } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Submission {
  id: string
  name: string
  email: string
  city?: string
  phone?: string
  rating?: string
  feedback?: string
  referredBy: string | null
  status: "pending" | "verified" | "rejected"
  createdAt: string
  type?: string
  [key: string]: any // Allow for dynamic fields
}

export function AdminSubmissionsTable() {
  const { toast } = useToast()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editFormData, setEditFormData] = useState<any>({})

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const q = query(collection(db, "submissions"), orderBy("createdAt", "desc"))

        const querySnapshot = await getDocs(q)
        const submissionsData: Submission[] = []

        querySnapshot.forEach((doc) => {
          const data = doc.data()
          submissionsData.push({
            id: doc.id,
            name: data.name || "",
            email: data.email || "",
            city: data.city || "",
            phone: data.phone || "",
            rating: data.rating || "",
            feedback: data.feedback || "",
            referredBy: data.referredBy || null,
            status: data.status || "pending",
            createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
            type: data.type || "general",
            ...data, // Include all other fields
          })
        })

        setSubmissions(submissionsData)
      } catch (error) {
        console.error("Error fetching submissions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSubmissions()
  }, [])

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
        minute: "numeric",
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

  const handleViewSubmission = (submission: Submission) => {
    setSelectedSubmission(submission)
    setIsViewOpen(true)
  }

  const handleEditSubmission = (submission: Submission) => {
    setSelectedSubmission(submission)
    setEditFormData(submission)
    setIsEditOpen(true)
  }

  const handleDeleteSubmission = async (id: string) => {
    if (confirm("Are you sure you want to delete this submission? This action cannot be undone.")) {
      try {
        await deleteDoc(doc(db, "submissions", id))
        setSubmissions(submissions.filter((sub) => sub.id !== id))
        toast({
          title: "Submission deleted",
          description: "The submission has been permanently deleted.",
        })
      } catch (error) {
        console.error("Error deleting submission:", error)
        toast({
          title: "Error",
          description: "Failed to delete submission.",
          variant: "destructive",
        })
      }
    }
  }

  const handleUpdateSubmission = async () => {
    if (!selectedSubmission) return

    try {
      await updateDoc(doc(db, "submissions", selectedSubmission.id), editFormData)

      // Update the local state
      setSubmissions(submissions.map((sub) => (sub.id === selectedSubmission.id ? { ...sub, ...editFormData } : sub)))

      setIsEditOpen(false)
      toast({
        title: "Submission updated",
        description: "The submission has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating submission:", error)
      toast({
        title: "Error",
        description: "Failed to update submission.",
        variant: "destructive",
      })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData((prev: any) => ({ ...prev, [name]: value }));
  }

  const exportToCsv = () => {
    try {
      // Create CSV content
      const headers = ["Name", "Email", "City", "Type", "Referred By", "Status", "Date"]
      const csvContent = [
        headers.join(","),
        ...submissions.map((sub) =>
          [
            `"${sub.name}"`,
            `"${sub.email}"`,
            `"${sub.city || ""}"`,
            `"${sub.type || "general"}"`,
            sub.referredBy ? `"${sub.referredBy}"` : "",
            `"${sub.status}"`,
            `"${formatDate(sub.createdAt)}"`,
          ].join(","),
        ),
      ].join("\n")

      // Create download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `auroral-labs-submissions-${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Export successful",
        description: "Submissions data has been exported to CSV.",
      })
    } catch (error) {
      console.error("Error exporting to CSV:", error)
      toast({
        title: "Export failed",
        description: "Failed to export submissions data.",
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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Referred By</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((submission) => (
              <TableRow key={submission.id}>
                <TableCell className="font-medium">{submission.name}</TableCell>
                <TableCell>{submission.email}</TableCell>
                <TableCell>
                  <Badge variant="outline">{submission.type || "general"}</Badge>
                </TableCell>
                <TableCell>
                  {submission.referredBy ? (
                    <span className="font-mono text-xs">{submission.referredBy.substring(0, 8)}...</span>
                  ) : (
                    <span className="text-muted-foreground text-xs">None</span>
                  )}
                </TableCell>
                <TableCell>{getStatusBadge(submission.status)}</TableCell>
                <TableCell>{formatDate(submission.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleViewSubmission(submission)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditSubmission(submission)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit submission
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDeleteSubmission(submission.id)} className="text-red-600">
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* View Submission Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
            <DialogDescription>Complete information for this submission</DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="mb-2 font-medium">Basic Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium">Name:</span>
                      <p>{selectedSubmission.name}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Email:</span>
                      <p>{selectedSubmission.email}</p>
                    </div>
                    {selectedSubmission.city && (
                      <div>
                        <span className="text-sm font-medium">City:</span>
                        <p>{selectedSubmission.city}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-sm font-medium">Submission Date:</span>
                      <p>{formatDate(selectedSubmission.createdAt)}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Status:</span>
                      <p>{getStatusBadge(selectedSubmission.status)}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Referred By:</span>
                      <p>{selectedSubmission.referredBy || "None"}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 font-medium">Survey Responses</h3>
                  <div className="space-y-2">
                    {selectedSubmission.type === "pet-survey" && (
                      <>
                        {selectedSubmission.healthMonitoring && (
                          <div>
                            <span className="text-sm font-medium">Health Monitoring:</span>
                            <p>{selectedSubmission.healthMonitoring}/5</p>
                          </div>
                        )}
                        {selectedSubmission.locationTracking && (
                          <div>
                            <span className="text-sm font-medium">Location Tracking:</span>
                            <p>{selectedSubmission.locationTracking}/5</p>
                          </div>
                        )}
                        {selectedSubmission.activityTracking && (
                          <div>
                            <span className="text-sm font-medium">Activity Tracking:</span>
                            <p>{selectedSubmission.activityTracking}/5</p>
                          </div>
                        )}
                        {selectedSubmission.feedingReminders && (
                          <div>
                            <span className="text-sm font-medium">Feeding Reminders:</span>
                            <p>{selectedSubmission.feedingReminders}/5</p>
                          </div>
                        )}
                        {selectedSubmission.environmentalSensors && (
                          <div>
                            <span className="text-sm font-medium">Environmental Sensors:</span>
                            <p>{selectedSubmission.environmentalSensors}/5</p>
                          </div>
                        )}
                        {selectedSubmission.smartAlerts && (
                          <div>
                            <span className="text-sm font-medium">Smart Alerts:</span>
                            <p>{selectedSubmission.smartAlerts}/5</p>
                          </div>
                        )}
                        {selectedSubmission.mobileAppIntegration && (
                          <div>
                            <span className="text-sm font-medium">Mobile App Integration:</span>
                            <p>{selectedSubmission.mobileAppIntegration}/5</p>
                          </div>
                        )}
                      </>
                    )}

                    {selectedSubmission.additionalFeatures && (
                      <div>
                        <span className="text-sm font-medium">Additional Features:</span>
                        <p>{selectedSubmission.additionalFeatures}</p>
                      </div>
                    )}

                    {selectedSubmission.comments && (
                      <div>
                        <span className="text-sm font-medium">Comments:</span>
                        <p>{selectedSubmission.comments}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedSubmission.type === "pet-survey" && (
                <div>
                  <h3 className="mb-2 font-medium">Budget & Preferences</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium">Budget:</span>
                      <p>
                        {selectedSubmission.budget === "less-than-6000" && "Less than ₹6,000"}
                        {selectedSubmission.budget === "6000-8000" && "₹6,000 - ₹8,000"}
                        {selectedSubmission.budget === "8000-10000" && "₹8,000 - ₹10,000"}
                        {selectedSubmission.budget === "more-than-10000" && "More than ₹10,000"}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Recurring Costs:</span>
                      <p>
                        {selectedSubmission.recurringCosts === "one-time" && "Prefers one-time payment only"}
                        {selectedSubmission.recurringCosts === "small-fee" && "Willing to pay a small monthly fee"}
                        {selectedSubmission.recurringCosts === "value-updates" &&
                          "Values ongoing updates with recurring fee"}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Trust Level:</span>
                      <p>{selectedSubmission.trustLevel}/5</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Trust Factors:</span>
                      <p>{selectedSubmission.trustFactors?.join(", ")}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setIsViewOpen(false)
                handleEditSubmission(selectedSubmission!)
              }}
            >
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Submission Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Submission</DialogTitle>
            <DialogDescription>Make changes to the submission details</DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="name" className="text-right text-sm font-medium">
                  Name
                </label>
                <Input
                  id="name"
                  name="name"
                  value={editFormData.name || ""}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="email" className="text-right text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  value={editFormData.email || ""}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              {editFormData.city !== undefined && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="city" className="text-right text-sm font-medium">
                    City
                  </label>
                  <Input
                    id="city"
                    name="city"
                    value={editFormData.city || ""}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="status" className="text-right text-sm font-medium">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={editFormData.status || "pending"}
                  onChange={handleInputChange}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              {editFormData.comments !== undefined && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="comments" className="text-right text-sm font-medium">
                    Comments
                  </label>
                  <Textarea
                    id="comments"
                    name="comments"
                    value={editFormData.comments || ""}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSubmission}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
