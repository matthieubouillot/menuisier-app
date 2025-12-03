import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatClientName, formatCurrency, formatDate, formatDevisStatus, getDevisStatusClass } from "@/lib/utils"
import Link from "next/link"
import { ArrowLeft, FileText, Receipt, Download } from "lucide-react"
import { ConvertToFactureButton } from "@/components/devis/convert-to-facture"
import { UpdateDevisStatus } from "@/components/devis/update-status"

export default async function DevisDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  const { id } = await params

  const devis = await prisma.devis.findUnique({
    where: { id },
    include: {
      client: true,
      project: true,
      items: true,
      facture: true,
      user: {
        select: {
          name: true,
          companyName: true,
          address: true,
          city: true,
          postalCode: true,
          phone: true,
          email: true,
          siret: true,
          rcs: true,
          vatNumber: true,
        },
      },
    },
  })

  if (!devis || devis.userId !== session.user.id) {
    redirect("/devis")
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <Link href="/devis">
          <Button variant="ghost" className="mb-6 rounded-xl">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </Link>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 lg:mb-12 gap-4">
          <div>
            <h1 className="text-5xl font-bold text-primary mb-2">DEVIS</h1>
            <h2 className="text-3xl font-bold text-foreground mb-2">{devis.title}</h2>
            <p className="text-muted-foreground text-lg font-semibold">N° {devis.number}</p>
            <p className="text-muted-foreground text-sm mt-1">Date d'émission : {formatDate(devis.createdAt)}</p>
            {devis.validUntil && (
              <p className="text-muted-foreground text-sm">Valide jusqu'au : {formatDate(devis.validUntil)}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-4">
            <UpdateDevisStatus devisId={devis.id} currentStatus={devis.status} />
            <a href={`/api/devis/${devis.id}/pdf`} download={`Devis-${devis.number}.pdf`}>
              <Button size="lg" variant="outline" className="rounded-xl">
                <Download className="mr-2 h-5 w-5" />
                Télécharger PDF
              </Button>
            </a>
            {devis.status === "signe" && !devis.facture && (
              <ConvertToFactureButton devisId={devis.id} />
            )}
            {devis.facture && (
              <Link href={`/devis/facture/${devis.facture.id}`}>
                <Button size="lg" className="rounded-xl">
                  <Receipt className="mr-2 h-5 w-5" />
                  Voir la facture
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Coordonnées professionnelles */}
        <Card className="hover:shadow-xl transition-shadow duration-200 mb-6">
          <CardHeader>
            <CardTitle className="text-xl">Coordonnées professionnelles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-1">Nom / Raison sociale</p>
                <p className="font-medium">{devis.user.companyName || devis.user.name || "Non renseigné"}</p>
              </div>
              {devis.user.siret && (
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">SIRET</p>
                  <p className="font-medium">{devis.user.siret}</p>
                </div>
              )}
              {(devis.user.address || devis.user.postalCode || devis.user.city) && (
                <div className="md:col-span-2">
                  <p className="text-sm font-semibold text-muted-foreground mb-1">Adresse</p>
                  <p className="font-medium">
                    {devis.user.address && `${devis.user.address}, `}
                    {devis.user.postalCode && devis.user.city ? `${devis.user.postalCode} ${devis.user.city}` : ""}
                  </p>
                </div>
              )}
              {devis.user.phone && (
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">Téléphone</p>
                  <p className="font-medium">{devis.user.phone}</p>
                </div>
              )}
              {devis.user.email && (
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">Email</p>
                  <p className="font-medium">{devis.user.email}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Coordonnées client */}
        {devis.client && (
          <Card className="hover:shadow-xl transition-shadow duration-200 mb-6">
            <CardHeader>
              <CardTitle className="text-xl">Coordonnées client</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="font-medium text-lg">
                  {formatClientName(devis.client)}
                </p>
                {devis.client.type === "professionnel" && (
                  <p className="text-sm text-muted-foreground">
                    Contact : {devis.client.firstName} {devis.client.lastName}
                  </p>
                )}
                {devis.client.address && (
                  <p className="text-sm text-muted-foreground">{devis.client.address}</p>
                )}
                {devis.client.postalCode && devis.client.city && (
                  <p className="text-sm text-muted-foreground">
                    {devis.client.postalCode} {devis.client.city}
                  </p>
                )}
                {devis.client.siret && (
                  <p className="text-sm text-muted-foreground">SIRET : {devis.client.siret}</p>
                )}
                {devis.client.email && (
                  <p className="text-sm text-muted-foreground">{devis.client.email}</p>
                )}
                {devis.client.phone && (
                  <p className="text-sm text-muted-foreground">{devis.client.phone}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="hover:shadow-xl transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="text-xl">Détails</CardTitle>
              </CardHeader>
              <CardContent>
                {devis.description && (
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-1">Description</p>
                    <p>{devis.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Client</p>
                    <p>{formatClientName(devis.client)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Projet</p>
                    <p>{devis.project ? devis.project.name : "Aucun projet"}</p>
                  </div>
                  {devis.validUntil && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Valide jusqu'au</p>
                      <p className="font-medium">{formatDate(devis.validUntil)}</p>
                    </div>
                  )}
                  {devis.status === "signe" && devis.signedAt && (
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground mb-1">Accepté le</p>
                      <p className="font-medium">{formatDate(devis.signedAt)}</p>
                      {devis.signedByName && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Par : {devis.signedByName}
                          {devis.signedByEmail && ` (${devis.signedByEmail})`}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="text-xl">Lignes de devis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {devis.items.map((item, index) => (
                    <div key={item.id} className="flex justify-between items-center p-4 rounded-2xl bg-secondary/50">
                      <div className="flex-1">
                        <p className="font-semibold text-base">{item.description}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.quantity} {item.unit} × {formatCurrency(item.unitPrice)}
                        </p>
                      </div>
                      <p className="font-bold text-lg">{formatCurrency(item.total)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="hover:shadow-xl transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="text-xl">Récapitulatif</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Total HT</span>
                  <span className="font-medium">{formatCurrency(devis.totalHT)}</span>
                </div>
                {devis.isVatApplicable !== false ? (
                  <div className="flex justify-between">
                    <span>TVA ({devis.tvaRate}%)</span>
                    <span className="font-medium">
                      {formatCurrency(devis.totalTTC - devis.totalHT)}
                    </span>
                  </div>
                ) : (
                  <div className="flex justify-between">
                    <span>TVA</span>
                    <span className="font-medium text-muted-foreground">Non applicable</span>
                  </div>
                )}
                {devis.advancePayment && devis.advancePayment > 0 && (
                  <div className="flex justify-between pt-2 border-t">
                    <span>Acompte</span>
                    <span className="font-medium text-primary">{formatCurrency(devis.advancePayment)}</span>
                  </div>
                )}
                <div className="border-t pt-4 flex justify-between text-lg font-bold">
                  <span>Total TTC</span>
                  <span>{formatCurrency(devis.totalTTC)}</span>
                </div>
                {devis.advancePayment && devis.advancePayment > 0 && (
                  <div className="flex justify-between text-base font-semibold pt-2 border-t text-primary">
                    <span>Reste à payer</span>
                    <span>{formatCurrency(devis.totalTTC - devis.advancePayment)}</span>
                  </div>
                )}
                <div className="pt-4 border-t space-y-2 text-xs text-muted-foreground">
                  <div>
                    <p className="font-semibold text-foreground mb-1">Date d'émission :</p>
                    <p>{formatDate(devis.createdAt)}</p>
                  </div>
                  {devis.validUntil && (
                    <div>
                      <p className="font-semibold text-foreground mb-1">Valide jusqu'au :</p>
                      <p>{formatDate(devis.validUntil)}</p>
                    </div>
                  )}
                  {devis.workStartDate && (
                    <div>
                      <p className="font-semibold text-foreground mb-1">Date de début des travaux :</p>
                      <p>{formatDate(devis.workStartDate)}</p>
                    </div>
                  )}
                  {devis.workDuration && (
                    <div>
                      <p className="font-semibold text-foreground mb-1">Durée estimée des travaux :</p>
                      <p>{devis.workDuration}</p>
                    </div>
                  )}
                  {devis.paymentTerms && (
                    <div>
                      <p className="font-semibold text-foreground mb-1">Délai de paiement :</p>
                      <p>{devis.paymentTerms}</p>
                    </div>
                  )}
                  {devis.travelExpenses && devis.travelExpenses > 0 && (
                    <div>
                      <p className="font-semibold text-foreground mb-1">Frais de déplacement :</p>
                      <p>{formatCurrency(devis.travelExpenses)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Mentions légales */}
        <Card className="hover:shadow-xl transition-shadow duration-200 mt-6">
          <CardHeader>
            <CardTitle className="text-xl">Mentions légales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-foreground mb-2">TVA :</p>
                <p className="text-sm text-muted-foreground">
                  {devis.isVatApplicable !== false
                    ? `TVA applicable au taux de ${devis.tvaRate}%`
                    : "TVA non applicable"}
                </p>
              </div>
              
              {devis.insuranceInfo && (
                <div>
                  <p className="text-sm font-semibold text-foreground mb-2">Assurance professionnelle :</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{devis.insuranceInfo}</p>
                </div>
              )}
              
              {devis.afterSalesService && (
                <div>
                  <p className="text-sm font-semibold text-foreground mb-2">Service après-vente :</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{devis.afterSalesService}</p>
                </div>
              )}
              
              {devis.cgvReference && (
                <div>
                  <p className="text-sm font-semibold text-foreground mb-2">Référence CGV :</p>
                  <p className="text-sm text-muted-foreground">{devis.cgvReference}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm font-semibold text-foreground mb-2">Pénalités de retard :</p>
                <p className="text-sm text-muted-foreground">
                  En cas de retard de paiement, des pénalités de retard au taux de 3 fois le taux d'intérêt légal en vigueur seront appliquées, ainsi qu'une indemnité forfaitaire pour frais de recouvrement de 40€.
                </p>
              </div>
              
              {devis.user.rcs && (
                <div>
                  <p className="text-sm font-semibold text-foreground mb-2">RCS :</p>
                  <p className="text-sm text-muted-foreground">{devis.user.rcs}</p>
                </div>
              )}
              
              {devis.user.vatNumber && devis.isVatApplicable !== false && (
                <div>
                  <p className="text-sm font-semibold text-foreground mb-2">Numéro TVA intracommunautaire :</p>
                  <p className="text-sm text-muted-foreground">{devis.user.vatNumber}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

