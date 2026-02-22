"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function DeleteAccountSection() {
  const [confirmation, setConfirmation] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState("")

  async function handleDelete() {
    if (confirmation !== "DELETE") {
      setError("Please type DELETE to confirm")
      return
    }
    setIsDeleting(true)
    setError("")
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteAccount" }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Failed to delete account")
        return
      }
      window.location.href = "/"
    } catch {
      setError("An error occurred. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  if (!showConfirm) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Once you delete your account, your personal data will be anonymised. This action cannot be undone.
        </p>
        <Button variant="destructive" onClick={() => setShowConfirm(true)}>
          Delete My Account
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 rounded-lg border border-red-200 bg-red-50 p-4">
      <p className="text-sm font-medium text-red-800">
        This action is permanent. Type <strong>DELETE</strong> to confirm.
      </p>
      <div className="space-y-2">
        <Label htmlFor="delete-confirm">Confirmation</Label>
        <Input
          id="delete-confirm"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          placeholder='Type "DELETE" to confirm'
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => { setShowConfirm(false); setConfirmation(""); setError("") }}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting || confirmation !== "DELETE"}>
          {isDeleting ? "Deleting..." : "Permanently Delete Account"}
        </Button>
      </div>
    </div>
  )
}
