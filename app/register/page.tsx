"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    companyName: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erreur lors de l'inscription")
      }

      router.push("/login?registered=true")
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-2xl">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl font-bold mb-2">Inscription</CardTitle>
            <CardDescription className="text-base">
            Créez votre compte Menuisier Pro
          </CardDescription>
        </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Nom</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                  className="w-full"
              />
            </div>
            <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                  className="w-full"
              />
            </div>
            <div className="space-y-2">
                <Label htmlFor="companyName" className="text-sm font-medium">Nom de l'entreprise (optionnel)</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full"
              />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
                  className="w-full"
              />
            </div>
            {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-xl">{error}</div>
            )}
              <Button type="submit" className="w-full" disabled={loading} size="lg">
              {loading ? "Inscription..." : "S'inscrire"}
            </Button>
            </form>
            <div className="text-center text-sm pt-4">
              <Link href="/login" className="text-primary hover:underline font-medium">
                Déjà un compte ? Se connecter
              </Link>
            </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}

