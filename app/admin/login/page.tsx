"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GoogleAuthButton } from "@/components/google-auth-button"
import Image from "next/image"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function AdminLoginPage() {
  const [authError, setAuthError] = useState<string | null>(null)

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link href="/" className="absolute left-4 top-4 md:left-8 md:top-8">
        <div className="flex items-center gap-2">
          <Image 
            src="/images/without-bg.png" 
            alt="Auroral Labs Logo" 
            width={32} 
            height={32} 
          />
          <h1 className="text-xl font-semibold">Auroral Labs Admin</h1>
        </div>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>Sign in with your admin account to access the admin dashboard</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {authError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Authentication Error</AlertTitle>
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <GoogleAuthButton isAdmin={true} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 