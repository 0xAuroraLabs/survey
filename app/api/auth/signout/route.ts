import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  // Clear the session cookie
  const cookieStore = await cookies()
  cookieStore.delete("session")
  
  // Redirect to the authentication page
  const response = NextResponse.redirect(new URL("/auth", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"))
  
  return response
} 