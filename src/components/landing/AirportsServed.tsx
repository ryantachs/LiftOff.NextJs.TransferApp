const airports = [
  { code: "LHR", name: "London Heathrow" },
  { code: "LGW", name: "London Gatwick" },
  { code: "STN", name: "London Stansted" },
  { code: "LTN", name: "London Luton" },
  { code: "SEN", name: "London Southend" },
  { code: "MAN", name: "Manchester" },
  { code: "BHX", name: "Birmingham" },
  { code: "BRS", name: "Bristol" },
  { code: "EDI", name: "Edinburgh" },
  { code: "GLA", name: "Glasgow" },
  { code: "LPL", name: "Liverpool" },
]

export function AirportsServed() {
  return (
    <section
      id="airports"
      className="border-t border-gold/10 bg-ink-mid px-6 py-24 lg:px-16"
    >
      <div className="mx-auto max-w-[1400px] text-center">
        <p className="mb-8 font-sans text-[0.72rem] uppercase tracking-[0.12em] text-body">
          Airports We Serve
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          {airports.map((airport) => (
            <div
              key={airport.code}
              className="rounded-[3px] border border-gold/15 bg-ink px-4 py-2.5 transition-colors hover:border-gold/50"
            >
              <span className="font-sans text-[0.85rem] font-medium text-cream">
                {airport.code}
              </span>
              <span className="ml-2 font-sans text-[0.78rem] text-body">
                {airport.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
