"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { FirebaseError } from "firebase/app"
import { auth } from "@/lib/firebase"

export function GuestAccessButton() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleGuestAccess = async () => {
    setIsLoading(true)
    try {
      // Create a random guest account
      const randomEmail = `guest_${Math.random().toString(36).substring(2, 10)}@example.com`
      const password = "guest123456"

      // Use Firebase Auth to create a guest user
      await createUserWithEmailAndPassword(auth, randomEmail, password)

      toast({
        title: "Guest access granted",
        description: "You are now signed in as a guest user.",
      })

      router.push("/dashboard")
    } catch (error: unknown) {
      console.error("Error creating guest account:", error)

      // If the error is "email-already-in-use", try again with a different email
      if (error instanceof FirebaseError && error.code === "auth/email-already-in-use") {
        handleGuestAccess()
        return
      }

      toast({
        title: "Error",
        description: "Failed to create guest account. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleGuestAccess} disabled={isLoading} variant="outline">
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Please wait
        </>
      ) : (
        "Continue as Guest"
      )}
    </Button>
  )
}
