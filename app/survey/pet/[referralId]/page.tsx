import Image from "next/image"
import Link from "next/link"
import { PetSurveyForm } from "@/components/pet-survey-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function PetSurveyPage({ params }: { params: { referralId: string } }) {
  const { referralId } = params

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
          </nav>
        </div>
      </header>
      <main className="flex-1 container py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-2xl">Pet Care Technology Survey</CardTitle>
              <CardDescription>
                Help us shape the future of pet care technology with your feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PetSurveyForm referralId={referralId} />
            </CardContent>
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