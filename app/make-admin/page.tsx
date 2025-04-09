"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Check, AlertCircle } from "lucide-react"

export default function MakeAdminPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) return
    
    setLoading(true)
    setResult(null)
    
    try {
      const response = await fetch("/api/create-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setResult({ success: true, message: data.message })
      } else {
        setResult({ success: false, error: data.error || data.details || "Something went wrong" })
      }
    } catch (error) {
      setResult({ success: false, error: "Failed to make admin" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container flex flex-col items-center justify-center py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Make Admin</CardTitle>
          <CardDescription>Enter the email of the user you want to make an admin</CardDescription>
        </CardHeader>
        <CardContent>
          {result && (
            <Alert 
              className="mb-4" 
              variant={result.success ? "default" : "destructive"}
            >
              {result.success ? (
                <Check className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>
                {result.success ? result.message : result.error}
              </AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Make Admin"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 