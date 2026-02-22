import { SectionHeader } from "./SectionHeader"

const steps = [
  {
    number: 1,
    title: "Enter Your Journey",
    description:
      "Tell us your pickup and destination, date, time, and how many passengers are travelling.",
  },
  {
    number: 2,
    title: "Choose Your Vehicle",
    description:
      "See fixed prices for all available vehicle classes. No surge pricing, no hidden fees.",
  },
  {
    number: 3,
    title: "Pay Securely",
    description:
      "Checkout with Stripe. Your card details are handled entirely by Stripe — we never see them.",
  },
  {
    number: 4,
    title: "Travel with Confidence",
    description:
      "Receive your driver\u2019s name and vehicle details before pickup. Track your booking any time.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative overflow-hidden bg-ink-mid px-6 py-24 lg:px-16">
      {/* Decorative glow */}
      <div className="pointer-events-none absolute top-0 right-0 h-[600px] w-[600px] bg-[radial-gradient(circle,rgba(201,168,76,0.04),transparent)]" />

      <div className="relative mx-auto max-w-[1400px]">
        <SectionHeader
          eyebrow="How It Works"
          title="Four simple steps"
          description="From booking to boarding — we handle every detail so you can focus on your journey."
        />

        {/* Steps grid with connector line */}
        <div className="relative grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {/* Horizontal connector (desktop only) */}
          <div className="pointer-events-none absolute top-6 left-[calc(12.5%+1.5rem)] right-[calc(12.5%+1.5rem)] hidden h-px bg-[linear-gradient(to_right,rgba(201,168,76,0.3),rgba(201,168,76,0.5),rgba(201,168,76,0.3))] lg:block" />

          {steps.map((step) => (
            <div key={step.number} className="relative text-center">
              {/* Step circle */}
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-gold/30 bg-ink">
                <span className="font-serif text-[1.1rem] text-gold">
                  {step.number}
                </span>
              </div>
              <h3 className="mt-5 font-serif text-[1.15rem] font-semibold text-cream">
                {step.title}
              </h3>
              <p className="mt-2 font-sans text-[0.85rem] text-body">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
