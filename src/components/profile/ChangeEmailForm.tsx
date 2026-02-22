"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ChangeEmailFormProps {
  currentEmail: string
}

export function ChangeEmailForm({ currentEmail }: ChangeEmailFormProps) {
  const [newEmail, setNewEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage("")
    setError("")

    if (newEmail === currentEmail) {
      setError("New email must be different from current email")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "changeEmail", newEmail }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Failed to send verification email")
        return
      }
      setMessage("Verification email sent. Please check your inbox.")
      setNewEmail("")
    } catch {
      setError("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Current Email</Label>
        <Input value={currentEmail} disabled />
      </div>
      <div className="space-y-2">
        <Label htmlFor="newEmail">New Email</Label>
        <Input id="newEmail" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required />
      </div>
      {message && <p className="text-sm text-green-600">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send Verification Email"}
      </Button>
    </form>
  )
}
