import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plane, Shield, Clock } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Plane className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Airport Transfers</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-4 py-24 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Premium Airport Transfers
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Reliable, comfortable airport transfers at competitive prices. Book your ride in minutes and enjoy a stress-free journey.
          </p>
          <div className="mt-10">
            <Link href="/book">
              <Button size="lg" className="text-lg px-8 py-6">
                Book Now
              </Button>
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="border-t bg-muted/50 py-24">
          <div className="mx-auto max-w-7xl px-4">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">24/7 Service</h3>
                <p className="mt-2 text-muted-foreground">
                  Available around the clock for all your airport transfer needs.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">Secure Payment</h3>
                <p className="mt-2 text-muted-foreground">
                  Pay securely with Stripe. Your payment details are always protected.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Plane className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">Flight Tracking</h3>
                <p className="mt-2 text-muted-foreground">
                  We monitor your flight so we&apos;re always there when you land.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Airport Transfers. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
