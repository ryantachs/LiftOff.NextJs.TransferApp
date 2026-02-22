import { SectionHeader } from "./SectionHeader"
import { Receipt, Clock, User, ShieldCheck, Star } from "lucide-react"

const features = [
  {
    icon: Receipt,
    title: "Fixed, transparent pricing",
    text: "The price you see is the price you pay. No surge pricing, no waiting charges beyond your allowance.",
  },
  {
    icon: Clock,
    title: "Free cancellation",
    text: "Plans change. Cancel up to 24 hours before your pickup for a full refund, no questions asked.",
  },
  {
    icon: User,
    title: "Professional, vetted drivers",
    text: "All drivers are fully licensed, DBS-checked, and trained to deliver a professional service.",
  },
  {
    icon: ShieldCheck,
    title: "Secure online booking",
    text: "Payments processed by Stripe. Manage your bookings, cancel, or rebook any time from your account.",
  },
]

export function TrustFeatures() {
  return (
    <section className="bg-ink px-6 py-24 lg:px-16">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-24">
        {/* Left — Testimonial */}
        <div className="relative">
          <div className="relative overflow-visible rounded-[3px] border border-gold/20 bg-ink-mid p-8 lg:p-10">
            {/* Decorative quote mark */}
            <span className="absolute -top-4 left-6 font-serif text-[5rem] leading-none text-gold/20">
              &ldquo;
            </span>

            {/* Stars */}
            <div className="mb-4 flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="h-4 w-4 fill-gold text-gold"
                />
              ))}
            </div>

            <p className="font-serif text-[1.1rem] italic leading-relaxed text-cream">
              &ldquo;Absolutely seamless from start to finish. The driver was
              waiting right at arrivals, the car was immaculate, and the price
              was exactly what was quoted. I won&rsquo;t book any other way.&rdquo;
            </p>

            <div className="mt-6 flex items-center gap-2 font-sans text-[0.75rem] uppercase tracking-[0.1em]">
              <span className="text-body">Sarah T.</span>
              <span className="text-gold">Heathrow to Cambridge</span>
            </div>
          </div>

          {/* Floating info card */}
          <div className="absolute -right-4 -bottom-6 rounded-[3px] border border-gold/20 bg-gold-pale px-4 py-3 shadow-lg lg:-right-8">
            <p className="font-sans text-[0.8rem] font-medium text-cream">
              📍 Live tracking
            </p>
            <p className="font-sans text-[0.7rem] text-body">
              View in your account
            </p>
          </div>
        </div>

        {/* Right — Feature list */}
        <div>
          <SectionHeader
            eyebrow="Why ArriveSmart"
            title={
              <>
                Transfers you can <em className="text-gold">actually</em> rely
                on
              </>
            }
            align="left"
          />

          <div className="space-y-6">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[4px] border border-gold/20 bg-gold-pale">
                  <feature.icon className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <h4 className="font-serif text-[1.1rem] font-semibold text-cream">
                    {feature.title}
                  </h4>
                  <p className="mt-1 font-sans text-[0.875rem] text-body">
                    {feature.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
