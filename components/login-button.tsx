"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { signOut } from "@/lib/auth"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface LoginButtonProps extends React.ComponentPropsWithoutRef<typeof Button> {
  asChild?: boolean
  onError?: (error: string) => void
}

export function LoginButton({ asChild, children, onError, ...props }: LoginButtonProps) {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleAuth = async () => {
    if (user) {
      try {
        setIsLoading(true)
        await signOut()

        // Delete the session cookie
        await fetch("/api/auth/session", {
          method: "DELETE",
        })

        router.push("/")
        router.refresh()

        toast({
          title: "Signed out",
          description: "You have been signed out successfully.",
        })
      } catch (error) {
        console.error("Sign out failed:", error)
        toast({
          title: "Sign out failed",
          description: "There was a problem signing you out. Please try again.",
          variant: "destructive",
        })
        if (onError) onError("Sign out failed")
      } finally {
        setIsLoading(false)
      }
    } else {
      // If not signed in, redirect to auth page
      router.push("/auth")
    }
  }

  return (
    <Button onClick={handleAuth} disabled={isLoading} {...props}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Please wait
        </>
      ) : children ? (
        children
      ) : user ? (
        "Sign Out"
      ) : (
        "Sign In"
      )}
    </Button>
  )
}
