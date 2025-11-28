"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"

type Status = "brouillon" | "envoye" | "paye" | "impaye"

interface UpdateFactureStatusProps {
  factureId: string
  currentStatus: string
  onUpdate?: () => void
}

export function UpdateFactureStatus({ factureId, currentStatus, onUpdate }: UpdateFactureStatusProps) {
  const [status, setStatus] = useState<Status>(currentStatus as Status)
  const [loading, setLoading] = useState(false)

  const handleUpdate = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/facture/${factureId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (!res.ok) {
        throw new Error("Erreur lors de la mise à jour")
      }

      if (onUpdate) {
        onUpdate()
      }
    } catch (error) {
      console.error(error)
      alert("Erreur lors de la mise à jour du statut")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={status}
        onChange={(e) => setStatus(e.target.value as Status)}
        className="w-40"
      >
        <option value="brouillon">Brouillon</option>
        <option value="envoye">Envoyée</option>
        <option value="impaye">Impayée</option>
        <option value="paye">Payée</option>
      </Select>
      <Button
        onClick={handleUpdate}
        disabled={loading || status === currentStatus}
        size="sm"
      >
        {loading ? "Mise à jour..." : "Mettre à jour"}
      </Button>
    </div>
  )
}

