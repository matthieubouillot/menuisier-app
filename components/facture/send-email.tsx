"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Send } from "lucide-react"

interface SendFactureEmailProps {
  factureId: string
  clientEmail?: string | null
  onSent?: () => void
}

export function SendFactureEmail({ factureId, clientEmail, onSent }: SendFactureEmailProps) {
  const [email, setEmail] = useState(clientEmail || "")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSend = async () => {
    if (!email || !email.includes("@")) {
      setError("Veuillez renseigner une adresse email valide")
      return
    }

    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const res = await fetch(`/api/facture/${factureId}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de l'envoi")
      }

      setMessage("Facture envoyée par email avec succès !")
      if (onSent) {
        onSent()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'envoi")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Adresse email du client</Label>
        <div className="flex gap-2">
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="client@exemple.com"
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={loading || !email}
            size="lg"
          >
            {loading ? (
              "Envoi..."
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Envoyer
              </>
            )}
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      
      {message && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700 flex items-center gap-2">
          <Mail className="h-4 w-4" />
          {message}
        </div>
      )}
      
      <p className="text-xs text-muted-foreground">
        La facture sera envoyée par email avec un lien sécurisé. Le client pourra la consulter et effectuer le paiement.
      </p>
    </div>
  )
}

