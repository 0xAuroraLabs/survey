"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Gift, Loader2, AlertCircle, RefreshCw, InfoIcon, Coins } from "lucide-react"
import { db } from "@/lib/firebase"
import { doc, getDoc, onSnapshot, collection, query, where, getDocs, orderBy, limit } from "firebase/firestore"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

interface RewardTemplate {
  id: string
  name: string
  description: string
  pointsRequired: number
  status: "active" | "inactive"
  createdAt: string
  userId?: string
}

interface RewardsClaimCardProps {
  userId: string
  pendingRewards: number
  totalRewards: number
}

export function RewardsClaimCard({ userId, pendingRewards, totalRewards }: RewardsClaimCardProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [localPendingRewards, setLocalPendingRewards] = useState(pendingRewards)
  const [localTotalRewards, setLocalTotalRewards] = useState(totalRewards)
  const [rewardsClaimed, setRewardsClaimed] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [hasMismatch, setHasMismatch] = useState(false)
  const [availableRewards, setAvailableRewards] = useState<RewardTemplate[]>([])
  const [loadingRewards, setLoadingRewards] = useState(true)
  
  // Fetch reward templates from admin dashboard
  const fetchRewardTemplates = useCallback(async () => {
    try {
      setLoadingRewards(true);
      console.log("Starting to fetch reward templates...");
      
      // Get rewards
      const rewardsQuery = query(
        collection(db, "rewards"),
        // Don't filter by status here - we'll do it in memory
        limit(50)
      );
      
      const rewardsSnapshot = await getDocs(rewardsQuery);
      console.log(`Found ${rewardsSnapshot.size} total rewards in collection`);
      
      if (rewardsSnapshot.empty) {
        console.warn("No rewards found in database!");
        setAvailableRewards([]);
        setLoadingRewards(false);
        return;
      }
      
      // Process all rewards 
      const allRewards = rewardsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data as any
        };
      });
      
      console.log("All rewards:", allRewards);
      
      // Simple filtering - just exclude rewards with userId
      const templates = allRewards.filter(reward => {
        return !reward.userId;
      });
      
      // Sort templates by points required in ascending order
      const sortedTemplates = templates.sort((a, b) => 
        (a.pointsRequired || 0) - (b.pointsRequired || 0)
      );
      
      console.log("Filtered rewards templates:", sortedTemplates);
      
      setAvailableRewards(sortedTemplates);
      setLoadingRewards(false);
    } catch (err) {
      console.error("Error fetching reward templates:", err);
      setLoadingRewards(false);
    }
  }, []);
  
  // Fetch fresh data directly from Firestore on client side with real-time updates
  const setupRewardListener = () => {
    if (!userId) {
      setError("User ID is missing")
      return () => {};
    }

    console.log(`RewardsClaimCard: Setting up listener for user ${userId}`)
    setError(null)
    
    try {
      // Set up real-time listener
      const unsubscribe = onSnapshot(doc(db, "users", userId), (docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data() || {}
          const referralCount = userData.referralCount || 0
          const rewardsEarned = Math.floor(referralCount / 10)
          const userRewardsClaimed = userData.rewardsClaimed || 0
          const newPendingRewards = Math.max(rewardsEarned - userRewardsClaimed, 0)
          const userHasMismatch = userRewardsClaimed > rewardsEarned
          
          setLocalPendingRewards(newPendingRewards)
          setLocalTotalRewards(rewardsEarned)
          setRewardsClaimed(userRewardsClaimed)
          setHasMismatch(userHasMismatch)
          
          console.log("RewardsClaimCard real-time update:", {
            userId,
            referralCount, 
            rewardsEarned,
            rewardsClaimed: userRewardsClaimed,
            pendingRewards: newPendingRewards,
            hasMismatch: userHasMismatch
          })
          
          // Fetch reward templates when user data changes
          fetchRewardTemplates()
        } else {
          console.log(`RewardsClaimCard: User document does not exist for ID ${userId}`)
          setError("User data not found")
        }
      }, (error) => {
        console.error("Error in rewards real-time listener:", error)
        setError(`Failed to load reward data: ${error.message}`)
      })
      
      return unsubscribe;
    } catch (err) {
      console.error("Error setting up rewards claim listener:", err)
      const errorMessage = err instanceof Error ? err.message : String(err)
      setError(`Error loading rewards: ${errorMessage}`)
      return () => {}; // Return empty cleanup function
    }
  }

  useEffect(() => {
    console.log("RewardsClaimCard: Component mounted with initial data:", {
      userId, pendingRewards, totalRewards
    })

    // Initial fetch
    const fetchUserData = async () => {
      if (!userId) return;
      
      try {
        const userDoc = await getDoc(doc(db, "users", userId))
        if (userDoc.exists()) {
          const userData = userDoc.data() || {}
          
          const referralCount = userData.referralCount || 0
          const rewardsEarned = Math.floor(referralCount / 10)
          const userRewardsClaimed = userData.rewardsClaimed || 0
          const newPendingRewards = Math.max(rewardsEarned - userRewardsClaimed, 0)
          const userHasMismatch = userRewardsClaimed > rewardsEarned
          
          setLocalPendingRewards(newPendingRewards)
          setLocalTotalRewards(rewardsEarned)
          setRewardsClaimed(userRewardsClaimed)
          setHasMismatch(userHasMismatch)
          
          console.log("RewardsClaimCard initial data:", {
            userId,
            referralCount,
            rewardsEarned,
            rewardsClaimed: userRewardsClaimed,
            pendingRewards: newPendingRewards,
            hasMismatch: userHasMismatch
          })
          
          // Fetch reward templates
          await fetchRewardTemplates()
        } else {
          console.warn(`RewardsClaimCard: User document does not exist for ID ${userId}`)
          setError("User data not found")
        }
      } catch (error) {
        console.error("Error fetching initial user data for rewards:", error)
        const errorMessage = error instanceof Error ? error.message : String(error)
        setError(`Error fetching reward data: ${errorMessage}`)
      }
    }
    
    fetchUserData()
    
    // Set up real-time listener
    const unsubscribe = setupRewardListener()
    
    // Clean up listener
    return () => {
      console.log("RewardsClaimCard: Cleaning up listener")
      unsubscribe()
    }
  }, [userId, pendingRewards, totalRewards, fetchRewardTemplates])

  const refreshData = () => {
    const newUnsubscribe = setupRewardListener();
    // We don't need to unsubscribe immediately as we're refreshing the data
    fetchRewardTemplates();
  }

  const handleClaimReward = async (rewardId?: string) => {
    if (localPendingRewards <= 0) {
      toast({
        title: "No rewards available",
        description: "You don't have any rewards to claim.",
        variant: "destructive",
      })
      return;
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log(`RewardsClaimCard: Claiming reward for user ${userId}`)
      
      // Use the API endpoint to claim a reward
      const response = await fetch("/api/user/rewards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rewardId: rewardId || 'default'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to claim reward")
      }

      console.log("RewardsClaimCard: Reward claimed successfully", data)

      toast({
        title: "Reward claimed!",
        description: "Your reward has been claimed and is pending approval.",
      })

      // Reduce local pending rewards
      setLocalPendingRewards(prev => Math.max(prev - 1, 0))
      setRewardsClaimed(prev => prev + 1)
      
      // Force page refresh to update all components
      router.refresh()
      
      // Force immediate reload after a short delay to ensure data is refreshed
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error("Error claiming reward:", error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      setError(`Failed to claim reward: ${errorMessage}`)
      
      toast({
        title: "Failed to claim reward",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Available Rewards</CardTitle>
          <CardDescription>Claim rewards you've earned through referrals</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="flex justify-between items-center">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={refreshData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const renderAvailableRewards = () => {
    if (loadingRewards) {
      return (
        <div className="flex flex-col items-center justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">Loading rewards...</p>
        </div>
      );
    }

    if (availableRewards.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-6">
          <p className="text-sm text-muted-foreground">No rewards available at this time</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {availableRewards.map((reward) => (
          <div 
            key={reward.id} 
            className="border rounded-md p-4 hover:border-primary transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center">
                  <h4 className="font-medium">{reward.name}</h4>
                  <Badge className="ml-2">{reward.pointsRequired} points</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{reward.description}</p>
              </div>
              <Coins className="h-5 w-5 text-primary" />
            </div>
            
            <Button 
              size="sm" 
              className="w-full mt-2" 
              onClick={() => handleClaimReward(reward.id)}
              disabled={localPendingRewards <= 0 || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Claim Reward"
              )}
            </Button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Rewards</CardTitle>
        <CardDescription>Claim rewards you've earned through referrals</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasMismatch && (
          <Alert className="mb-4">
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              You've claimed {rewardsClaimed} rewards. Earn more referrals to unlock additional rewards.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Gift className="h-5 w-5 text-primary" />
            <span className="text-lg font-medium">
              {localPendingRewards} {localPendingRewards === 1 ? "reward" : "rewards"} available
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            Total earned: {localTotalRewards} | Claimed: {rewardsClaimed}
          </div>
        </div>

        {/* Show available rewards */}
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-3">Available rewards:</h3>
          {renderAvailableRewards()}
        </div>
      </CardContent>
    </Card>
  )
}
