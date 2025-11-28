"use client"

import Link from "next/link"
import { Archive, Calculator } from "lucide-react"

import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AtelierPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-10">
        <div>
          <p className="text-sm uppercase tracking-widest text-muted-foreground mb-2">
            Mon atelier
          </p>
          <h1 className="text-4xl font-bold text-foreground mb-3">Centralise et chiffre plus vite</h1>
          <p className="text-base text-muted-foreground max-w-3xl">
            Gère tes tarifs fournisseurs dans un catalogue unique puis utilise-les pour composer des
            devis sur-mesure avec marge et main-d'œuvre calculées automatiquement. Choisis ce que tu veux
            faire ci-dessous.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="hover:shadow-xl transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Archive className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle className="text-2xl">Catalogue personnel</CardTitle>
                  <CardDescription>
                    Ajoute, mets à jour ou supprime tes matériaux, unités, prix et références fournisseur.
                    Chaque tarif est propre à ton entreprise.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                <li>Gestion complète des prix unitaires et unités</li>
                <li>Références internes pour relier le calculateur auto</li>
                <li>Historique mis à jour en temps réel dans toute l'app</li>
              </ul>
              <div className="flex flex-wrap gap-3">
                <Link href="/atelier/catalogue">
                  <Button size="lg">Ouvrir le catalogue</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Calculator className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle className="text-2xl">Chiffrage personnalisé</CardTitle>
                  <CardDescription>
                    Compose un devis matière + main-d'œuvre à partir de ton catalogue et garde la trace
                    de chaque simulation pour la réutiliser.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                <li>Ajout de lignes depuis le catalogue ou totalement libres</li>
                <li>Marge (%) et main-d'œuvre (€) appliquées automatiquement</li>
                <li>Sauvegarde dans l'historique pour les devis/factures</li>
              </ul>
              <div className="flex flex-wrap gap-3">
                <Link href="/atelier/chiffrage">
                  <Button variant="outline" size="lg">
                    Accéder au chiffrage
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

