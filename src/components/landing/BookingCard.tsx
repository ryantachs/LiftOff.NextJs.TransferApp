"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Search, Shield, Clock, CreditCard } from "lucide-react"

export function BookingCard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [journeyType, setJourneyType] = useState<"pickup" | "dropoff">(
    "pickup"
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (session) {
      router.push("/book")
    } else {
      router.push("/register?intent=book")
    }
  }

  return (
    <div className="w-full max-w-[420px] rounded-[4px] border border-gold/20 bg-[rgba(26,35,50,0.9)] shadow-[0_4px_40px_rgba(0,0,0,0.4),inset_0_0_0_1px_rgba(201,168,76,0.05)] backdrop-blur-[20px]">
      {/* Card header */}
      <div className="flex items-center justify-between border-b border-gold/10 px-6 pt-6 pb-4">
        <h3 className="font-serif text-[1.4rem] text-cream">Get a Quote</h3>
        <span className="rounded-[2px] border border-gold/40 px-2 py-0.5 font-sans text-[0.7rem] font-medium uppercase tracking-[0.08em] text-gold">
          Instant Price
        </span>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-5">
        {/* Journey type toggle */}
        <div className="mb-5 grid grid-cols-2 overflow-hidden rounded-[2px] border border-gold/20">
          <button
            type="button"
            onClick={() => setJourneyType("pickup")}
            className={`py-2.5 font-sans text-[0.8rem] font-medium transition-colors ${
              journeyType === "pickup"
                ? "bg-gold text-ink"
                : "bg-transparent text-body hover:text-cream"
            }`}
          >
            ✈ Airport Pickup
          </button>
          <button
            type="button"
            onClick={() => setJourneyType("dropoff")}
            className={`py-2.5 font-sans text-[0.8rem] font-medium transition-colors ${
              journeyType === "dropoff"
                ? "bg-gold text-ink"
                : "bg-transparent text-body hover:text-cream"
            }`}
          >
            ✈ Airport Drop-off
          </button>
        </div>

        {/* Airport */}
        <label className="mb-1 block font-sans text-[0.7rem] font-medium uppercase tracking-[0.15em] text-gold">
          Airport
        </label>
        <input
          type="text"
          placeholder="e.g. London Heathrow"
          className="mb-4 w-full rounded-[2px] border border-gold/15 bg-[rgba(13,17,23,0.6)] px-3 py-2.5 font-sans text-[0.85rem] text-cream placeholder:text-body/50 transition-colors focus:border-gold/50 focus:outline-none"
        />

        {/* Address */}
        <label className="mb-1 block font-sans text-[0.7rem] font-medium uppercase tracking-[0.15em] text-gold">
          Your Address
        </label>
        <input
          type="text"
          placeholder="Pickup or drop-off address"
          className="mb-4 w-full rounded-[2px] border border-gold/15 bg-[rgba(13,17,23,0.6)] px-3 py-2.5 font-sans text-[0.85rem] text-cream placeholder:text-body/50 transition-colors focus:border-gold/50 focus:outline-none"
        />

        {/* Date + Time */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block font-sans text-[0.7rem] font-medium uppercase tracking-[0.15em] text-gold">
              Date
            </label>
            <input
              type="date"
              className="w-full rounded-[2px] border border-gold/15 bg-[rgba(13,17,23,0.6)] px-3 py-2.5 font-sans text-[0.85rem] text-cream transition-colors focus:border-gold/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block font-sans text-[0.7rem] font-medium uppercase tracking-[0.15em] text-gold">
              Time
            </label>
            <input
              type="time"
              className="w-full rounded-[2px] border border-gold/15 bg-[rgba(13,17,23,0.6)] px-3 py-2.5 font-sans text-[0.85rem] text-cream transition-colors focus:border-gold/50 focus:outline-none"
            />
          </div>
        </div>

        {/* Passengers + Luggage */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block font-sans text-[0.7rem] font-medium uppercase tracking-[0.15em] text-gold">
              Passengers
            </label>
            <input
              type="number"
              min={1}
              max={8}
              defaultValue={1}
              className="w-full rounded-[2px] border border-gold/15 bg-[rgba(13,17,23,0.6)] px-3 py-2.5 font-sans text-[0.85rem] text-cream transition-colors focus:border-gold/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block font-sans text-[0.7rem] font-medium uppercase tracking-[0.15em] text-gold">
              Luggage
            </label>
            <input
              type="number"
              min={0}
              max={10}
              defaultValue={1}
              className="w-full rounded-[2px] border border-gold/15 bg-[rgba(13,17,23,0.6)] px-3 py-2.5 font-sans text-[0.85rem] text-cream transition-colors focus:border-gold/50 focus:outline-none"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-[2px] bg-gold py-3 font-sans text-[0.85rem] font-medium uppercase tracking-[0.08em] text-ink transition-colors hover:bg-gold-light"
        >
          <Search className="h-4 w-4" />
          Get Instant Quote
        </button>
      </form>

      {/* Trust row */}
      <div className="flex items-center justify-center gap-6 border-t border-gold/10 px-6 py-4">
        <div className="flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5 text-gold" />
          <span className="font-sans text-[0.72rem] text-body">
            Fixed Prices
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-gold" />
          <span className="font-sans text-[0.72rem] text-body">
            Free Cancellation
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <CreditCard className="h-3.5 w-3.5 text-gold" />
          <span className="font-sans text-[0.72rem] text-body">
            Secure Pay
          </span>
        </div>
      </div>
    </div>
  )
}
