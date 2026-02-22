"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface PersonalDetailsFormProps {
  initialName: string
  initialPhone: string | null
}

export function PersonalDetailsForm({ initialName, initialPhone }: PersonalDetailsFormProps) {
  const [name, setName] = useState(initialName)
  const [phone, setPhone] = useState(initialPhone ?? "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage("")
    setError("")
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateProfile", name, phone: phone || null }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Failed to update profile")
        return
      }
      setMessage("Profile updated successfully")
    } catch {
      setError("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" />
      </div>
      {message && <p className="text-sm text-green-600">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  )
}
