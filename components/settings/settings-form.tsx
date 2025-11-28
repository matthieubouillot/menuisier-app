"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface User {
  name: string | null
  email: string
  companyName: string | null
  address: string | null
  city: string | null
  postalCode: string | null
  phone: string | null
  siret: string | null
  rcs: string | null
  vatNumber: string | null
  legalMentions: string | null
  paymentTerms: string | null
  paymentMethod: string | null
}

export function SettingsForm({ user }: { user: User }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    name: user.name || "",
    companyName: user.companyName || "",
    address: user.address || "",
    city: user.city || "",
    postalCode: user.postalCode || "",
    phone: user.phone || "",
    siret: user.siret || "",
    rcs: user.rcs || "",
    vatNumber: user.vatNumber || "",
    legalMentions: user.legalMentions || `En cas de retard de paiement, des pénalités de retard au taux de 3 fois le taux d'intérêt légal en vigueur seront appliquées, ainsi qu'une indemnité forfaitaire pour frais de recouvrement de 40€.`,
    paymentTerms: user.paymentTerms || "Paiement à réception de facture. Délai de paiement : 30 jours.",
    paymentMethod: user.paymentMethod || "Virement bancaire (IBAN à préciser) ou chèque.",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setLoading(true)

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erreur lors de la sauvegarde")
      }

      setSuccess(true)
      router.refresh()
      setTimeout(() => setSuccess(false), 3000)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">Nom complet *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="companyName" className="text-sm font-medium">Nom de l'entreprise</Label>
          <Input
            id="companyName"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            className="w-full"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address" className="text-sm font-medium">Adresse complète *</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          required
          className="w-full"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="postalCode" className="text-sm font-medium">Code postal *</Label>
          <Input
            id="postalCode"
            value={formData.postalCode}
            onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
            required
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city" className="text-sm font-medium">Ville *</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            required
            className="w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium">Téléphone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="siret" className="text-sm font-medium">
            SIRET <span className="text-red-600">*</span>
            <span className="text-xs text-muted-foreground ml-2">(obligatoire pour factures)</span>
          </Label>
          <Input
            id="siret"
            value={formData.siret}
            onChange={(e) => setFormData({ ...formData, siret: e.target.value })}
            className="w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="rcs" className="text-sm font-medium">RCS</Label>
          <Input
            id="rcs"
            value={formData.rcs}
            onChange={(e) => setFormData({ ...formData, rcs: e.target.value })}
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vatNumber" className="text-sm font-medium">Numéro TVA intracommunautaire</Label>
          <Input
            id="vatNumber"
            value={formData.vatNumber}
            onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
            className="w-full"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="paymentTerms" className="text-sm font-medium">Conditions de paiement par défaut</Label>
        <Textarea
          id="paymentTerms"
          value={formData.paymentTerms}
          onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
          rows={3}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="paymentMethod" className="text-sm font-medium">Moyens de paiement acceptés</Label>
        <Textarea
          id="paymentMethod"
          value={formData.paymentMethod}
          onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
          rows={3}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          Ce texte sera affiché sur vos factures pour indiquer clairement les moyens de paiement acceptés.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="legalMentions" className="text-sm font-medium">Mentions légales</Label>
        <Textarea
          id="legalMentions"
          value={formData.legalMentions}
          onChange={(e) => setFormData({ ...formData, legalMentions: e.target.value })}
          rows={5}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          Les mentions légales obligatoires (pénalités de retard, indemnité forfaitaire) sont automatiquement ajoutées sur les factures.
        </p>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-xl">{error}</div>
      )}

      {success && (
        <div className="text-sm text-green-600 bg-green-50 p-3 rounded-xl">
          ✅ Paramètres sauvegardés avec succès !
        </div>
      )}

      <Button type="submit" className="w-full sm:w-auto" disabled={loading} size="lg">
        {loading ? "Sauvegarde..." : "Enregistrer les paramètres"}
      </Button>
    </form>
  )
}

