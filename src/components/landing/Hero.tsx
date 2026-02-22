import { BookingCard } from "./BookingCard"
import { GoldButton } from "./GoldButton"
import { ArrowRight } from "lucide-react"

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-ink">
      {/* Background layers */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,#0d1117,#1a2332,#0d1117)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_40%,rgba(201,168,76,0.07),transparent)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(201,168,76,1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Content grid */}
      <div className="relative mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-12 px-6 pt-32 pb-20 lg:grid-cols-2 lg:px-16 lg:pt-0 lg:pb-0 lg:min-h-screen">
        {/* Left — Hero copy */}
        <div className="max-w-xl">
          {/* Eyebrow */}
          <div
            className="mb-8 flex items-center gap-4 animate-[fadeInUp_0.6s_ease_both]"
          >
            <span className="block h-px w-10 bg-gold" />
            <span className="font-sans text-[0.75rem] font-medium uppercase tracking-[0.15em] text-gold">
              Premium Airport Transfers
            </span>
          </div>

          {/* H1 */}
          <h1
            className="font-serif text-[clamp(3.5rem,6vw,5.5rem)] font-normal leading-[1.05] text-cream animate-[fadeInUp_0.6s_ease_0.1s_both]"
          >
            Your journey starts
            <br />
            <em className="text-gold">before</em>
            <br />
            you land
          </h1>

          {/* Subheading */}
          <p
            className="mt-6 font-serif text-[clamp(1.8rem,3vw,2.8rem)] text-body animate-[fadeInUp_0.6s_ease_0.2s_both]"
          >
            Seamless airport transfers
          </p>

          {/* Description */}
          <p
            className="mt-4 max-w-[420px] font-sans text-base text-body animate-[fadeInUp_0.6s_ease_0.3s_both]"
          >
            Fixed-price, meet-and-greet airport transfers with professional
            drivers. Book in minutes, travel with confidence.
          </p>

          {/* CTAs */}
          <div
            className="mt-8 flex flex-wrap items-center gap-6 animate-[fadeInUp_0.6s_ease_0.4s_both]"
          >
            <GoldButton href="/book" icon={<ArrowRight className="h-4 w-4" />}>
              Book Your Transfer
            </GoldButton>
            <a
              href="#how-it-works"
              className="font-sans text-[0.85rem] font-medium text-subtle transition-colors hover:text-gold"
            >
              See How It Works →
            </a>
          </div>
        </div>

        {/* Right — Booking Card */}
        <div className="flex justify-center lg:justify-end animate-[fadeInUp_0.6s_ease_0.3s_both]">
          <BookingCard />
        </div>
      </div>
    </section>
  )
}
