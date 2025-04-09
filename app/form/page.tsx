import { Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { PetSurveyForm } from "@/components/pet-survey-form"
import { Skeleton } from "@/components/ui/skeleton"

export default async function FormPage({
  searchParams,
}: {
  searchParams: { ref?: string }
}) {
  // Properly await the searchParams object
  const params = await searchParams
  const referralId = params.ref || ""

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <Image 
                src="/images/without-bg.png" 
                alt="Auroral Labs Logo" 
                width={32} 
                height={32} 
              />
              <span className="font-bold text-aurora">Auroral Labs</span>
            </Link>
          </div>
          <div className="flex-1 flex justify-end">
            <Link href="/dashboard" className="text-sm font-medium hover:text-aurora">
              Dashboard
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container max-w-3xl py-12">
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold">Auroral Labs Pet Device Survey</h1>
              <p className="text-muted-foreground">Help us create better pet care solutions by sharing your feedback</p>
            </div>
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="space-y-4 mb-8">
                <div className="flex justify-center">
                  <Image
                    src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=1000"
                    alt="Pets in baskets"
                    width={400}
                    height={300}
                    className="rounded-lg object-cover"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  <h2 className="text-lg font-semibold text-foreground mb-2">About This Survey:</h2>
                  <p className="mb-4">
                    At Auroral Labs, we are dedicated to enhancing the lives of pets and their owners through innovative
                    technology. This survey is designed to help us understand your needs and preferences when it comes
                    to pet care devices. Your valuable feedback will guide us in creating a product that truly benefits
                    you and your furry (or feathery, scaly!) companions.
                  </p>
                  <h2 className="text-lg font-semibold text-foreground mb-2">About Auroral Labs:</h2>
                  <p>
                    Auroral Labs is a forward-thinking startup committed to revolutionizing pet care with smart,
                    user-friendly technology. Our mission is to develop intelligent pet devices that ensure the
                    well-being, safety, and happiness of your pets. Whether it's real-time health monitoring, location
                    tracking, or smart alerts, we aim to bring peace of mind to pet owners everywhere.
                  </p>
                  <p className="mt-4 font-medium">
                    We appreciate your time and insights—thank you for being part of this journey with us!
                  </p>
                </div>
              </div>
              <Suspense fallback={<FormSkeleton />}>
                <PetSurveyForm referralId={referralId} />
              </Suspense>
            </div>
          </div>
        </div>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} Auroral Labs. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

function FormSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  )
}
