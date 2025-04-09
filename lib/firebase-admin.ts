import { cert, getApps, initializeApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"

// Initialize Firebase Admin
export function initAdmin() {
  // Make sure this code only runs on the server
  if (typeof window !== 'undefined') {
    throw new Error('Firebase Admin SDK can only be used on the server side');
  }

  try {
    if (!process.env.FIREBASE_ADMIN_PRIVATE_KEY || !process.env.FIREBASE_ADMIN_CLIENT_EMAIL) {
      throw new Error("Missing required Firebase Admin environment variables");
    }

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
    } as const;

    if (getApps().length === 0) {
      initializeApp({
        credential: cert(serviceAccount as any),
      })
      console.log("Firebase Admin initialized successfully");
    }

    const auth = getAuth()
    const db = getFirestore()

    return { auth, db }
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error);
    throw error;
  }
}
