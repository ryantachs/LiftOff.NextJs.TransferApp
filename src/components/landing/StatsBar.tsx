const stats = [
  { number: "12,400+", label: "Transfers Completed" },
  { number: "4.9★", label: "Average Rating" },
  { number: "98%", label: "On-Time Arrivals" },
  { number: "24/7", label: "Hours Available" },
]

export function StatsBar() {
  return (
    <section className="border-y border-gold/10 bg-ink-mid px-6 py-10 lg:px-16">
      <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-8 text-center lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label}>
            <p className="font-serif text-[2.8rem] font-semibold leading-none text-cream">
              {stat.number}
            </p>
            <p className="mt-2 font-sans text-[0.75rem] uppercase tracking-[0.12em] text-body">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
