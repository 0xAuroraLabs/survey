import { NextResponse } from "next/server"
import { initAdmin } from "@/lib/firebase-admin"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    console.log(`Attempting to make ${email} an admin...`)

    // Initialize Firebase Admin
    const { auth, db } = initAdmin()

    try {
      // First try to get user directly from Firebase Auth
      const userRecord = await auth.getUserByEmail(email)
      console.log(`Found user by email: ${userRecord.uid}`)
      
      // Update custom claims
      await auth.setCustomUserClaims(userRecord.uid, { 
        role: "admin",
        // Preserve any existing claims
        ...(userRecord.customClaims || {})
      })
      
      // Update the Firestore document
      await db.collection("users").doc(userRecord.uid).update({ role: "admin" })
      
      console.log(`Successfully made ${email} an admin!`)
      
      return NextResponse.json({
        success: true,
        message: `User ${email} has been made an admin. The user must sign out and sign back in for the changes to take effect.`,
        userId: userRecord.uid,
        requiresRelogin: true
      })
    } catch (authError) {
      console.error("Error finding user in Auth:", authError)
      
      // Fallback to finding user in Firestore
      console.log("Trying to find user in Firestore...")
      const usersRef = db.collection("users")
      const snapshot = await usersRef.where("email", "==", email).get()

      if (snapshot.empty) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      // Update the first matching user to be an admin
      const userDoc = snapshot.docs[0]
      await userDoc.ref.update({ role: "admin" })
      console.log(`Updated user ${userDoc.id} in Firestore`)

      // Update custom claims
      await auth.setCustomUserClaims(userDoc.id, { 
        role: "admin",
        // Preserve any existing claims by getting the user first
        ...(await auth.getUser(userDoc.id)).customClaims
      })
      console.log(`Updated custom claims for ${userDoc.id}`)

      return NextResponse.json({
        success: true,
        message: `User ${email} has been made an admin. The user must sign out and sign back in for the changes to take effect.`,
        userId: userDoc.id,
        requiresRelogin: true
      })
    }
  } catch (error) {
    console.error("Error creating admin:", error)
    return NextResponse.json({ 
      error: "Failed to create admin", 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}
