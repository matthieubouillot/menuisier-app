"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

export function MarkAsPaidButton({ factureId }: { factureId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleMarkAsPaid = async () => {
    if (!confirm("Marquer cette facture comme payée ?")) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/factures/${factureId}/mark-as-paid`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour")
      }

      router.refresh()
    } catch (error) {
      console.error(error)
      alert("Erreur lors de la mise à jour")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleMarkAsPaid} disabled={loading} variant="default">
      <Check className="mr-2 h-4 w-4" />
      {loading ? "Mise à jour..." : "Marquer comme payée"}
    </Button>
  )
}

