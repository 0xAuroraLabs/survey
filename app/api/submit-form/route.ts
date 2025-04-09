import { NextResponse } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin/firestore';

export async function POST(request: Request) {
  try {
    const { db } = initAdmin();
    const data = await request.json();
    
    // Validate required fields
    if (!data.type || !data.email || !data.name) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check for existing submission if needed
    if (data.type === 'pet-survey' || data.type === 'referral') {
      const submissionsRef = db.collection('submissions');
      const querySnapshot = await submissionsRef
        .where('email', '==', data.email)
        .where('type', '==', data.type)
        .limit(1)
        .get();
      
      if (!querySnapshot.empty) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'You have already submitted a form with this email address'
          },
          { status: 400 }
        );
      }
    }

    // Handle referral if provided
    let validReferral = false;
    if (data.referredBy) {
      const userDoc = await db.collection('users').doc(data.referredBy).get();
      validReferral = userDoc.exists;
      
      if (validReferral) {
        // Update submission data with valid referral
        data.referredBy = data.referredBy;
        
        // Increment referral count for the referrer
        await db.collection('users').doc(data.referredBy).update({
          referralCount: admin.FieldValue.increment(1)
        });
      } else {
        // Invalid referral ID, set to null
        data.referredBy = null;
      }
    }

    // Add server timestamp
    data.createdAt = admin.FieldValue.serverTimestamp();
    data.status = 'pending';
    
    // Add submission to Firestore
    const submissionRef = await db.collection('submissions').add(data);
    
    return NextResponse.json({ 
      success: true,
      message: 'Form submitted successfully',
      id: submissionRef.id
    });
    
  } catch (error) {
    console.error('Error submitting form:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit form' },
      { status: 500 }
    );
  }
} 