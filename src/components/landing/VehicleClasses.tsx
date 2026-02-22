import { prisma } from "@/lib/prisma"
import { SectionHeader } from "./SectionHeader"

/* Fallback data when DB is unavailable (dev / build) */
const fallbackVehicleClasses = [
  {
    id: "1",
    name: "Standard Saloon",
    description: "Comfortable saloon for everyday airport runs.",
    maxPassengers: 4,
    maxLuggage: 2,
    minimumFare: { toString: () => "35.00" },
    imageUrl: null,
  },
  {
    id: "2",
    name: "Executive Saloon",
    description: "Premium saloon with extra legroom and refinement.",
    maxPassengers: 4,
    maxLuggage: 2,
    minimumFare: { toString: () => "55.00" },
    imageUrl: null,
  },
  {
    id: "3",
    name: "Estate / MPV",
    description: "Spacious estate ideal for families and extra luggage.",
    maxPassengers: 5,
    maxLuggage: 4,
    minimumFare: { toString: () => "45.00" },
    imageUrl: null,
  },
  {
    id: "4",
    name: "Executive MPV",
    description: "Luxury people carrier for groups travelling in style.",
    maxPassengers: 6,
    maxLuggage: 6,
    minimumFare: { toString: () => "75.00" },
    imageUrl: null,
  },
]

const vehicleEmoji: Record<string, string> = {
  "Standard Saloon": "🚗",
  "Executive Saloon": "🚙",
  "Estate / MPV": "🚐",
  "Executive MPV": "🚌",
}

async function getVehicleClasses() {
  try {
    return await prisma.vehicleClass.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    })
  } catch {
    return null
  }
}

export async function VehicleClasses() {
  const dbClasses = await getVehicleClasses()
  const vehicleClasses = dbClasses ?? fallbackVehicleClasses

  return (
    <section id="fleet" className="bg-ink px-6 py-24 lg:px-16">
      <div className="mx-auto max-w-[1400px]">
        <SectionHeader
          eyebrow="Our Fleet"
          title="Choose your ride"
          description="From efficient saloons to spacious executive MPVs — every vehicle is fully licensed, regularly inspected, and immaculately presented."
        />

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-[4px] bg-gold/10 sm:grid-cols-2 lg:grid-cols-4">
          {vehicleClasses.map((vc) => (
            <div
              key={vc.id}
              className="group relative bg-ink-mid p-8 transition-colors hover:bg-ink-soft"
            >
              {/* Gold top border on hover */}
              <div className="absolute top-0 left-0 h-0.5 w-full origin-left scale-x-0 bg-gold transition-transform duration-300 group-hover:scale-x-100" />

              <span className="text-3xl">
                {vehicleEmoji[vc.name] ?? "🚗"}
              </span>
              <h3 className="mt-4 font-serif text-[1.3rem] text-cream">
                {vc.name}
              </h3>
              <p className="mt-2 font-sans text-[0.85rem] text-body">
                {vc.description}
              </p>

              {/* Specs */}
              <div className="mt-4 flex items-center gap-2 font-sans text-[0.78rem] text-subtle">
                <span>Up to {vc.maxPassengers} passengers</span>
                <span className="h-1 w-1 rounded-full bg-gold" />
                <span>{vc.maxLuggage} cases</span>
              </div>

              {/* Price */}
              <p className="mt-4 font-sans text-[0.72rem] uppercase tracking-[0.08em] text-gold">
                From £{vc.minimumFare.toString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
