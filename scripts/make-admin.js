// Script to make a user admin
// Run with: node scripts/make-admin.js <email>

const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
require('dotenv').config();

// Get the email from the command line arguments
const email = process.argv[2];

if (!email) {
  console.error('Please provide an email address: node scripts/make-admin.js <email>');
  process.exit(1);
}

// Initialize Firebase Admin
const serviceAccount = {
  type: "service_account",
  project_id: "aurorallabs",
  private_key_id: process.env.FIREBASE_ADMIN_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_ADMIN_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_ADMIN_CLIENT_X509_CERT_URL,
  universe_domain: "googleapis.com",
};

initializeApp({
  credential: cert(serviceAccount),
});

const auth = getAuth();
const db = getFirestore();

async function makeUserAdmin(email) {
  try {
    console.log(`Looking for user with email: ${email}`);
    
    // Find the user by email
    const userRecord = await auth.getUserByEmail(email);
    console.log(`Found user: ${userRecord.uid}`);
    
    // Update the user's custom claims to include admin role
    await auth.setCustomUserClaims(userRecord.uid, { 
      role: 'admin',
      // Preserve any existing claims
      ...(userRecord.customClaims || {})
    });
    
    // Update the user document in Firestore
    await db.collection('users').doc(userRecord.uid).update({
      role: 'admin'
    });
    
    console.log(`Successfully made ${email} an admin!`);
    console.log('The user must sign out and sign back in for the changes to take effect.');
  } catch (error) {
    console.error('Error making user admin:', error);
  }
}

makeUserAdmin(email); 