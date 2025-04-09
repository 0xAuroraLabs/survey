import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ReferralTable } from "@/components/referral-table"
import { getCurrentUser } from "@/lib/session"
import Image from "next/image"

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ReferralsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Referrals</h1>
        <p className="text-muted-foreground">
          Track your referral progress
        </p>
      </div>

      <div className="grid gap-6">
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Referrals</CardTitle>
            <CardDescription>
              Track the status of people you've referred
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReferralTable userId={user.uid} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
