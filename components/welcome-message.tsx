"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function WelcomeMessage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if the welcome message has been shown before
    const hasSeenWelcome = localStorage.getItem("hasSeenWelcome")

    if (!hasSeenWelcome) {
      // Show the welcome message after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    // Set a flag in localStorage to prevent showing the message again
    localStorage.setItem("hasSeenWelcome", "true")
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Welcome to Auroral Labs!</CardTitle>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          <CardDescription>Enhancing pet lives through innovative technology</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Thank you for visiting Auroral Labs! We're currently in the <strong>ideation phase</strong> of our pet care
            device development.
          </p>
          <p>
            Your feedback through our survey will directly influence our product design and features. By subscribing to
            our newsletter, you'll receive:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Early access to product updates</li>
            <li>Exclusive insights into our development process</li>
            <li>Special offers for early adopters</li>
            <li>Opportunities to participate in beta testing</li>
          </ul>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleClose}>
            Maybe Later
          </Button>
          <Button
            onClick={() => {
              handleClose()
              window.location.href = "/form"
            }}
          >
            Take Survey
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
