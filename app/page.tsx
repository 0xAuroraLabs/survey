"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle, Heart, PawPrint, Shield } from "lucide-react"
import { WelcomeMessage } from "@/components/welcome-message"
import { AdminLink } from "@/components/admin-link"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/images/without-bg.png" alt="Auroral Labs Logo" width={40} height={40} />
            <span className="text-xl font-bold text-aurora">Auroral Labs</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link href="/#features" className="transition-colors hover:text-aurora">
              Features
            </Link>
            <Link href="/#about" className="transition-colors hover:text-aurora">
              About Us
            </Link>
            <Link href="/form" className="transition-colors hover:text-aurora">
              Survey
            </Link>
            <Link href="/dashboard" className="transition-colors hover:text-aurora">
              Dashboard
            </Link>
            <AdminLink className="transition-colors hover:text-aurora">Admin</AdminLink>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/auth">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/form" className="hidden md:block">
              <Button>
                Take Survey <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-aurora px-3 py-1 text-sm text-white">
                  Innovative Pet Care Technology
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  Enhancing Pet Lives Through Technology
                </h1>
                <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  At Auroral Labs, we're dedicated to revolutionizing pet care with smart, user-friendly technology.
                  Join our referral program and help shape the future of pet care.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/form">
                    <Button size="lg" className="w-full min-[400px]:w-auto">
                      Take Our Survey
                    </Button>
                  </Link>
                  <Link href="/auth">
                    <Button size="lg" variant="outline" className="w-full min-[400px]:w-auto">
                      Join Referral Program
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="mx-auto w-full max-w-[500px] lg:max-w-none relative">
                <div className="aspect-video overflow-hidden rounded-xl bg-gray-100 shadow-lg">
                  <Image
                    src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=2064"
                    alt="Happy pets with technology"
                    width={600}
                    height={400}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 rounded-lg bg-white p-4 shadow-lg dark:bg-gray-950">
                  <div className="flex items-center gap-2">
                    <Heart className="h-6 w-6 text-aurora" />
                    <div>
                      <div className="text-sm font-medium">Trusted by</div>
                      <div className="text-xl font-bold">5,000+ Pet Owners</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-aurora px-3 py-1 text-sm text-white">Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Smart Pet Care Solutions</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Our innovative devices combine cutting-edge technology with user-friendly design to provide the best
                  care for your pets.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-aurora text-white">
                  <PawPrint className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Health Monitoring</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Real-time tracking of your pet's vital signs and health metrics for proactive care.
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-aurora text-white">
                  <Shield className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Location Tracking</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    GPS and Bluetooth technology to always know where your pet is, with safe zone alerts.
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-aurora text-white">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Smart Alerts</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Intelligent notifications for unusual behavior, emergencies, or when your pet needs attention.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-aurora px-3 py-1 text-sm text-white">About Us</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Auroral Labs</h2>
                <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Auroral Labs is a forward-thinking startup committed to revolutionizing pet care with smart,
                  user-friendly technology. Our mission is to develop intelligent pet devices that ensure the
                  well-being, safety, and happiness of your pets.
                </p>
                <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Whether it's real-time health monitoring, location tracking, or smart alerts, we aim to bring peace of
                  mind to pet owners everywhere.
                </p>
                <div>
                  <Link href="/form">
                    <Button>Help Shape Our Products</Button>
                  </Link>
                </div>
              </div>
              <div className="mx-auto w-full max-w-[500px] lg:max-w-none">
                <div className="aspect-square overflow-hidden rounded-xl bg-gray-100 shadow-lg">
                  <Image
                    src="/images/without-bg.png"
                    alt="Auroral Labs Logo"
                    width={500}
                    height={500}
                    className="object-contain w-full h-full p-12"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-aurora text-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Join Our Referral Program
                </h2>
                <p className="max-w-[900px] text-white/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Refer friends to our survey and earn rewards. Help us create better pet care solutions while being
                  rewarded for your support.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/auth">
                  <Button size="lg" variant="secondary" className="w-full min-[400px]:w-auto">
                    Start Referring
                  </Button>
                </Link>
                <Link href="/form">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full min-[400px]:w-auto border-white text-white hover:bg-white hover:text-aurora"
                  >
                    Take Survey
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full py-6 bg-gray-100 dark:bg-gray-900">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Image src="/images/without-bg.png" alt="Auroral Labs Logo" width={32} height={32} />
                <span className="text-lg font-bold text-aurora">Auroral Labs</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Enhancing pet lives through innovative technology.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 lg:col-span-2 lg:grid-cols-4">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Company</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/#about" className="text-gray-500 hover:text-aurora dark:text-gray-400">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/#features" className="text-gray-500 hover:text-aurora dark:text-gray-400">
                      Features
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Products</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/form" className="text-gray-500 hover:text-aurora dark:text-gray-400">
                      Pet Devices
                    </Link>
                  </li>
                  <li>
                    <Link href="/form" className="text-gray-500 hover:text-aurora dark:text-gray-400">
                      Survey
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Resources</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/dashboard" className="text-gray-500 hover:text-aurora dark:text-gray-400">
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard/referrals" className="text-gray-500 hover:text-aurora dark:text-gray-400">
                      Referrals
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Admin</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/dashboard/admin" className="text-gray-500 hover:text-aurora dark:text-gray-400">
                      Admin Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/dashboard/admin/submissions"
                      className="text-gray-500 hover:text-aurora dark:text-gray-400"
                    >
                      Survey Responses
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} Auroral Labs. All rights reserved.
          </div>
        </div>
      </footer>
      <WelcomeMessage />
    </div>
  )
}
