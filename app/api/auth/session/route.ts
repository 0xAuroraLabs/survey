import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { initAdmin } from "@/lib/firebase-admin"

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json()

    if (!idToken) {
      return NextResponse.json({ error: "Missing ID token" }, { status: 400 })
    }

    // Initialize Firebase Admin
    const { auth, db } = initAdmin()

    // Verify the ID token
    const decodedToken = await auth.verifyIdToken(idToken)

    if (!decodedToken) {
      return NextResponse.json({ error: "Invalid ID token" }, { status: 401 })
    }

    // Get user data from Firestore
    const userDoc = await db.collection("users").doc(decodedToken.uid).get()
    const userData = userDoc.data() || {}

    // Create a session cookie - we'll limit the claims to just the role
    // Other data like referralCount will be fetched directly from Firestore
    // when needed to avoid caching issues
    const customClaims = {
      role: userData.role || "user"
    }

    // Create a session cookie
    const expiresIn = 60 * 60 * 24 * 5 * 1000 // 5 days
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn })

    // Set the session cookie using await
    const cookieStore = await cookies()
    cookieStore.set("session", sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error creating session:", error)
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
  }
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete("session")
  return NextResponse.json({ success: true })
}
