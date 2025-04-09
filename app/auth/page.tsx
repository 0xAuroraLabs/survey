"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EmailAuthForm } from "@/components/email-auth-form"
import { GoogleAuthButton } from "@/components/google-auth-button"
import Image from "next/image"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function AuthPage() {
  const [authError, setAuthError] = useState<string | null>(null)

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link href="/" className="absolute left-4 top-4 md:left-8 md:top-8">
        <div className="flex items-center gap-2">
          <Image 
            src="/images/without-bg.png" 
            alt="Aurora Labs Logo" 
            width={32} 
            height={32} 
          />
          <h1 className="text-xl font-semibold">Aurora Labs</h1>
        </div>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Sign in to your account to access your dashboard and referral program</CardDescription>
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
            <GoogleAuthButton />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <EmailAuthForm />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
