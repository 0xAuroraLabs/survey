import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"
import { signOut } from "firebase/auth"

export function AdminPromotionNotice() {
  const router = useRouter()

  useEffect(() => {
    const handleSignOut = async () => {
      try {
        // Sign out from client
        await signOut(auth)
        
        // Delete session cookie
        await fetch("/api/auth/session", {
          method: "DELETE",
        })
        
        // Show alert and redirect
        alert("You have been promoted to admin! Please sign in again to access your admin dashboard.")
        router.push("/auth")
      } catch (error) {
        console.error("Error signing out:", error)
      }
    }

    handleSignOut()
  }, [router])

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-background p-6 rounded-lg shadow-lg max-w-md">
        <h3 className="text-lg font-bold mb-4">Admin Access Granted</h3>
        <p className="mb-4">
          You have been promoted to admin! You need to sign out and sign back in to access your admin dashboard.
        </p>
        <p className="text-sm text-muted-foreground">
          Signing you out automatically...
        </p>
      </div>
    </div>
  )
} 