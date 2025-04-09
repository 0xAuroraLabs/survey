import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment,
  addDoc as firebaseAddDoc,
  deleteDoc as firebaseDeleteDoc,
  limit as firebaseLimit,
} from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyAWN89ZJu8vVPvuJzOizAmZk9Q3mzSAZUw",
  authDomain: "aurorallabs.firebaseapp.com",
  projectId: "aurorallabs",
  storageBucket: "aurorallabs.appspot.com",
  messagingSenderId: "886434439291",
  appId: "1:886434439291:web:0db75fa83f3584f2ff02de",
  measurementId: "G-PS3YP1XLHT",
}

// Initialize Firebase with error handling
let app;
try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase:", error);
  throw error;
}

const auth = getAuth(app)
const db = getFirestore(app)

export {
  app,
  auth,
  db,
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment,
  firebaseAddDoc as addDoc,
  firebaseDeleteDoc as deleteDoc,
  firebaseLimit as limit,
}
