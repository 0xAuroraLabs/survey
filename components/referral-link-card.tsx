"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Copy, Share2 } from "lucide-react"

interface ReferralLinkCardProps {
  userId: string
}

export function ReferralLinkCard({ userId }: ReferralLinkCardProps) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const [referralLink, setReferralLink] = useState("")

  // Set the referral link after component mounts (client-side only)
  useEffect(() => {
    setReferralLink(`${window.location.origin}/form?ref=${userId}`)
  }, [userId])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      toast({
        title: "Link copied!",
        description: "Your referral link has been copied to clipboard.",
      })

      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again or copy manually.",
        variant: "destructive",
      })
    }
  }

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join via my referral link",
          text: "Sign up using my referral link!",
          url: referralLink,
        })

        toast({
          title: "Shared successfully!",
          description: "Your referral link has been shared.",
        })
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          toast({
            title: "Failed to share",
            description: "Please try again or copy the link manually.",
            variant: "destructive",
          })
        }
      }
    } else {
      copyToClipboard()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Referral Link</CardTitle>
        <CardDescription>Share this link with friends to earn rewards</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Input value={referralLink} readOnly className="font-mono text-sm" />
          <Button variant="outline" size="icon" onClick={copyToClipboard} className="shrink-0">
            <Copy className="h-4 w-4" />
            <span className="sr-only">Copy link</span>
          </Button>
        </div>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
          <Button className="w-full" onClick={copyToClipboard}>
            <Copy className="mr-2 h-4 w-4" />
            {copied ? "Copied!" : "Copy Link"}
          </Button>
          <Button variant="outline" className="w-full" onClick={shareLink}>
            <Share2 className="mr-2 h-4 w-4" />
            Share Link
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
