import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatClientName, formatCurrency, formatDate } from "@/lib/utils"
import { FileText, Euro, Calendar, TrendingUp } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SeedButton } from "@/components/demo/seed-button"

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  const userId = session.user.id

  // Récupérer les statistiques
  const [
    totalDevis,
    totalFactures,
    totalCA,
    facturesPayees,
    facturesImpayees,
    projetsEnCours,
    devisEnAttente,
  ] = await Promise.all([
    prisma.devis.count({ where: { userId } }),
    prisma.facture.count({ where: { userId } }),
    prisma.facture.aggregate({
      where: { userId, status: "paye" },
      _sum: { totalTTC: true },
    }),
    prisma.facture.count({ where: { userId, status: "paye" } }),
    prisma.facture.count({ where: { userId, status: "impaye" } }),
    prisma.project.count({ where: { userId, status: "en_cours" } }),
    prisma.devis.count({ where: { userId, status: "envoye" } }),
  ])

  const caTotal = totalCA._sum.totalTTC || 0
  const facturesImpayeesMontant = await prisma.facture.aggregate({
    where: { userId, status: "impaye" },
    _sum: { totalTTC: true },
  })

  const montantImpaye = facturesImpayeesMontant._sum.totalTTC || 0

  // Derniers devis
  const derniersDevis = await prisma.devis.findMany({
    where: { userId },
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { client: true },
  })

  // Dernières factures
  const dernieresFactures = await prisma.facture.findMany({
    where: { userId },
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { client: true },
  })

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 lg:mb-12 gap-4">
          <h1 className="text-4xl font-bold text-foreground">Tableau de bord</h1>
          <SeedButton />
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8 lg:mb-12">
          <Card className="hover:shadow-xl transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold">Chiffre d'affaires</CardTitle>
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Euro className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{formatCurrency(caTotal)}</div>
              <p className="text-xs text-muted-foreground">
                {facturesPayees} factures payées
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold">En attente</CardTitle>
              <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{formatCurrency(montantImpaye)}</div>
              <p className="text-xs text-muted-foreground">
                {facturesImpayees} factures impayées
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold">Devis en attente</CardTitle>
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{devisEnAttente}</div>
              <p className="text-xs text-muted-foreground">
                Sur {totalDevis} devis au total
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold">Projets en cours</CardTitle>
              <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{projetsEnCours}</div>
              <p className="text-xs text-muted-foreground">
                Chantiers actifs
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Derniers devis */}
          <Card className="hover:shadow-xl transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Derniers devis</CardTitle>
                <Link href="/devis">
                  <Button variant="outline" size="sm" className="rounded-xl">Voir tout</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {derniersDevis.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Aucun devis</p>
                ) : (
                  derniersDevis.map((devis) => (
                    <div key={devis.id} className="flex items-center justify-between p-4 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors">
                      <div>
                        <p className="font-semibold text-base">{devis.number}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatClientName(devis.client)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatCurrency(devis.totalTTC)}</p>
                        <p className="text-xs text-muted-foreground mt-1">{formatDate(devis.createdAt)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Dernières factures */}
          <Card className="hover:shadow-xl transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Dernières factures</CardTitle>
                <Link href="/devis">
                  <Button variant="outline" size="sm" className="rounded-xl">Voir tout</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dernieresFactures.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Aucune facture</p>
                ) : (
                  dernieresFactures.map((facture) => (
                    <div key={facture.id} className="flex items-center justify-between p-4 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors">
                      <div>
                        <p className="font-semibold text-base">{facture.number}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatClientName(facture.client)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatCurrency(facture.totalTTC)}</p>
                        <p className={`text-xs font-medium mt-1 ${facture.status === "paye" ? "text-green-600" : "text-orange-600"}`}>
                          {facture.status === "paye" ? "Payée" : "Impayée"}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

