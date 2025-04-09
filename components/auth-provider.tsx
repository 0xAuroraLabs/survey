"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth, db, doc, getDoc } from "@/lib/firebase"
import { useToast } from "@/components/ui/use-toast"

interface User {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  role?: string
  referralCount?: number
  rewardsEarned?: number
  rewardsClaimed?: number
}

interface AuthContextType {
  user: User | null
  loading: boolean
  error: Error | null
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    console.log("AuthProvider: Setting up auth state listener")

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          console.log("AuthProvider: User signed in:", firebaseUser.uid)

          // Get additional user data from Firestore
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
          const userData = userDoc.exists() ? userDoc.data() : {}

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            role: userData.role || "user",
            referralCount: userData.referralCount || 0,
            rewardsEarned: Math.floor((userData.referralCount || 0) / 10),
            rewardsClaimed: userData.rewardsClaimed || 0,
          })
        } else {
          console.log("AuthProvider: No user signed in")
          setUser(null)
        }
      } catch (error) {
        console.error("Error in auth state change:", error)
        setError(error instanceof Error ? error : new Error("Unknown error in auth state change"))
        setUser(null)
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [toast])

  return <AuthContext.Provider value={{ user, loading, error }}>{children}</AuthContext.Provider>
}
