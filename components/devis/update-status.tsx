"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"

type Status = "brouillon" | "envoye" | "signe" | "refuse" | "expire"

interface UpdateStatusProps {
  devisId: string
  currentStatus: string
  onUpdate?: () => void
}

export function UpdateDevisStatus({ devisId, currentStatus, onUpdate }: UpdateStatusProps) {
  const [status, setStatus] = useState<Status>(currentStatus as Status)
  const [loading, setLoading] = useState(false)

  const handleUpdate = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/devis/${devisId}/status`, {
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
        <option value="envoye">Envoyé</option>
        <option value="signe">Signé</option>
        <option value="refuse">Refusé</option>
        <option value="expire">Expiré</option>
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

