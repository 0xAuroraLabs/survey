"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { db } from "@/lib/firebase"
import { collection, query, where, orderBy, getDocs, onSnapshot, limit, Unsubscribe, deleteDoc, doc } from "firebase/firestore"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, RefreshCw, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface Reward {
  id: string
  userId: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
}

interface RewardsHistoryTableProps {
  userId: string
}

export function RewardsHistoryTable({ userId }: RewardsHistoryTableProps) {
  const { toast } = useToast()
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchRewards = () => {
    if (!userId) {
      setError("User ID is missing")
      setLoading(false)
      return () => {};
    }

    console.log(`RewardsHistoryTable: Fetching rewards for user ${userId}`)
    setLoading(true)
    setError(null)

    try {
      // Set up real-time listener for rewards with increased limit to catch all updates
      const rewardsQuery = query(
        collection(db, "rewards"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(50) // Increased limit to ensure we catch all rewards
      )

      console.log(`RewardsHistoryTable: Setting up listener with query:`, rewardsQuery)

      const unsubscribe = onSnapshot(rewardsQuery, (snapshot) => {
        const rewardsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Reward[]

        console.log(`RewardsHistoryTable: Received ${rewardsData.length} rewards:`, 
          rewardsData.map(r => ({ id: r.id.substring(0, 8), status: r.status, createdAt: r.createdAt }))
        )

        setRewards(rewardsData)
        setLoading(false)
        setError(null)
      }, (error) => {
        console.error("Error in rewards history listener:", error)
        setError(`Failed to load rewards: ${error.message}`)
        setLoading(false)
      })
      
      return unsubscribe;
    } catch (err) {
      console.error("Error setting up rewards history listener:", err)
      const errorMessage = err instanceof Error ? err.message : String(err)
      setError(`Error loading rewards: ${errorMessage}`)
      setLoading(false)
      return () => {}; // Return empty cleanup function
    }
  }

  // Function to handle deleting a pending reward (for admin or debugging purposes)
  const handleDeleteReward = async (rewardId: string) => {
    if (!rewardId || !userId) return;
    
    try {
      setDeletingId(rewardId);
      console.log(`Attempting to delete reward: ${rewardId}`);
      
      // Delete the reward document
      await deleteDoc(doc(db, "rewards", rewardId));
      
      toast({
        title: "Reward removed",
        description: "The reward has been removed successfully.",
      });
      
      // No need to modify the rewards array as the listener will update it
    } catch (error) {
      console.error("Error deleting reward:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      toast({
        title: "Error removing reward",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Function to manually force a refresh of the rewards data
  const refreshRewards = () => {
    toast({
      title: "Refreshing rewards",
      description: "Fetching your latest rewards data...",
    });
    
    // Unsubscribe and resubscribe to force a fresh fetch
    const newUnsubscribe = fetchRewards();
    return newUnsubscribe;
  };

  useEffect(() => {
    console.log("RewardsHistoryTable: Component mounted with userId:", userId)
    const unsubscribe = fetchRewards()
    
    // Clean up listener on unmount
    return () => {
      console.log("RewardsHistoryTable: Cleaning up listener")
      unsubscribe()
    }
  }, [userId])

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      }).format(date)
    } catch (err) {
      console.error("Error formatting date:", dateString, err)
      return "Invalid date"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge variant="default">Approved</Badge>
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

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription className="flex justify-between items-center">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={() => refreshRewards()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (rewards.length === 0) {
    return (
      <div className="flex flex-col h-[200px] items-center justify-center rounded-md border border-dashed gap-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            No rewards claimed yet. Earn 10 referrals to claim your first reward!
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refreshRewards()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Rewards
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button variant="outline" size="sm" onClick={() => refreshRewards()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reward ID</TableHead>
            <TableHead>Date Claimed</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[50px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rewards.map((reward) => (
            <TableRow key={reward.id}>
              <TableCell className="font-mono text-xs">{reward.id.substring(0, 8)}...</TableCell>
              <TableCell>{formatDate(reward.createdAt)}</TableCell>
              <TableCell>{getStatusBadge(reward.status)}</TableCell>
              <TableCell>
                {reward.status === "pending" && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteReward(reward.id)}
                          disabled={deletingId === reward.id}
                        >
                          {deletingId === reward.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-destructive" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete pending reward</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
