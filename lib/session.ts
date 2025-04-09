import { cache } from "react"
import { cookies } from "next/headers"
import { initAdmin } from "@/lib/firebase-admin"

// Remove cache wrapper to ensure we always get fresh data
export async function getCurrentUser() {
  try {
    // In Next.js 15, cookies() needs to be awaited
    const cookieStore = await cookies()
    const session = cookieStore.get("session")?.value

    if (!session) {
      return null
    }

    // Initialize Firebase Admin
    const { auth, db } = initAdmin()

    // Verify the session cookie
    const decodedClaims = await auth.verifySessionCookie(session, true)

    if (!decodedClaims) {
      return null
    }

    // Get the user from Firebase Auth
    const user = await auth.getUser(decodedClaims.uid)
    
    // Get the latest user data from Firestore
    const userDoc = await db.collection("users").doc(decodedClaims.uid).get()
    const userData = userDoc.data() || {}

    // Return user data with the freshest data from Firestore
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      role: userData.role || "user", // Use Firestore data rather than claims
      referralCount: userData.referralCount || 0,
      rewardsEarned: Math.floor((userData.referralCount || 0) / 10),
      rewardsClaimed: userData.rewardsClaimed || 0,
    }
  } catch (error) {
    console.error("Error in getCurrentUser:", error)
    return null
  }
}
