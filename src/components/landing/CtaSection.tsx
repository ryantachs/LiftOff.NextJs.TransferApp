import { GoldButton } from "./GoldButton"
import { ArrowRight } from "lucide-react"

export function CtaSection() {
  return (
    <section className="relative bg-ink px-6 py-24 lg:px-16">
      {/* Radial glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(201,168,76,0.07),transparent)]" />

      <div className="relative mx-auto max-w-[1400px] text-center">
        <h2 className="font-serif text-[clamp(2.5rem,5vw,4.5rem)] font-normal leading-tight text-cream">
          Ready for a <em className="text-gold">smoother</em> journey?
        </h2>
        <p className="mx-auto mt-6 max-w-lg font-sans text-base text-body">
          Join thousands of travellers who book with confidence. Create your
          account in under 2 minutes.
        </p>
        <div className="mt-10">
          <GoldButton
            href="/register"
            size="lg"
            icon={<ArrowRight className="h-4 w-4" />}
          >
            Create Free Account
          </GoldButton>
        </div>
      </div>
    </section>
  )
}
