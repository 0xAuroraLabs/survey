"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle, XCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { db } from "@/lib/firebase"
import { collection, query, where, orderBy, getDocs, doc, updateDoc, getDoc } from "firebase/firestore"

interface Reward {
  id: string
  userId: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
}

interface RewardWithUserName extends Reward {
  userName: string
}

export function AdminPendingRewards() {
  const { toast } = useToast()
  const [rewards, setRewards] = useState<RewardWithUserName[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRewards = async () => {
    try {
      // Query pending rewards
      const rewardsQuery = query(
        collection(db, "rewards"),
        where("status", "==", "pending"),
        orderBy("createdAt", "desc")
      )

      const querySnapshot = await getDocs(rewardsQuery)
      const rewardsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Reward[]

      // Get user names
      const rewardsWithUserNames: RewardWithUserName[] = []
      
      for (const reward of rewardsData) {
        const userDoc = await getDoc(doc(db, "users", reward.userId))
        const userData = userDoc.data()
        
        rewardsWithUserNames.push({
          ...reward,
          userName: userData?.displayName || "Unknown User",
        })
      }

      setRewards(rewardsWithUserNames)
    } catch (error) {
      console.error("Error fetching rewards:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRewards()
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

  const handleApprove = async (id: string) => {
    try {
      const rewardRef = doc(db, "rewards", id)
      await updateDoc(rewardRef, {
        status: "approved"
      })

      setRewards(rewards.filter((reward) => reward.id !== id))

      toast({
        title: "Reward approved",
        description: "The reward has been approved successfully.",
      })
    } catch (error) {
      console.error("Error approving reward:", error)
      toast({
        title: "Error",
        description: "Failed to approve reward.",
        variant: "destructive",
      })
    }
  }

  const handleReject = async (id: string) => {
    try {
      const rewardRef = doc(db, "rewards", id)
      await updateDoc(rewardRef, {
        status: "rejected"
      })

      setRewards(rewards.filter((reward) => reward.id !== id))

      toast({
        title: "Reward rejected",
        description: "The reward has been rejected.",
      })
    } catch (error) {
      console.error("Error rejecting reward:", error)
      toast({
        title: "Error",
        description: "Failed to reject reward.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
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

  if (rewards.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">No pending rewards to approve.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {rewards.map((reward) => (
        <div key={reward.id} className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="space-y-1">
              <p className="font-medium">{reward.userName}</p>
              <div className="flex items-center space-x-2">
                <p className="text-xs text-muted-foreground">User ID: {reward.userId.substring(0, 8)}...</p>
                <p className="text-xs text-muted-foreground">{formatDate(reward.createdAt)}</p>
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleApprove(reward.id)}>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="sr-only">Approve</span>
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleReject(reward.id)}>
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="sr-only">Reject</span>
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
