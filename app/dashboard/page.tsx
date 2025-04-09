import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ReferralTable } from "@/components/referral-table"
import { getCurrentUser } from "@/lib/session"
import { Gift, Link, Users } from "lucide-react"
import { initAdmin } from "@/lib/firebase-admin"
import Image from "next/image"
import { ReferralLinkBox } from "@/components/referral-link-box"

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardPage() {
  let user

  try {
    user = await getCurrentUser()

    if (!user) {
      redirect("/")
    }

    // Get fresh data directly from Firestore
    const { db } = initAdmin()
    const userDoc = await db.collection("users").doc(user.uid).get()
    const userData = userDoc.data() || {}
    
    // Update user data with latest from Firestore
    user = {
      ...user,
      referralCount: userData.referralCount || 0,
      rewardsClaimed: userData.rewardsClaimed || 0
    }

    // Log for debugging
    console.log("Latest user data:", {
      uid: user.uid,
      referralCount: user.referralCount,
      rewardsClaimed: user.rewardsClaimed
    })
  } catch (error) {
    console.error("Error in dashboard page:", error)
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Error Loading Dashboard</h1>
          <p className="text-muted-foreground">There was a problem loading your dashboard. Please try again later.</p>
        </div>
      </div>
    )
  }

  const referralCount = user.referralCount || 0
  const progress = Math.min((referralCount % 10 / 10) * 100, 100)
  const rewardsEarned = Math.floor(referralCount / 10)
  const rewardsClaimed = user.rewardsClaimed || 0
  const pendingRewards = rewardsEarned - rewardsClaimed

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user.displayName}! Here's your referral progress.</p>
      </div>

      {/* Referral Info Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Share Aurora with your friends</CardTitle>
              <CardDescription>
                Refer friends to earn rewards
              </CardDescription>
            </div>
            <div className="w-24 h-24 relative">
              <Image 
                src="/images/without-bg.png" 
                alt="Aurora Logo" 
                fill 
                style={{ objectFit: 'contain' }} 
                priority
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            For each person who completes a survey through your referral, you'll earn points toward rewards.
            Every 10 referrals completes a reward that you can claim.
          </p>
          {/* Client component for handling referral link */}
          <ReferralLinkBox userId={user.uid} />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Referral Progress</CardTitle>
            <Link className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{referralCount % 10} / 10</div>
            <Progress value={progress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {10 - (referralCount % 10)} more referrals until your next reward
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{referralCount}</div>
            <p className="text-xs text-muted-foreground mt-2">Total people who signed up using your link</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rewards Earned</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rewardsEarned}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {pendingRewards > 0
                ? `You have ${pendingRewards} unclaimed reward${pendingRewards > 1 ? "s" : ""}!`
                : "Complete 10 referrals to earn a reward"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Referrals</CardTitle>
          <CardDescription>Track the status of people you've referred</CardDescription>
        </CardHeader>
        <CardContent>
          <ReferralTable userId={user.uid} />
        </CardContent>
      </Card>
    </div>
  )
}
