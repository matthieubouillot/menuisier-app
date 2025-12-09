"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

export function SeedButton() {
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
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

  const handleClear = async () => {
    if (!confirm("⚠️ Êtes-vous sûr de vouloir supprimer toutes les données de démonstration ? Cette action est irréversible et supprimera uniquement les données générées par le bouton \"Générer des données de démonstration\". Vos données personnelles ne seront pas affectées.")) {
      return
    }

    setDeleting(true)
    setMessage(null)

    try {
      const response = await fetch("/api/demo/clear", {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la suppression")
      }

      setMessage({
        type: "success",
        text: `✅ Données supprimées avec succès ! ${data.data.clients} clients, ${data.data.projects} projets, ${data.data.devis} devis, ${data.data.factures} factures, ${data.data.events} événements supprimés.`,
      })

      // Rafraîchir la page après 2 secondes
      setTimeout(() => {
        router.refresh()
      }, 2000)
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Erreur lors de la suppression des données",
      })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="mb-6 space-y-3">
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={handleSeed}
          disabled={loading || deleting}
          variant="outline"
          size="lg"
          className="w-full sm:w-auto"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 sm:mr-2 sm:h-5 sm:w-5 animate-spin" />
              <span className="hidden sm:inline">Génération en cours...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Générer des données de démonstration</span>
            </>
          )}
        </Button>
        <Button
          onClick={handleClear}
          disabled={loading || deleting}
          variant="destructive"
          size="lg"
          className="w-full sm:w-auto"
        >
          {deleting ? (
            <>
              <Loader2 className="h-4 w-4 sm:mr-2 sm:h-5 sm:w-5 animate-spin" />
              <span className="hidden sm:inline">Suppression en cours...</span>
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Supprimer les données de démonstration</span>
            </>
          )}
        </Button>
      </div>
      {message && (
        <div
          className={`p-4 rounded-2xl ${
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

