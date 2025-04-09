import { initializeMockAuth, listAllUsers } from "./mock-auth"
import { initializeMockDb } from "./mock-db"

let initialized = false

export function initMockData() {
  if (typeof window === "undefined") {
    console.log("Cannot initialize mock data on server side")
    return
  }

  if (initialized) {
    console.log("Mock data already initialized")
    return
  }

  try {
    console.log("Starting mock data initialization...")

    // Initialize mock auth
    initializeMockAuth()

    // Initialize mock database
    initializeMockDb()

    // Debug logs
    listAllUsers()
    console.log("Users:", window.localStorage.getItem("mock_users"))
    console.log("Submissions:", window.localStorage.getItem("mock_submissions"))
    console.log("Rewards:", window.localStorage.getItem("mock_rewards"))

    initialized = true
    console.log("Mock data initialization complete")
  } catch (error) {
    console.error("Error initializing mock data:", error)
  }
}
