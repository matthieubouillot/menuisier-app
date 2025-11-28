"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { cn } from "@/lib/utils"

type ClientType = "particulier" | "professionnel"

type Client = {
  id: string
  firstName: string
  lastName: string
  companyName?: string | null
  siret?: string | null
  type: ClientType
  email?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  postalCode?: string | null
  notes?: string | null
}

const emptyClient = {
  firstName: "",
  lastName: "",
  companyName: "",
  siret: "",
  type: "particulier" as ClientType,
  email: "",
  phone: "",
  address: "",
  city: "",
  postalCode: "",
  notes: "",
}

const filterOptions: { label: string; value: "all" | ClientType }[] = [
  { label: "Tous", value: "all" },
  { label: "Professionnels", value: "professionnel" },
  { label: "Particuliers", value: "particulier" },
]

export function ClientsManager() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState(emptyClient)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filter, setFilter] = useState<"all" | ClientType>("all")

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/clients")
      if (!res.ok) {
        throw new Error("Impossible de récupérer les clients.")
      }
      const data = await res.json()
      setClients(data)
    } catch (err: any) {
      setError(err.message || "Erreur inconnue.")
    } finally {
      setLoading(false)
    }
  }

  const filteredClients = useMemo(() => {
    if (filter === "all") return clients
    return clients.filter((client) => client.type === filter)
  }, [clients, filter])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setError(null)

    if (!form.firstName || !form.lastName) {
      setError("Le prénom et le nom sont obligatoires.")
      return
    }

    if (form.type === "professionnel") {
      if (!form.companyName.trim()) {
        setError("Le nom de l'entreprise est obligatoire pour un client professionnel.")
        return
      }
      if (!form.siret?.trim()) {
        setError("Le numéro de SIRET est obligatoire pour un client professionnel.")
        return
      }
    }

    setCreating(true)
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error || "Impossible d'ajouter ce client.")
      }

      const newClient = await res.json()
      setClients((prev) => [...prev, newClient])
      setForm(emptyClient)
      setIsModalOpen(false)
      setMessage("Client ajouté avec succès.")
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'ajout.")
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    const client = clients.find((c) => c.id === id)
    if (!client) return

    const confirmed = window.confirm(
      `Supprimer le client ${client.companyName ?? `${client.firstName} ${client.lastName}`} ?`
    )
    if (!confirmed) return

    setDeletingId(id)
    setError(null)
    setMessage(null)

    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error || "Impossible de supprimer ce client.")
      }

      setClients((prev) => prev.filter((client) => client.id !== id))
      setMessage("Client supprimé.")
    } catch (err: any) {
      setError(err.message || "Erreur lors de la suppression.")
    } finally {
      setDeletingId(null)
    }
  }

  const renderClientCard = (client: Client) => (
    <div
      key={client.id}
      className="rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <p className="font-semibold text-foreground">
          {client.type === "professionnel" && client.companyName
            ? client.companyName
            : `${client.firstName} ${client.lastName}`}
        </p>
        <p className="text-xs uppercase tracking-wide font-medium text-muted-foreground">
          {client.type === "professionnel" ? "Professionnel" : "Particulier"}
        </p>
        <div className="text-sm text-muted-foreground space-y-1 mt-2">
          {client.type === "professionnel" && client.companyName && (
            <p>Contact : {client.firstName} {client.lastName}</p>
          )}
          {client.siret && <p>SIRET : {client.siret}</p>}
          {client.email && <p>Email : {client.email}</p>}
          {client.phone && <p>Téléphone : {client.phone}</p>}
          {(client.address || client.postalCode || client.city) && (
            <p>
              {client.address && `${client.address}, `}
              {client.postalCode} {client.city}
            </p>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="text-destructive"
        onClick={() => handleDelete(client.id)}
        disabled={deletingId === client.id}
      >
        {deletingId === client.id ? "Suppression..." : "Supprimer"}
      </Button>
    </div>
  )

  const sections =
    filter === "all"
      ? (["professionnel", "particulier"] as ClientType[]).map((type) => ({
          title: type === "professionnel" ? "Clients professionnels" : "Clients particuliers",
          clients: clients.filter((client) => client.type === type),
        }))
      : [
          {
            title: filter === "professionnel" ? "Clients professionnels" : "Clients particuliers",
            clients: filteredClients,
          },
        ]

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="inline-flex rounded-2xl border bg-card p-1">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value)}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-xl transition-colors",
                  filter === option.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)}>
            Créer un client
          </Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {message && !error && <p className="text-sm text-primary">{message}</p>}

        {loading ? (
          <p className="text-sm text-muted-foreground">Chargement des clients...</p>
        ) : clients.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun client enregistré pour le moment.</p>
        ) : (
          <div className="space-y-6">
            {sections.map(({ title, clients }) =>
              clients.length === 0 ? null : (
                <div key={title} className="space-y-3">
                  <p className="text-sm font-semibold text-muted-foreground">{title}</p>
                  <div className="space-y-3">{clients.map(renderClientCard)}</div>
                </div>
              )
            )}
          </div>
        )}
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-2xl rounded-3xl border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <p className="text-lg font-semibold text-foreground">Créer un client</p>
                <p className="text-sm text-muted-foreground">
                  Ajoutez rapidement un client professionnel ou particulier.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsModalOpen(false)
                  setForm(emptyClient)
                }}
              >
                Fermer
              </Button>
            </div>
            <form onSubmit={handleCreate} className="px-6 py-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type de client *</Label>
                  <Select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as ClientType })}
                  >
                    <option value="particulier">Particulier</option>
                    <option value="professionnel">Professionnel</option>
                  </Select>
                </div>
                {form.type === "professionnel" && (
                  <>
                    <div className="space-y-2">
                      <Label>Nom de l'entreprise *</Label>
                      <Input
                        value={form.companyName}
                        onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                        required={form.type === "professionnel"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Numéro de SIRET *</Label>
                      <Input
                        value={form.siret || ""}
                        onChange={(e) => setForm({ ...form, siret: e.target.value })}
                        required={form.type === "professionnel"}
                      />
                      <p className="text-xs text-muted-foreground">
                        Obligatoire pour les clients professionnels.
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prénom *</Label>
                  <Input
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nom *</Label>
                  <Input
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Adresse</Label>
                <Input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ville</Label>
                  <Input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Code postal</Label>
                  <Input
                    value={form.postalCode}
                    onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                {error && <p className="text-sm text-destructive">{error}</p>}
                {message && !error && <p className="text-sm text-primary">{message}</p>}
                <div className="flex gap-2 ml-auto">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsModalOpen(false)
                      setForm(emptyClient)
                    }}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={creating}>
                    {creating ? "Ajout en cours..." : "Enregistrer le client"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

