import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
} from "firebase/auth"
import { auth, db, doc, getDoc, setDoc } from "@/lib/firebase"

const googleProvider = new GoogleAuthProvider()

export const signInWithGoogle = async () => {
  try {
    console.log("Attempting Google sign in...")

    // Add scopes for better profile information
    googleProvider.addScope("profile")
    googleProvider.addScope("email")

    // Set custom parameters for better UX
    googleProvider.setCustomParameters({
      prompt: "select_account",
    })

    const result = await signInWithPopup(auth, googleProvider)
    console.log("Google sign in successful")

    // Check if user exists in Firestore, if not create a new user document
    const userRef = doc(db, "users", result.user.uid)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      console.log("Creating new user document")
      // Create a new user document
      await setDoc(userRef, {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        role: "user", // Default role
        referralCount: 0,
        rewardsEarned: 0,
        rewardsClaimed: 0,
        createdAt: new Date().toISOString(),
      })
    }

    console.log("User signed in successfully:", result.user.displayName)
    return result.user
  } catch (error) {
    console.error("Error signing in with Google:", error)

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("auth/configuration-not-found")) {
        throw new Error("Google authentication is not properly configured. Please use email authentication instead.")
      }
    }

    throw error
  }
}

export const signUpWithEmail = async (email: string, password: string, displayName: string) => {
  try {
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Update profile with display name
    await updateProfile(user, { displayName })

    // Create user document in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      displayName,
      role: "user",
      referralCount: 0,
      rewardsEarned: 0,
      rewardsClaimed: 0,
      createdAt: new Date().toISOString(),
    })

    return user
  } catch (error) {
    console.error("Error signing up with email:", error)
    throw error
  }
}

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error) {
    console.error("Error signing in with email:", error)
    throw error
  }
}

export const signOut = async () => {
  try {
    await firebaseSignOut(auth)
    console.log("User signed out successfully")
  } catch (error) {
    console.error("Error signing out:", error)
    throw error
  }
}

export const sendPasswordResetEmail = async (email: string) => {
  try {
    await firebaseSendPasswordResetEmail(auth, email)
    console.log("Password reset email sent successfully")
  } catch (error) {
    console.error("Error sending password reset email:", error)
    throw error
  }
}
