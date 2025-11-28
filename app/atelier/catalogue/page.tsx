"use client"

import { useEffect, useState } from "react"
import { Edit2, Trash2 } from "lucide-react"

import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils"

type CatalogMaterial = {
  id: string
  name: string
  category: string
  unit: string
  unitPrice: number
  supplier?: string | null
  updatedAt: string
}

const emptyMaterialForm = {
  name: "",
  category: "bois",
  unit: "",
  unitPrice: "",
  supplier: "",
}

export default function CatalogueMateriauxPage() {
  const [materials, setMaterials] = useState<CatalogMaterial[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyMaterialForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMaterials()
  }, [])

  const fetchMaterials = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/materials")
      if (!res.ok) throw new Error("Impossible de charger vos matériaux.")
      const data = await res.json()
      setMaterials(data)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Erreur inconnue.")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setMessage(null)

    if (!form.name.trim()) {
      setError("Le nom est obligatoire.")
      return
    }
    if (!form.unit.trim()) {
      setError("L'unité est obligatoire.")
      return
    }
    const parsedPrice = parseFloat(form.unitPrice)
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      setError("Indique un prix unitaire valide.")
      return
    }

    try {
      const payload = {
        name: form.name.trim(),
        category: form.category.trim(),
        unit: form.unit.trim(),
        unitPrice: parsedPrice,
        supplier: form.supplier?.trim() || null,
      }
      const url = editingId ? `/api/materials/${editingId}` : "/api/materials"
      const method = editingId ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error || "Impossible d'enregistrer le matériau.")
      }
      await fetchMaterials()
      setMessage(editingId ? "Matériau mis à jour." : "Matériau ajouté.")
      setForm(emptyMaterialForm)
      setEditingId(null)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Erreur inconnue.")
    }
  }

  const handleEdit = (material: CatalogMaterial) => {
    setForm({
      name: material.name,
      category: material.category,
      unit: material.unit,
      unitPrice: material.unitPrice.toString(),
      supplier: material.supplier || "",
    })
    setEditingId(material.id)
    setMessage(null)
    setError(null)
  }

  const handleDelete = async (material: CatalogMaterial) => {
    const confirmed = window.confirm(`Supprimer ${material.name} ?`)
    if (!confirmed) return
    try {
      const res = await fetch(`/api/materials/${material.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Impossible de supprimer ce matériau.")
      await fetchMaterials()
      setMessage("Matériau supprimé.")
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Erreur inconnue.")
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(emptyMaterialForm)
    setMessage(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-10">
        <div>
          <p className="text-sm uppercase tracking-widest text-muted-foreground mb-2">
            Catalogue personnel
          </p>
          <h1 className="text-4xl font-bold text-foreground mb-3">Tes tarifs fournisseurs</h1>
          <p className="text-base text-muted-foreground max-w-3xl">
            Chaque prix défini ici est automatiquement utilisé dans les devis, le chiffrage
            personnalisé et les calculs sauvegardés. Mets à jour ton référentiel en quelques secondes.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card className="hover:shadow-xl transition-shadow duration-200">
            <CardHeader>
              <CardTitle>{editingId ? "Modifier un matériau" : "Ajouter un matériau"}</CardTitle>
              <CardDescription>
                Définis l'unité de mesure (m², m, kg, unité...) et le prix pour UNE unité. Optionnel :
                fournisseur pour référence.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nom *</Label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Catégorie</Label>
                    <Select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                    >
                      <option value="bois">Bois</option>
                      <option value="quincaillerie">Quincaillerie</option>
                      <option value="fourniture">Fourniture</option>
                      <option value="finitions">Finitions</option>
                      <option value="autre">Autre</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Unité de mesure *{" "}
                      <span className="text-xs text-muted-foreground font-normal">
                        (m², m, kg, unité, lot...)
                      </span>
                    </Label>
                    <Input
                      value={form.unit}
                      onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Prix unitaire (€) *{" "}
                      <span className="text-xs text-muted-foreground font-normal">
                        (prix pour 1 unité)
                      </span>
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={form.unitPrice}
                      onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Fournisseur</Label>
                  <Input
                    value={form.supplier}
                    onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                  />
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}
                {message && !error && <p className="text-sm text-primary">{message}</p>}

                <div className="flex flex-wrap gap-3">
                  <Button type="submit">
                    {editingId ? "Mettre à jour" : "Ajouter au catalogue"}
                  </Button>
                  {editingId && (
                    <Button type="button" variant="ghost" onClick={cancelEdit}>
                      Annuler
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow duration-200">
            <CardHeader>
              <CardTitle>Mes matériaux</CardTitle>
              <CardDescription>
                {loading
                  ? "Chargement..."
                  : "Dernières mises à jour classées du plus récent au plus ancien."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-muted-foreground">Chargement des matériaux...</p>
              ) : materials.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aucun matériau enregistré pour le moment.
                </p>
              ) : (
                <div className="space-y-3">
                  {materials.map((material) => (
                    <div
                      key={material.id}
                      className="border rounded-2xl p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="font-semibold text-foreground">{material.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {material.category} • {material.unit} • {formatCurrency(material.unitPrice)}
                        </p>
                        {material.supplier && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Fournisseur : {material.supplier}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(material)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Modifier
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleDelete(material)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

