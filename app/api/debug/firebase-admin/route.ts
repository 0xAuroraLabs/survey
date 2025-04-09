import { NextResponse } from "next/server"
import { initAdmin } from "@/lib/firebase-admin"

export async function GET(req: Request) {
  try {
    console.log("Starting Firebase Admin debug test...")

    // Initialize Firebase Admin
    const { db } = initAdmin()
    
    console.log("Firebase Admin initialized successfully")
    
    // Try to access the submissions collection
    const submissionsRef = db.collection("submissions")
    
    // Test 1: Create a test document with a timestamp
    console.log("Attempting to create a test document...")
    const testDoc = await submissionsRef.add({
      name: "Test Debug User",
      email: "test-debug-" + Date.now() + "@example.com",
      status: "pending",
      createdAt: new Date(),
      type: "debug-test",
      isTestEntry: true, // Flag to identify test entries
    })
    
    console.log("Test document created with ID:", testDoc.id)
    
    // Test 2: Read the test document back
    console.log("Attempting to read the test document...")
    const docSnapshot = await testDoc.get()
    const docData = docSnapshot.data()
    
    console.log("Test document read successfully:", docData)
    
    // Test 3: Query for all test entries
    console.log("Attempting to query for test entries...")
    const querySnapshot = await submissionsRef.where("isTestEntry", "==", true).limit(5).get()
    
    const testEntries = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    console.log("Query completed successfully, found", querySnapshot.size, "test entries")
    
    // Return success response with test data
    return NextResponse.json({
      success: true,
      message: "Firebase Admin SDK is working correctly",
      testDocId: testDoc.id,
      testDocData: docData,
      recentTestEntries: testEntries
    }, { status: 200 })
    
  } catch (error) {
    console.error("Error testing Firebase Admin SDK:", error)
    return NextResponse.json({
      success: false,
      message: "Firebase Admin SDK test failed",
      error: JSON.stringify(error)
    }, { status: 500 })
  }
} 