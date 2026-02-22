"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Search, Shield, Clock, CreditCard, Users, Briefcase, ArrowRight, Loader2, Lock, CheckCircle, Plane } from "lucide-react"

interface VehicleOption {
  id: string
  name: string
  description: string
  maxPassengers: number
  maxLuggage: number
  price: string
}

interface EstimateResult {
  distanceKm: number
  vehicleOptions: VehicleOption[]
  isEstimate: boolean
}

type Step = "form" | "vehicles" | "payment" | "confirmed"

export function BookingCard() {
  const { data: session } = useSession()
  const [step, setStep] = useState<Step>("form")
  const [journeyType, setJourneyType] = useState<"pickup" | "dropoff">("pickup")
  const [loading, setLoading] = useState(false)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState("")
  const [estimate, setEstimate] = useState<EstimateResult | null>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleOption | null>(null)
  const [formSummary, setFormSummary] = useState({ airport: "", address: "", date: "", time: "" })
  const [bookingRef, setBookingRef] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const form = e.currentTarget
    const formData = new FormData(form)
    const airport = (formData.get("airport") as string) || ""
    const address = (formData.get("address") as string)?.trim() || ""
    const date = (formData.get("date") as string) || ""
    const time = (formData.get("time") as string) || ""
    const passengers = parseInt(formData.get("passengers") as string, 10) || 0
    const luggage = parseInt(formData.get("luggage") as string, 10)

    const missing: string[] = []
    if (!airport) missing.push("Airport")
    if (!address) missing.push("Address")
    if (!date) missing.push("Date")
    if (!time) missing.push("Time")
    if (passengers < 1) missing.push("Passengers (at least 1)")

    if (missing.length > 0) {
      setError(`Please fill in: ${missing.join(", ")}`)
      setLoading(false)
      return
    }

    setFormSummary({ airport, address, date, time })

    try {
      const res = await fetch("/api/quotes/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passengers, luggage: isNaN(luggage) ? 0 : luggage }),
      })

      if (!res.ok) {
        setError("Unable to get quote. Please try again.")
        setLoading(false)
        return
      }

      const data: EstimateResult = await res.json()
      setEstimate(data)
      setStep("vehicles")
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSelectVehicle = (vehicle: VehicleOption) => {
    setSelectedVehicle(vehicle)
    setStep("payment")
  }

  const handlePay = () => {
    setPaying(true)
    // Simulate payment processing
    setTimeout(() => {
      setPaying(false)
      setBookingRef(`AS-${Date.now().toString(36).toUpperCase().slice(-6)}`)
      setStep("confirmed")
    }, 2000)
  }

  const handleStartOver = () => {
    setStep("form")
    setEstimate(null)
    setSelectedVehicle(null)
    setError("")
    setBookingRef("")
  }

  const cardShell = "w-full max-w-[480px] h-[700px] flex flex-col rounded-[4px] border border-gold/20 bg-[rgba(26,35,50,0.9)] shadow-[0_4px_40px_rgba(0,0,0,0.4),inset_0_0_0_1px_rgba(201,168,76,0.05)] backdrop-blur-[20px]"

  // ──── Step indicator ────
  const StepIndicator = () => {
    const steps: { key: Step; label: string }[] = [
      { key: "form", label: "Details" },
      { key: "vehicles", label: "Vehicle" },
      { key: "payment", label: "Payment" },
      { key: "confirmed", label: "Confirmed" },
    ]
    const currentIdx = steps.findIndex((s) => s.key === step)
    return (
      <div className="flex items-center justify-between px-6 py-3 border-b border-gold/10 shrink-0">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center gap-1.5">
            <div
              className={`flex h-5 w-5 items-center justify-center rounded-full font-sans text-[0.6rem] font-bold ${
                i <= currentIdx
                  ? "bg-gold text-ink"
                  : "border border-gold/25 text-body"
              }`}
            >
              {i < currentIdx ? "✓" : i + 1}
            </div>
            <span
              className={`hidden font-sans text-[0.65rem] uppercase tracking-[0.08em] sm:inline ${
                i <= currentIdx ? "text-cream" : "text-body/60"
              }`}
            >
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div className={`mx-1 h-px w-4 ${i < currentIdx ? "bg-gold/50" : "bg-gold/15"}`} />
            )}
          </div>
        ))}
      </div>
    )
  }

  // ──── Step 4: Confirmation ────
  if (step === "confirmed") {
    return (
      <div className={cardShell}>
        <StepIndicator />
        <div className="flex-1 overflow-y-auto px-6 py-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-green-500/40 bg-green-500/10">
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
          <h3 className="font-serif text-[1.5rem] text-cream">Booking Confirmed</h3>
          <p className="mt-1 font-sans text-[0.85rem] text-body">
            Your transfer has been booked successfully.
          </p>

          {/* Booking reference */}
          <div className="mt-5 rounded-[3px] border border-gold/20 bg-ink/60 px-4 py-3">
            <p className="font-sans text-[0.7rem] uppercase tracking-[0.12em] text-body">
              Booking Reference
            </p>
            <p className="mt-1 font-mono text-[1.3rem] font-bold tracking-wider text-gold">
              {bookingRef}
            </p>
          </div>

          {/* Summary */}
          <div className="mt-4 space-y-2 rounded-[3px] border border-gold/10 bg-ink/40 px-4 py-3 text-left">
            <div className="flex justify-between">
              <span className="font-sans text-[0.75rem] text-body">Vehicle</span>
              <span className="font-sans text-[0.75rem] text-cream">{selectedVehicle?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-sans text-[0.75rem] text-body">Airport</span>
              <span className="font-sans text-[0.75rem] text-cream">{formSummary.airport}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-sans text-[0.75rem] text-body">Date</span>
              <span className="font-sans text-[0.75rem] text-cream">{formSummary.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-sans text-[0.75rem] text-body">Time</span>
              <span className="font-sans text-[0.75rem] text-cream">{formSummary.time}</span>
            </div>
            <div className="flex justify-between border-t border-gold/10 pt-2">
              <span className="font-sans text-[0.78rem] font-medium text-body">Total Paid</span>
              <span className="font-serif text-[1.1rem] font-semibold text-gold">
                £{selectedVehicle?.price}
              </span>
            </div>
          </div>

          <p className="mt-4 font-sans text-[0.72rem] text-body">
            A confirmation email will be sent to your inbox.
          </p>

          <button
            onClick={handleStartOver}
            className="mt-5 w-full rounded-[2px] border border-gold/25 bg-transparent py-2.5 font-sans text-[0.8rem] font-medium text-gold transition-colors hover:bg-gold hover:text-ink"
          >
            Book Another Transfer
          </button>
        </div>
      </div>
    )
  }

  // ──── Step 3: Payment ────
  if (step === "payment" && selectedVehicle) {
    return (
      <div className={cardShell}>
        <StepIndicator />

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Order summary */}
          <div className="mb-5 rounded-[3px] border border-gold/15 bg-ink/60 p-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-serif text-[1.05rem] text-cream">{selectedVehicle.name}</h4>
                <p className="mt-1 font-sans text-[0.75rem] text-body">
                  {formSummary.airport} · {formSummary.date} · {formSummary.time}
                </p>
              </div>
              <p className="font-serif text-[1.3rem] font-semibold text-gold">
                £{selectedVehicle.price}
              </p>
            </div>
          </div>

          {/* Card on file */}
          <h4 className="mb-3 font-sans text-[0.7rem] font-medium uppercase tracking-[0.15em] text-gold">
            Payment Method
          </h4>
          <div className="mb-5 rounded-[3px] border border-gold/20 bg-ink/60 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-12 items-center justify-center rounded-[2px] bg-[#1a1f6c]">
                <span className="font-sans text-[0.65rem] font-bold italic text-white">VISA</span>
              </div>
              <div className="flex-1">
                <p className="font-sans text-[0.85rem] text-cream">
                  •••• •••• •••• 4242
                </p>
                <p className="font-sans text-[0.7rem] text-body">
                  Expires 12/28
                </p>
              </div>
              <div className="rounded-full border border-gold/40 p-0.5">
                <div className="h-2.5 w-2.5 rounded-full bg-gold" />
              </div>
            </div>
          </div>

          {/* Pay button */}
          <button
            onClick={handlePay}
            disabled={paying}
            className="flex w-full items-center justify-center gap-2 rounded-[2px] bg-gold py-3 font-sans text-[0.85rem] font-medium uppercase tracking-[0.08em] text-ink transition-colors hover:bg-gold-light disabled:opacity-60"
          >
            {paying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                Pay £{selectedVehicle.price} Now
              </>
            )}
          </button>

          <div className="mt-3 flex items-center justify-center gap-1.5">
            <Shield className="h-3 w-3 text-gold/60" />
            <span className="font-sans text-[0.68rem] text-body">
              256-bit SSL encrypted · Secure payment
            </span>
          </div>
        </div>

        {/* Back */}
        <div className="shrink-0 border-t border-gold/10 px-6 py-3">
          <button
            onClick={() => setStep("vehicles")}
            className="w-full font-sans text-[0.8rem] text-body transition-colors hover:text-cream"
          >
            ← Change vehicle
          </button>
        </div>
      </div>
    )
  }

  // ──── Step 2: Vehicle selection ────
  if (step === "vehicles" && estimate) {
    return (
      <div className={cardShell}>
        <StepIndicator />

        <div className="flex-1 overflow-y-auto scrollbar-gold px-6 py-4 space-y-3">
          {estimate.vehicleOptions.length === 0 ? (
            <p className="py-4 text-center font-sans text-[0.85rem] text-body">
              No vehicles available for your requirements.
            </p>
          ) : (
            estimate.vehicleOptions.map((vehicle) => (
              <div
                key={vehicle.id}
                className="group rounded-[3px] border border-gold/15 bg-ink/60 p-4 transition-colors hover:border-gold/40"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-serif text-[1.05rem] text-cream">
                      {vehicle.name}
                    </h4>
                    <p className="mt-1 font-sans text-[0.78rem] text-body leading-snug">
                      {vehicle.description}
                    </p>
                    <div className="mt-2 flex items-center gap-3 font-sans text-[0.72rem] text-subtle">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-gold" />
                        {vehicle.maxPassengers}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3 text-gold" />
                        {vehicle.maxLuggage}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="font-sans text-[0.72rem] uppercase tracking-[0.08em] text-body">
                      From
                    </p>
                    <p className="font-serif text-[1.5rem] font-semibold leading-tight text-gold">
                      £{vehicle.price}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleSelectVehicle(vehicle)}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-[2px] border border-gold/30 bg-transparent py-2 font-sans text-[0.78rem] font-medium uppercase tracking-[0.08em] text-gold transition-colors hover:bg-gold hover:text-ink"
                >
                  Select & Continue
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Back */}
        <div className="shrink-0 border-t border-gold/10 px-6 py-3">
          <button
            onClick={() => { setStep("form"); setEstimate(null) }}
            className="w-full font-sans text-[0.8rem] text-body transition-colors hover:text-cream"
          >
            ← Adjust details
          </button>
        </div>
      </div>
    )
  }

  // ──── Step 1: Quote form ────
  return (
    <div className={cardShell}>
      <StepIndicator />

      {/* Card header */}
      <div className="shrink-0 flex items-center justify-between border-b border-gold/10 px-6 pt-4 pb-3">
        <h3 className="font-serif text-[1.4rem] text-cream">Get a Quote</h3>
        <span className="rounded-[2px] border border-gold/40 px-2 py-0.5 font-sans text-[0.7rem] font-medium uppercase tracking-[0.08em] text-gold">
          Instant Price
        </span>
      </div>

      <form method="post" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5">
        {/* Error */}
        {error && (
          <div className="mb-4 rounded-[2px] border border-red-500/30 bg-red-500/10 px-3 py-2 font-sans text-[0.8rem] text-red-400">
            {error}
          </div>
        )}

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
          {journeyType === "pickup" ? "Pickup Airport" : "Drop-off Airport"}
        </label>
        <select
          name="airport"
          required
          defaultValue=""
          className="mb-4 w-full appearance-none rounded-[2px] border border-gold/15 bg-[rgba(13,17,23,0.6)] bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23c9a84c%22%20stroke-width%3D%222.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[position:right_10px_center] bg-no-repeat px-3 py-2.5 pr-9 font-sans text-[0.85rem] text-cream transition-colors focus:border-gold/50 focus:outline-none"
        >
          <option value="" disabled style={{ background: "#0d1117", color: "#9ca3af" }}>Select airport</option>
          <option value="LHR" style={{ background: "#0d1117", color: "#f0e6d2" }}>LHR — London Heathrow</option>
          <option value="LGW" style={{ background: "#0d1117", color: "#f0e6d2" }}>LGW — London Gatwick</option>
          <option value="STN" style={{ background: "#0d1117", color: "#f0e6d2" }}>STN — London Stansted</option>
          <option value="LTN" style={{ background: "#0d1117", color: "#f0e6d2" }}>LTN — London Luton</option>
          <option value="SEN" style={{ background: "#0d1117", color: "#f0e6d2" }}>SEN — London Southend</option>
          <option value="MAN" style={{ background: "#0d1117", color: "#f0e6d2" }}>MAN — Manchester</option>
          <option value="BHX" style={{ background: "#0d1117", color: "#f0e6d2" }}>BHX — Birmingham</option>
          <option value="BRS" style={{ background: "#0d1117", color: "#f0e6d2" }}>BRS — Bristol</option>
          <option value="EDI" style={{ background: "#0d1117", color: "#f0e6d2" }}>EDI — Edinburgh</option>
          <option value="GLA" style={{ background: "#0d1117", color: "#f0e6d2" }}>GLA — Glasgow</option>
          <option value="LPL" style={{ background: "#0d1117", color: "#f0e6d2" }}>LPL — Liverpool</option>
        </select>

        {/* Address */}
        <label className="mb-1 block font-sans text-[0.7rem] font-medium uppercase tracking-[0.15em] text-gold">
          {journeyType === "pickup" ? "Drop-off Address" : "Pickup Address"}
        </label>
        <input
          type="text"
          name="address"
          required
          placeholder={journeyType === "pickup" ? "Where are you going?" : "Where are you coming from?"}
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
              name="date"
              required
              className="w-full rounded-[2px] border border-gold/15 bg-[rgba(13,17,23,0.6)] px-3 py-2.5 font-sans text-[0.85rem] text-cream transition-colors focus:border-gold/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block font-sans text-[0.7rem] font-medium uppercase tracking-[0.15em] text-gold">
              Time
            </label>
            <input
              type="time"
              name="time"
              required
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
              name="passengers"
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
              name="luggage"
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
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-[2px] bg-gold py-3 font-sans text-[0.85rem] font-medium uppercase tracking-[0.08em] text-ink transition-colors hover:bg-gold-light disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Getting Prices...
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              Get Instant Quote
            </>
          )}
        </button>
      </form>

      {/* Trust row */}
      <div className="shrink-0 flex items-center justify-center gap-6 border-t border-gold/10 px-6 py-4">
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
