"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Plus, Calendar as CalendarIcon, Clock, MapPin } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface CalendarEvent {
  id: string
  title: string
  description: string | null
  startDate: string
  endDate: string | null
  type: string
  location: string | null
}

export default function CalendrierPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    type: "chantier",
    location: "",
  })

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    const res = await fetch("/api/calendar")
    if (res.ok) {
      const data = await res.json()
      setEvents(data)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          endDate: formData.endDate || null,
        }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la création")
      }

      setShowForm(false)
      setFormData({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        type: "chantier",
        location: "",
      })
      fetchEvents()
    } catch (error) {
      console.error(error)
      alert("Erreur lors de la création de l'événement")
    }
  }

  const upcomingEvents = events
    .filter((event) => new Date(event.startDate) >= new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 10)

  const today = new Date()
  const todayEvents = events.filter(
    (event) => new Date(event.startDate).toDateString() === today.toDateString()
  )

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 lg:mb-12 gap-4">
          <h1 className="text-4xl font-bold text-foreground">Calendrier</h1>
          <Button onClick={() => setShowForm(!showForm)} size="lg" className="w-full sm:w-auto">
            <Plus className="mr-2 h-5 w-5" />
            Nouvel événement
          </Button>
        </div>

        {showForm && (
          <Card className="mb-6 lg:mb-8 hover:shadow-xl transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <CalendarIcon className="mr-3 h-6 w-6 text-primary" />
                Nouvel événement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Titre *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select
                      id="type"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="chantier">Chantier</option>
                      <option value="rendez_vous">Rendez-vous</option>
                      <option value="maintenance">Maintenance</option>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Date de début *</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Date de fin</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Lieu</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                <div className="flex gap-4 pt-2">
                  <Button type="submit" size="lg" className="flex-1 sm:flex-none">Créer</Button>
                  <Button type="button" variant="outline" size="lg" onClick={() => setShowForm(false)} className="flex-1 sm:flex-none">
                    Annuler
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2">
            <Card className="hover:shadow-xl transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <CalendarIcon className="mr-3 h-6 w-6 text-primary" />
                  Tous les événements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {events.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">Aucun événement</p>
                  ) : (
                    events
                      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                      .map((event) => (
                        <div key={event.id} className="p-5 rounded-2xl bg-secondary/50 hover:bg-secondary transition-all border-2 border-transparent hover:border-primary/20">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-base mb-2">{event.title}</h3>
                              {event.description && (
                                <p className="text-sm text-muted-foreground mb-3">
                                  {event.description}
                                </p>
                              )}
                              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                <span className="flex items-center">
                                  <Clock className="mr-1 h-4 w-4" />
                                  {formatDate(event.startDate)}
                                </span>
                                {event.location && (
                                  <span className="flex items-center">
                                    <MapPin className="mr-1 h-4 w-4" />
                                    {event.location}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap ${
                              event.type === "chantier" ? "bg-green-100 text-green-700" :
                              event.type === "rendez_vous" ? "bg-blue-100 text-blue-700" :
                              "bg-muted text-muted-foreground"
                            }`}>
                              {event.type}
                            </span>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {todayEvents.length > 0 && (
              <Card className="hover:shadow-xl transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="text-xl">Aujourd'hui</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {todayEvents.map((event) => (
                      <div key={event.id} className="p-4 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors">
                        <p className="font-semibold text-sm">{event.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(event.startDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="hover:shadow-xl transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="text-xl">À venir</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {upcomingEvents.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Aucun événement à venir</p>
                  ) : (
                    upcomingEvents.map((event) => (
                      <div key={event.id} className="p-4 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors">
                        <p className="font-semibold text-sm">{event.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(event.startDate)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

