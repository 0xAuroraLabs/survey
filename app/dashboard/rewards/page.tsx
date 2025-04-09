import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RewardsClaimCard } from "@/components/rewards-claim-card"
import { RewardsHistoryTable } from "@/components/rewards-history-table"
import { getCurrentUser } from "@/lib/session"
import { initAdmin } from "@/lib/firebase-admin"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function RewardsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  // Get the most up-to-date user data from Firestore
  const { db } = initAdmin()
  const userDoc = await db.collection("users").doc(user.uid).get()
  const userData = userDoc.data() || {}
  
  // Calculate rewards data
  const referralCount = userData.referralCount || 0 
  const referralProgressCount = referralCount % 10
  const progress = Math.min((referralProgressCount / 10) * 100, 100)
  const rewardsEarned = Math.floor(referralCount / 10)
  const rewardsClaimed = userData.rewardsClaimed || 0
  
  // Handle case where user claimed more rewards than currently earned
  // This can happen if rewards were claimed before accumulating 10 referrals or during testing
  const pendingRewards = Math.max(rewardsEarned - rewardsClaimed, 0)
  const hasRewardsMismatch = rewardsClaimed > rewardsEarned

  // Log for debugging
  console.log("User rewards data:", {
    referralCount,
    referralProgressCount,
    progress,
    rewardsEarned,
    rewardsClaimed,
    pendingRewards,
    hasRewardsMismatch
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Rewards</h1>
        <p className="text-muted-foreground">Track and claim your rewards</p>
      </div>

      {hasRewardsMismatch && (
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            You've already claimed {rewardsClaimed} {rewardsClaimed === 1 ? 'reward' : 'rewards'}. 
            Earn more referrals to unlock additional rewards.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Referral Progress</CardTitle>
            <CardDescription>Complete 10 referrals to earn a reward</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{referralProgressCount} / 10 referrals</span>
              <span className="text-sm font-medium">{Math.floor(((referralProgressCount) / 10) * 100)}%</span>
            </div>
            <Progress value={progress} />
            <p className="text-sm text-muted-foreground">
              {10 - (referralProgressCount)} more referrals until your next reward
            </p>
          </CardContent>
        </Card>

        <RewardsClaimCard 
          userId={user.uid} 
          pendingRewards={pendingRewards} 
          totalRewards={rewardsEarned} 
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rewards History</CardTitle>
          <CardDescription>Your claimed rewards and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <RewardsHistoryTable userId={user.uid} />
        </CardContent>
      </Card>
    </div>
  )
}
