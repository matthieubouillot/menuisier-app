"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Receipt } from "lucide-react"

export function ConvertToFactureButton({ devisId }: { devisId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleConvert = async () => {
    if (!confirm("Voulez-vous convertir ce devis en facture ?")) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/devis/${devisId}/convert-to-facture`, {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Erreur lors de la conversion")
      }

      const data = await response.json()
      router.push(`/devis/facture/${data.id}`)
      router.refresh()
    } catch (error) {
      console.error(error)
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de la conversion en facture"
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleConvert} disabled={loading} size="lg" className="w-full sm:w-auto">
      <Receipt className="h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" />
      <span className="hidden sm:inline">{loading ? "Conversion..." : "Convertir en facture"}</span>
    </Button>
  )
}

