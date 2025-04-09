"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react"
import { db, collection, doc, addDoc, updateDoc, deleteDoc, getDocs, query, orderBy } from "@/lib/firebase"

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

type Reward = {
  id: string
  name: string
  description: string
  pointsRequired: number
  status: "active" | "inactive"
  createdAt: string
}

export function AdminRewardsManager() {
  const { toast } = useToast()
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingReward, setEditingReward] = useState<Reward | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
    fetchRewards()
  }, [])

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

  const fetchRewards = async () => {
    try {
      setLoading(true)
      const rewardsQuery = query(collection(db, "rewards"), orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(rewardsQuery)

      const rewardsData: Reward[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        rewardsData.push({
          id: doc.id,
          name: data.name,
          description: data.description,
          pointsRequired: data.pointsRequired,
          status: data.status,
          createdAt: data.createdAt,
        })
      })

      setRewards(rewardsData)
    } catch (error) {
      console.error("Error fetching rewards:", error)
      toast({
        title: "Error",
        description: "Failed to fetch rewards. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (values: z.infer<typeof rewardFormSchema>) => {
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
      fetchRewards()

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
        fetchRewards()
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Rewards Management</CardTitle>
          <CardDescription>Create and manage rewards for your referral program</CardDescription>
        </div>
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
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        <Input type="number" min={1} {...field} />
                      </FormControl>
                      <FormDescription>Number of referral points needed to claim this reward</FormDescription>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingReward ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      <>{editingReward ? "Update Reward" : "Create Reward"}</>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : rewards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground">No rewards found. Create your first reward to get started.</p>
            <Button variant="outline" className="mt-4" onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Reward
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Points Required</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rewards.map((reward) => (
                <TableRow key={reward.id}>
                  <TableCell className="font-medium">{reward.name}</TableCell>
                  <TableCell className="max-w-xs truncate">{reward.description}</TableCell>
                  <TableCell>{reward.pointsRequired}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        reward.status === "active"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                    >
                      {reward.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="icon" onClick={() => handleEdit(reward)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleDelete(reward.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
