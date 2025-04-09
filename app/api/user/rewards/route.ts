import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { initAdmin } from "@/lib/firebase-admin"

export async function GET(request: NextRequest) {
  try {
    // Get session cookie
    const cookieStore = await cookies()
    const session = cookieStore.get("session")?.value

    if (!session) {
      console.error("GET /api/user/rewards: Unauthorized - No session cookie")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Initialize Firebase Admin
    const { auth, db } = initAdmin()

    // Verify the session cookie
    const decodedClaims = await auth.verifySessionCookie(session, true)

    if (!decodedClaims) {
      console.error("GET /api/user/rewards: Unauthorized - Invalid session")
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    console.log(`GET /api/user/rewards: Fetching rewards for user ${decodedClaims.uid}`)

    // Get user data from Firestore
    const userDoc = await db.collection("users").doc(decodedClaims.uid).get()
    
    if (!userDoc.exists) {
      console.error(`GET /api/user/rewards: User document not found for ${decodedClaims.uid}`)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    
    const userData = userDoc.data() || {}

    // Get user rewards
    const rewardsSnapshot = await db
      .collection("rewards")
      .where("userId", "==", decodedClaims.uid)
      .orderBy("createdAt", "desc")
      .get()

    const rewards = rewardsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    // Calculate available rewards
    const referralCount = userData.referralCount || 0
    const rewardsEarned = Math.floor(referralCount / 10)
    const rewardsClaimed = userData.rewardsClaimed || 0
    const pendingRewards = rewardsEarned - rewardsClaimed

    console.log(`GET /api/user/rewards: Success for user ${decodedClaims.uid}`, { 
      referralCount, 
      rewardsEarned, 
      rewardsClaimed, 
      pendingRewards,
      rewardsCount: rewards.length
    })

    return NextResponse.json({
      referralCount,
      rewardsEarned,
      rewardsClaimed,
      pendingRewards,
      rewards,
    })
  } catch (error) {
    console.error("Error fetching user rewards:", error)
    return NextResponse.json({ 
      error: "Failed to fetch rewards", 
      message: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get session cookie
    const cookieStore = await cookies()
    const session = cookieStore.get("session")?.value

    if (!session) {
      console.error("POST /api/user/rewards: Unauthorized - No session cookie")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Initialize Firebase Admin
    const { auth, db } = initAdmin()

    // Verify the session cookie
    const decodedClaims = await auth.verifySessionCookie(session, true)

    if (!decodedClaims) {
      console.error("POST /api/user/rewards: Unauthorized - Invalid session")
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    // Parse request body to get rewardId
    const body = await request.json()
    const { rewardId } = body || {}

    console.log(`POST /api/user/rewards: Claiming reward for user ${decodedClaims.uid}`, { rewardId })

    // Get user data from Firestore
    const userDoc = await db.collection("users").doc(decodedClaims.uid).get()
    
    if (!userDoc.exists) {
      console.error(`POST /api/user/rewards: User document not found for ${decodedClaims.uid}`)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    
    const userData = userDoc.data() || {}

    // Calculate available rewards
    const referralCount = userData.referralCount || 0
    const rewardsEarned = Math.floor(referralCount / 10)
    const rewardsClaimed = userData.rewardsClaimed || 0
    const pendingRewards = rewardsEarned - rewardsClaimed
    
    // Check if the user has rewards to claim
    if (pendingRewards <= 0) {
      console.error(`POST /api/user/rewards: No rewards available for user ${decodedClaims.uid}`, {
        referralCount,
        rewardsEarned,
        rewardsClaimed
      })
      return NextResponse.json({ error: "No rewards available to claim" }, { status: 400 })
    }

    // Fetch reward template if a rewardId was provided
    let rewardTemplateData = null
    if (rewardId && rewardId !== 'default') {
      const rewardTemplateDoc = await db.collection("rewards").doc(rewardId).get()
      if (rewardTemplateDoc.exists) {
        rewardTemplateData = rewardTemplateDoc.data()
      } else {
        console.error(`POST /api/user/rewards: Reward template with ID ${rewardId} not found`)
        return NextResponse.json({ error: "Reward template not found" }, { status: 404 })
      }
    }

    // Add a new reward document
    const rewardDocData = {
      userId: decodedClaims.uid,
      status: "pending",
      createdAt: new Date().toISOString(),
      // Include reward template data if available
      ...(rewardTemplateData && {
        templateId: rewardId,
        name: rewardTemplateData.name,
        description: rewardTemplateData.description,
        pointsRequired: rewardTemplateData.pointsRequired
      })
    }
    
    const rewardDocRef = await db.collection("rewards").add(rewardDocData)

    // Update user's claimed rewards count
    await db.collection("users").doc(decodedClaims.uid).update({
      rewardsClaimed: (rewardsClaimed || 0) + 1,
    })

    // Update the auth custom claims
    await auth.setCustomUserClaims(decodedClaims.uid, {
      admin: decodedClaims.admin,
      role: decodedClaims.role,
      rewardsClaimed: (rewardsClaimed || 0) + 1,
    })

    console.log("Reward claimed successfully for user:", decodedClaims.uid, {
      referralCount,
      rewardsEarned,
      rewardsClaimed: (rewardsClaimed || 0) + 1,
      rewardId: rewardDocRef.id,
      templateId: rewardId || 'default'
    })

    return NextResponse.json({ 
      success: true, 
      message: "Reward claimed successfully",
      rewardId: rewardDocRef.id
    })
  } catch (error) {
    console.error("Error claiming reward:", error)
    return NextResponse.json({
      error: "Failed to claim reward", 
      message: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 })
  }
} 