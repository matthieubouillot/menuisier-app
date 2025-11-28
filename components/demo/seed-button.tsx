"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export function SeedButton() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const router = useRouter()

  const handleSeed = async () => {
    if (!confirm("Voulez-vous générer des données de démonstration ? Cela ajoutera des clients, projets, devis, factures et événements à votre compte.")) {
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch("/api/demo/seed", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la génération")
      }

      setMessage({
        type: "success",
        text: `✅ Données créées avec succès ! ${data.data.clients} clients, ${data.data.projects} projets, ${data.data.devis} devis, ${data.data.factures} factures, ${data.data.events} événements, ${data.data.calculations} calculs.`,
      })

      // Rafraîchir la page après 2 secondes
      setTimeout(() => {
        router.refresh()
      }, 2000)
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Erreur lors de la génération des données",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mb-6">
      <Button
        onClick={handleSeed}
        disabled={loading}
        variant="outline"
        size="lg"
        className="w-full sm:w-auto"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Génération en cours...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-5 w-5" />
            Générer des données de démonstration
          </>
        )}
      </Button>
      {message && (
        <div
          className={`mt-4 p-4 rounded-2xl ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border-2 border-green-200"
              : "bg-red-50 text-red-800 border-2 border-red-200"
          }`}
        >
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}
    </div>
  )
}

