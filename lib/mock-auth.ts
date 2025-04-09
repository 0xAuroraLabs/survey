// Mock authentication service that uses localStorage instead of Firebase
// This is a fallback for when Firebase authentication is not available

import type { User } from "./mock-db"

// Check if localStorage is available (for SSR compatibility)
const isLocalStorageAvailable = () => {
  if (typeof window === "undefined") return false
  try {
    window.localStorage.setItem("test", "test")
    window.localStorage.removeItem("test")
    return true
  } catch (e) {
    return false
  }
}

// Get all users from localStorage
export const getUsers = (): User[] => {
  if (!isLocalStorageAvailable()) return []

  try {
    const usersJson = localStorage.getItem("mock_users")
    return usersJson ? JSON.parse(usersJson) : []
  } catch (error) {
    console.error("Error getting users from localStorage:", error)
    return []
  }
}

// Save users to localStorage
export const saveUsers = (users: User[]): void => {
  if (!isLocalStorageAvailable()) return

  try {
    localStorage.setItem("mock_users", JSON.stringify(users))
  } catch (error) {
    console.error("Error saving users to localStorage:", error)
  }
}

// Get current user from localStorage
export const getCurrentUser = (): User | null => {
  if (!isLocalStorageAvailable()) return null

  try {
    const currentUserJson = localStorage.getItem("mock_current_user")
    return currentUserJson ? JSON.parse(currentUserJson) : null
  } catch (error) {
    console.error("Error getting current user from localStorage:", error)
    return null
  }
}

// Save current user to localStorage
export const saveCurrentUser = (user: User | null): void => {
  if (!isLocalStorageAvailable()) return

  try {
    if (user) {
      localStorage.setItem("mock_current_user", JSON.stringify(user))
    } else {
      localStorage.removeItem("mock_current_user")
    }
  } catch (error) {
    console.error("Error saving current user to localStorage:", error)
  }
}

// Sign up with email and password
export const signUpWithEmail = (email: string, password: string): User => {
  const users = getUsers()

  // Check if user already exists
  const existingUser = users.find((user) => user.email.toLowerCase() === email.toLowerCase())
  if (existingUser) {
    throw new Error("User already exists")
  }

  // Create new user
  const newUser: User = {
    uid: `user_${Date.now()}`,
    email,
    displayName: email.split("@")[0],
    role: "user",
    referralCount: 0,
    rewardsEarned: 0,
    rewardsClaimed: 0,
    createdAt: new Date().toISOString(),
  }

  // Save user to localStorage
  users.push(newUser)
  saveUsers(users)

  // Set as current user
  saveCurrentUser(newUser)

  return newUser
}

// Sign in with email and password
export const signInWithEmail = (email: string, password: string): User => {
  const users = getUsers()

  // Find user by email (case insensitive)
  const user = users.find((user) => user.email.toLowerCase() === email.toLowerCase())
  if (!user) {
    throw new Error("User not found")
  }

  // Set as current user
  saveCurrentUser(user)

  return user
}

// Sign out
export const signOut = (): void => {
  saveCurrentUser(null)
}

// Make user an admin
export const makeAdmin = (email: string): User | null => {
  const users = getUsers()

  // Find user by email
  const userIndex = users.findIndex((user) => user.email.toLowerCase() === email.toLowerCase())
  if (userIndex === -1) {
    return null
  }

  // Update user role
  users[userIndex].role = "admin"
  saveUsers(users)

  // Update current user if it's the same user
  const currentUser = getCurrentUser()
  if (currentUser && currentUser.email.toLowerCase() === email.toLowerCase()) {
    currentUser.role = "admin"
    saveCurrentUser(currentUser)
  }

  return users[userIndex]
}

// Initialize with default admin user if no users exist
export const initializeMockAuth = (): void => {
  if (!isLocalStorageAvailable()) return

  console.log("Initializing mock auth...")

  const users = getUsers()

  if (users.length === 0) {
    // Create default admin user
    const adminUser: User = {
      uid: "admin_default",
      email: "admin@example.com",
      displayName: "Admin User",
      role: "admin",
      referralCount: 2,
      rewardsEarned: 0,
      rewardsClaimed: 0,
      createdAt: new Date().toISOString(),
    }

    // Create default demo user
    const demoUser: User = {
      uid: "demo_default",
      email: "demo@example.com",
      displayName: "Demo User",
      role: "user",
      referralCount: 5,
      rewardsEarned: 0,
      rewardsClaimed: 0,
      createdAt: new Date().toISOString(),
    }

    users.push(adminUser, demoUser)
    saveUsers(users)

    console.log("Mock auth initialized with default users")
  }
}

// Get a list of all users (for debugging)
export const listAllUsers = (): void => {
  const users = getUsers()
  console.log("All users:", users)
}
