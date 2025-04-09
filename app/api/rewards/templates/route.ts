import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { cookies } from 'next/headers';
import { getAuth } from 'firebase-admin/auth';
import { initAdmin } from '@/lib/firebase-admin';

// Reward template default data
const defaultRewardTemplates = [
  {
    name: "Coffee Gift Card",
    description: "A $5 gift card for your favorite coffee shop",
    pointsRequired: 100,
    status: "active"
  },
  {
    name: "Movie Ticket",
    description: "A free movie ticket at your local cinema",
    pointsRequired: 250,
    status: "active"
  },
  {
    name: "Food Delivery Voucher",
    description: "A $15 voucher for your next food delivery order",
    pointsRequired: 400,
    status: "active"
  },
  {
    name: "Premium Subscription",
    description: "One month of premium subscription to our service",
    pointsRequired: 500,
    status: "active"
  },
  {
    name: "Tech Gadget",
    description: "A cool tech gadget of your choice under $50",
    pointsRequired: 1000,
    status: "active"
  }
];

export async function GET() {
  try {
    // Get reward templates from Firestore
    const rewardTemplatesRef = collection(db, "rewardTemplates");
    const rewardTemplatesSnapshot = await getDocs(rewardTemplatesRef);
    
    let rewardTemplates = rewardTemplatesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return NextResponse.json({ rewardTemplates });
  } catch (error) {
    console.error("Error fetching reward templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch reward templates" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    // Check authentication and admin status using Firebase Admin
    initAdmin();
    const auth = getAuth();
    
    // Get session cookie
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('__session')?.value;
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Unauthorized - No session cookie" },
        { status: 401 }
      );
    }
    
    // Verify session
    try {
      const decodedClaims = await auth.verifySessionCookie(sessionCookie);
      
      // Check if user is admin
      if (!decodedClaims.admin) {
        return NextResponse.json(
          { error: "Unauthorized - Admin access required" },
          { status: 403 }
        );
      }
    } catch (error) {
      console.error("Session verification failed:", error);
      return NextResponse.json(
        { error: "Unauthorized - Invalid session" },
        { status: 401 }
      );
    }
    
    // Create default reward templates if they don't exist
    const rewardTemplatesRef = collection(db, "rewardTemplates");
    const addedTemplates = [];
    
    for (const template of defaultRewardTemplates) {
      // Check if template already exists
      const existingQuery = query(rewardTemplatesRef, where("name", "==", template.name));
      const existingSnapshot = await getDocs(existingQuery);
      
      if (existingSnapshot.empty) {
        // Add new template
        const docRef = await addDoc(rewardTemplatesRef, {
          ...template,
          createdAt: new Date().toISOString()
        });
        
        addedTemplates.push({
          id: docRef.id,
          ...template
        });
      }
    }
    
    return NextResponse.json({ 
      message: "Reward templates created successfully", 
      addedTemplates 
    });
  } catch (error) {
    console.error("Error creating reward templates:", error);
    return NextResponse.json(
      { error: "Failed to create reward templates" },
      { status: 500 }
    );
  }
} 