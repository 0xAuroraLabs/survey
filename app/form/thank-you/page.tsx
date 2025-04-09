import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

export default function ThankYouPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/logo.png" alt="Aurora Logo" width={32} height={32} />
            <span className="text-xl font-bold">Aurora</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-foreground/80">
              Home
            </Link>
            <Link href="/dashboard" className="text-sm font-medium transition-colors hover:text-foreground/80">
              Dashboard
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 container py-12">
        <div className="flex flex-col items-center justify-center max-w-md mx-auto text-center gap-6">
          <CheckCircle className="h-16 w-16 text-green-500" />
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-2xl">Thank You!</CardTitle>
              <CardDescription>
                Your response has been submitted successfully
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We truly appreciate you taking the time to share your feedback. Your input helps us improve our services and build a better product.
              </p>
              {/* Note: If you were referred by a friend, they will receive points for this referral */}
            </CardContent>
            <CardFooter className="flex justify-center gap-4">
              <Button asChild variant="outline">
                <Link href="/">
                  Return Home
                </Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard">
                  Go to Dashboard
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            &copy; {new Date().getFullYear()} Aurora. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
