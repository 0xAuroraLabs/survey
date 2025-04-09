"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/components/auth-provider'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { db } from '@/lib/firebase'
import { collection, query, getDocs, orderBy, where, limit, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle,
  XCircle,
  Clock,
  Gift,
  UserCheck,
  AlertTriangle,
  Plus,
  Pencil,
  Trash2,
  Loader2
} from 'lucide-react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Reward form schema for validation
const rewardFormSchema = z.object({
  name: z.string().min(2, {
    message: "Reward name must be at least 2 characters.",
  }),
  description: z.string().min(5, {
    message: "Description must be at least 5 characters.",
  }),
  pointsRequired: z.coerce.number().min(1, {
    message: "Points required must be at least 1.",
  }),
  status: z.enum(["active", "inactive"], {
    message: "Please select a valid status.",
  }),
})

// Reward type
type Reward = {
  id: string
  name: string
  description: string
  pointsRequired: number
  status: "active" | "inactive"
  createdAt: string
}

export default function AdminRewardsPage() {
  const [loading, setLoading] = useState(true)
  const [templates, setTemplates] = useState<any[]>([])
  const [claimedRewards, setClaimedRewards] = useState<any[]>([])
  const [processingIds, setProcessingIds] = useState<string[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingReward, setEditingReward] = useState<Reward | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Initialize form
  const form = useForm<z.infer<typeof rewardFormSchema>>({
    resolver: zodResolver(rewardFormSchema),
    defaultValues: {
      name: "",
      description: "",
      pointsRequired: 10,
      status: "active",
    },
  })

  useEffect(() => {
    // Check if user is admin
    if (user && user.role !== 'admin') {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to access this page.',
        variant: 'destructive',
      })
      router.push('/dashboard')
      return
    }

    // Fetch data
    fetchData()
  }, [user, router, toast])

  // Reset form when editing reward changes
  useEffect(() => {
    if (editingReward) {
      form.reset({
        name: editingReward.name,
        description: editingReward.description,
        pointsRequired: editingReward.pointsRequired,
        status: editingReward.status,
      })
    } else {
      form.reset({
        name: "",
        description: "",
        pointsRequired: 10,
        status: "active",
      })
    }
  }, [editingReward, form])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch reward templates - these are rewards WITHOUT a userId
      const templatesQuery = query(
        collection(db, 'rewards'),
        orderBy('createdAt', 'desc')
      )
      
      const templatesSnapshot = await getDocs(templatesQuery)
      const templatesData = templatesSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data() as any
        }))
        .filter(reward => !('userId' in reward)) // Ensure we only get templates
      
      // Fetch claimed rewards - these are rewards WITH a userId
      const claimedQuery = query(
        collection(db, 'rewards'),
        orderBy('createdAt', 'desc'),
        limit(50)
      )
      
      const claimedSnapshot = await getDocs(claimedQuery)
      const claimedData = claimedSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data() as any
        }))
        .filter(reward => 'userId' in reward) // Only get claimed rewards
      
      setTemplates(templatesData)
      setClaimedRewards(claimedData)
      
      console.log('Admin dashboard - Reward templates:', templatesData)
      console.log('Admin dashboard - Claimed rewards:', claimedData)
    } catch (error) {
      console.error('Error fetching reward data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load reward data',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const updateRewardStatus = async (rewardId: string, newStatus: 'approved' | 'rejected') => {
    if (!rewardId) return;
    
    try {
      // Add to processing state
      setProcessingIds(prev => [...prev, rewardId]);
      
      // Update the reward status
      const rewardRef = doc(db, 'rewards', rewardId);
      await updateDoc(rewardRef, {
        status: newStatus,
        processedAt: new Date().toISOString(),
        processedBy: user?.uid
      });
      
      // Show success message
      toast({
        title: `Reward ${newStatus}`,
        description: `The reward has been ${newStatus} successfully.`,
        variant: newStatus === 'approved' ? 'default' : 'destructive',
      });
      
      // Update local state
      setClaimedRewards(prev => 
        prev.map(reward => 
          reward.id === rewardId 
            ? { ...reward, status: newStatus } 
            : reward
        )
      );
    } catch (error) {
      console.error(`Error ${newStatus} reward:`, error);
      toast({
        title: 'Error',
        description: `Failed to ${newStatus} the reward. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      // Remove from processing state
      setProcessingIds(prev => prev.filter(id => id !== rewardId));
    }
  };

  const onSubmitReward = async (values: z.infer<typeof rewardFormSchema>) => {
    try {
      setIsSubmitting(true)

      if (editingReward) {
        // Update existing reward
        await updateDoc(doc(db, "rewards", editingReward.id), {
          ...values,
          updatedAt: new Date().toISOString(),
        })

        toast({
          title: "Reward updated",
          description: "The reward has been updated successfully.",
        })
      } else {
        // Add new reward
        await addDoc(collection(db, "rewards"), {
          ...values,
          createdAt: new Date().toISOString(),
        })

        toast({
          title: "Reward created",
          description: "The reward has been created successfully.",
        })
      }

      // Refresh rewards list
      fetchData()

      // Close dialog and reset form
      setIsDialogOpen(false)
      setEditingReward(null)
    } catch (error) {
      console.error("Error saving reward:", error)
      toast({
        title: "Error",
        description: "Failed to save reward. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (reward: Reward) => {
    setEditingReward(reward)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this reward? This action cannot be undone.")) {
      try {
        await deleteDoc(doc(db, "rewards", id))

        toast({
          title: "Reward deleted",
          description: "The reward has been deleted successfully.",
        })

        // Refresh rewards list
        fetchData()
      } catch (error) {
        console.error("Error deleting reward:", error)
        toast({
          title: "Error",
          description: "Failed to delete reward. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center">
            <CheckCircle className="h-3.5 w-3.5 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center">
            <XCircle className="h-3.5 w-3.5 mr-1" />
            Rejected
          </Badge>
        );
      case 'inactive':
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 flex items-center">
            <Clock className="h-3.5 w-3.5 mr-1" />
            Inactive
          </Badge>
        );
      case 'active':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center">
            <CheckCircle className="h-3.5 w-3.5 mr-1" />
            Active
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center">
            <Clock className="h-3.5 w-3.5 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const createDefaultTemplates = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/rewards/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create reward templates')
      }
      
      const data = await response.json()
      toast({
        title: 'Success',
        description: `Created ${data.addedTemplates?.length || 0} reward templates`,
      })
      
      // Refresh the data
      fetchData()
    } catch (error) {
      console.error('Error creating reward templates:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create reward templates',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle>Admin Rewards Management</CardTitle>
            <CardDescription>Loading user data...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <Card>
        <CardHeader>
          <CardTitle>Admin Rewards Management</CardTitle>
          <CardDescription>Manage reward templates and user redemptions</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="templates" className="space-y-4">
            <TabsList>
              <TabsTrigger value="templates">Reward Templates</TabsTrigger>
              <TabsTrigger value="pending">Pending Approval</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
            
            <TabsContent value="templates" className="space-y-4">
              {loading ? (
                <div className="grid gap-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Reward Templates</h3>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={() => setEditingReward(null)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Reward
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>{editingReward ? "Edit Reward" : "Add New Reward"}</DialogTitle>
                          <DialogDescription>
                            {editingReward
                              ? "Update the details of this reward."
                              : "Create a new reward for your referral program."}
                          </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmitReward)} className="space-y-4">
                            <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Reward Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Premium Subscription" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Detailed description of the reward..."
                                      className="resize-none"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="pointsRequired"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Points Required</FormLabel>
                                  <FormControl>
                                    <Input type="number" min="1" {...field} />
                                  </FormControl>
                                  <FormDescription>
                                    The number of points needed to claim this reward.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="status"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Status</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select a status" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="active">Active</SelectItem>
                                      <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormDescription>
                                    Only active rewards can be claimed by users.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <DialogFooter>
                              <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {editingReward ? "Update Reward" : "Create Reward"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {templates.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground mb-4">No reward templates found</p>
                      <Button onClick={createDefaultTemplates}>
                        <Gift className="mr-2 h-4 w-4" />
                        Create Default Templates
                      </Button>
                    </div>
                  ) : (
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Points</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {templates.map((reward) => (
                            <TableRow key={reward.id}>
                              <TableCell className="font-medium">{reward.name}</TableCell>
                              <TableCell>{reward.description}</TableCell>
                              <TableCell>{reward.pointsRequired}</TableCell>
                              <TableCell>{renderStatusBadge(reward.status)}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => handleEdit(reward as Reward)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(reward.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete</span>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
            
            <TabsContent value="pending" className="space-y-4">
              {loading ? (
                <div className="grid gap-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <>
                  {claimedRewards.filter(r => r.status === 'pending').length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground">No pending reward claims</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {claimedRewards
                        .filter(reward => reward.status === 'pending')
                        .map((reward) => (
                          <Card key={reward.id}>
                            <CardHeader>
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle>{reward.name || 'Reward'}</CardTitle>
                                  <CardDescription>Claimed by: {reward.userId}</CardDescription>
                                </div>
                                {renderStatusBadge(reward.status)}
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="text-sm text-muted-foreground">Claimed: {new Date(reward.createdAt).toLocaleDateString()}</p>
                                  <p className="text-sm">{reward.description}</p>
                                </div>
                                <div className="flex space-x-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
                                    onClick={() => updateRewardStatus(reward.id, 'approved')}
                                    disabled={processingIds.includes(reward.id)}
                                  >
                                    {processingIds.includes(reward.id) ? (
                                      <div className="flex items-center">
                                        <Skeleton className="h-3.5 w-3.5 rounded-full mr-2 animate-pulse" />
                                        Processing...
                                      </div>
                                    ) : (
                                      <>
                                        <CheckCircle className="h-3.5 w-3.5 mr-2" />
                                        Approve
                                      </>
                                    )}
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800"
                                    onClick={() => updateRewardStatus(reward.id, 'rejected')}
                                    disabled={processingIds.includes(reward.id)}
                                  >
                                    {processingIds.includes(reward.id) ? (
                                      <div className="flex items-center">
                                        <Skeleton className="h-3.5 w-3.5 rounded-full mr-2 animate-pulse" />
                                        Processing...
                                      </div>
                                    ) : (
                                      <>
                                        <XCircle className="h-3.5 w-3.5 mr-2" />
                                        Reject
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  )}
                </>
              )}
            </TabsContent>
            
            <TabsContent value="approved" className="space-y-4">
              {loading ? (
                <div className="grid gap-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <>
                  {claimedRewards.filter(r => r.status === 'approved').length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground">No approved rewards</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {claimedRewards
                        .filter(reward => reward.status === 'approved')
                        .map((reward) => (
                          <Card key={reward.id}>
                            <CardHeader>
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle>{reward.name || 'Reward'}</CardTitle>
                                  <CardDescription>Claimed by: {reward.userId}</CardDescription>
                                </div>
                                {renderStatusBadge(reward.status)}
                              </div>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-muted-foreground">
                                Claimed: {new Date(reward.createdAt).toLocaleDateString()} | 
                                Approved: {reward.processedAt ? new Date(reward.processedAt).toLocaleDateString() : 'Unknown'}
                              </p>
                              <p className="text-sm">{reward.description}</p>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  )}
                </>
              )}
            </TabsContent>
            
            <TabsContent value="rejected" className="space-y-4">
              {loading ? (
                <div className="grid gap-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <>
                  {claimedRewards.filter(r => r.status === 'rejected').length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground">No rejected rewards</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {claimedRewards
                        .filter(reward => reward.status === 'rejected')
                        .map((reward) => (
                          <Card key={reward.id}>
                            <CardHeader>
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle>{reward.name || 'Reward'}</CardTitle>
                                  <CardDescription>Claimed by: {reward.userId}</CardDescription>
                                </div>
                                {renderStatusBadge(reward.status)}
                              </div>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-muted-foreground">
                                Claimed: {new Date(reward.createdAt).toLocaleDateString()} | 
                                Rejected: {reward.processedAt ? new Date(reward.processedAt).toLocaleDateString() : 'Unknown'}
                              </p>
                              <p className="text-sm">{reward.description}</p>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <div className="flex justify-between w-full">
            <Button variant="outline" onClick={() => router.push('/dashboard/admin')}>
              Back to Admin Dashboard
            </Button>
            <Button onClick={fetchData} disabled={loading}>
              Refresh Data
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
