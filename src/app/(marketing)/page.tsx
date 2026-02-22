import Nav from "@/components/layout/Nav"
import { Hero } from "@/components/landing/Hero"
import { StatsBar } from "@/components/landing/StatsBar"
import { VehicleClasses } from "@/components/landing/VehicleClasses"
import { HowItWorks } from "@/components/landing/HowItWorks"
import { TrustFeatures } from "@/components/landing/TrustFeatures"
import { AirportsServed } from "@/components/landing/AirportsServed"
import { CtaSection } from "@/components/landing/CtaSection"
import Footer from "@/components/layout/Footer"

export const metadata = {
  title: "ArriveSmart — Premium Airport Transfers",
  description:
    "Fixed-price airport transfers with professional drivers. Book in minutes, travel with confidence.",
  openGraph: {
    title: "ArriveSmart — Premium Airport Transfers",
    description:
      "Fixed-price, no-surprise airport transfers. Book online in minutes.",
    type: "website",
  },
}

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <StatsBar />
        <VehicleClasses />
        <HowItWorks />
        <TrustFeatures />
        <AirportsServed />
        <CtaSection />
      </main>
      <Footer />
    </>
  )
}
