"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface ReferralLinkBoxProps {
  userId: string
}

export function ReferralLinkBox({ userId }: ReferralLinkBoxProps) {
  const { toast } = useToast()
  const [referralLink, setReferralLink] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Set the referral link after component mounts to avoid server/client mismatch
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

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again or copy manually.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="relative">
      <div className="flex items-center border rounded-md overflow-hidden">
        <div className="bg-muted px-3 py-2 text-sm font-medium overflow-x-auto whitespace-nowrap">
          {referralLink}
        </div>
        <Button 
          variant="default" 
          className="shrink-0 h-10 px-3 ml-auto rounded-none"
          onClick={copyToClipboard}
          type="button"
        >
          <Copy className="mr-2 h-4 w-4" />
          {copied ? "Copied!" : "Copy"}
        </Button>
      </div>
    </div>
  )
} 