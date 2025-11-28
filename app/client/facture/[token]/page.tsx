import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatClientName, formatCurrency, formatDate } from "@/lib/utils"
import { Receipt, Building2, User, Calendar, CheckCircle2, Clock, AlertCircle, Download } from "lucide-react"
import { notFound } from "next/navigation"

export default async function ClientFacturePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const facture = await prisma.facture.findUnique({
    where: { clientToken: token },
    include: {
      client: true,
      project: true,
      items: true,
      devis: true,
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
          legalMentions: true,
          paymentMethod: true,
        },
      },
    },
  })

  if (!facture) {
    notFound()
  }

  const statusConfig = {
    paye: { label: "Payée", icon: CheckCircle2, color: "text-green-600 bg-green-50" },
    impaye: { label: "Impayée", icon: AlertCircle, color: "text-orange-600 bg-orange-50" },
    envoye: { label: "Envoyée", icon: Clock, color: "text-blue-600 bg-blue-50" },
    brouillon: { label: "Brouillon", icon: Clock, color: "text-gray-600 bg-gray-50" },
  }

  const status = statusConfig[facture.status as keyof typeof statusConfig] || statusConfig.brouillon
  const StatusIcon = status.icon
  const isVatApplicable = facture.isVatApplicable !== false

  // Calcul des pénalités de retard (3 fois le taux d'intérêt légal, actuellement ~0.4% par mois)
  const tauxInteretLegal = 0.04 // 4% par an = ~0.33% par mois, arrondi à 0.4%
  const tauxPenalite = tauxInteretLegal * 3 // 3 fois le taux d'intérêt légal
  const joursRetard = facture.dueDate && facture.status === "impaye" 
    ? Math.max(0, Math.floor((new Date().getTime() - new Date(facture.dueDate).getTime()) / (1000 * 60 * 60 * 24)))
    : 0

  return (
    <div className="min-h-screen bg-background py-8 lg:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <div className="mb-6 flex justify-end">
          <a href={`/api/client/facture/${token}/pdf`} download={`Facture-${facture.number}.pdf`}>
            <Button size="lg" className="rounded-xl">
              <Download className="mr-2 h-5 w-5" />
              Télécharger le PDF
            </Button>
          </a>
        </div>
        {/* En-tête légal */}
        <div className="mb-8 text-center border-b-2 border-primary/20 pb-6">
          <p className="text-5xl font-bold tracking-widest text-primary mb-4">FACTURE</p>
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 uppercase tracking-wide">
              <Building2 className="h-4 w-4" />
              Vendeur
            </h2>
            <h1 className="text-3xl font-bold text-foreground">
              {facture.user.companyName || facture.user.name || "Menuisier Pro"}
            </h1>
          </div>
          {!facture.user.address && (
            <p className="text-red-600 text-sm font-medium">
              ⚠️ Adresse obligatoire manquante pour une facture légale
            </p>
          )}
          {facture.user.address && (
            <p className="text-muted-foreground">
              {facture.user.address}
              {facture.user.postalCode && facture.user.city && `, ${facture.user.postalCode} ${facture.user.city}`}
            </p>
          )}
          {facture.user.phone && (
            <p className="text-muted-foreground">Tél: {facture.user.phone}</p>
          )}
          {facture.user.email && (
            <p className="text-muted-foreground">Email: {facture.user.email}</p>
          )}
          {!facture.user.siret && (
            <p className="text-red-600 text-sm font-medium">
              ⚠️ SIRET obligatoire manquant pour une facture légale
            </p>
          )}
          {facture.user.siret && (
            <p className="text-sm text-muted-foreground">SIRET: {facture.user.siret}</p>
          )}
          {facture.user.rcs && (
            <p className="text-sm text-muted-foreground">RCS: {facture.user.rcs}</p>
          )}
          {facture.user.vatNumber && isVatApplicable && (
            <p className="text-sm text-muted-foreground">TVA intracommunautaire: {facture.user.vatNumber}</p>
          )}
          {!isVatApplicable && (
            <p className="text-sm text-muted-foreground">
              TVA non applicable, article 293 B du CGI (auto-entrepreneur ou franchise en base).
            </p>
          )}
        </div>

        <Card className="hover:shadow-xl transition-shadow duration-200 mb-6">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl mb-2">{facture.title}</CardTitle>
                <p className="text-muted-foreground">Facture n° {facture.number}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {facture.devis && `Référence devis: ${facture.devis.number}`}
                </p>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium ${status.color}`}>
                <StatusIcon className="h-5 w-5" />
                <span>{status.label}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Informations client et dates - OBLIGATOIRES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Facturé à
                </h3>
                {facture.client ? (
                  <div className="space-y-1">
                    <p className="font-medium">
                      {formatClientName(facture.client)}
                    </p>
                    {facture.client.type === "professionnel" && (
                      <p className="text-sm text-muted-foreground">
                        Contact : {facture.client.firstName} {facture.client.lastName}
                      </p>
                    )}
                    {facture.client.address && (
                      <p className="text-sm text-muted-foreground">{facture.client.address}</p>
                    )}
                    {facture.client.postalCode && facture.client.city && (
                      <p className="text-sm text-muted-foreground">
                        {facture.client.postalCode} {facture.client.city}
                      </p>
                    )}
                    {facture.client.siret && (
                      <p className="text-sm text-muted-foreground">SIRET : {facture.client.siret}</p>
                    )}
                    {facture.client.email && (
                      <p className="text-sm text-muted-foreground">{facture.client.email}</p>
                    )}
                    {facture.client.phone && (
                      <p className="text-sm text-muted-foreground">{facture.client.phone}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Non renseigné</p>
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Dates
                </h3>
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Émise le: </span>
                    <span className="font-medium">{formatDate(facture.createdAt)}</span>
                  </p>
                  {facture.dueDate && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">Échéance: </span>
                      <span className={`font-medium ${facture.status === "impaye" && joursRetard > 0 ? "text-red-600" : ""}`}>
                        {formatDate(facture.dueDate)}
                        {facture.status === "impaye" && joursRetard > 0 && (
                          <span className="ml-2 text-xs">({joursRetard} jour{joursRetard > 1 ? "s" : ""} de retard)</span>
                        )}
                      </span>
                    </p>
                  )}
                  {facture.paidAt && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">Payée le: </span>
                      <span className="font-medium text-green-600">{formatDate(facture.paidAt)}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            {facture.description && (
              <div className="pb-6 border-b">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Description</h3>
                <p className="text-sm whitespace-pre-line">{facture.description}</p>
              </div>
            )}

            {/* Lignes de facture - OBLIGATOIRES avec TVA */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Détail des prestations
              </h3>
              <div className="space-y-3">
                {facture.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start p-4 rounded-2xl bg-secondary/50">
                    <div className="flex-1">
                      <p className="font-semibold text-base mb-1">{item.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} {item.unit} × {formatCurrency(item.unitPrice)} HT
                      </p>
                    </div>
                    <p className="font-bold text-lg ml-4">{formatCurrency(item.total)} HT</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Récapitulatif - OBLIGATOIRE */}
            <div className="pt-6 border-t space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total HT</span>
                <span className="font-medium">{formatCurrency(facture.totalHT)}</span>
              </div>
              <div className="flex justify-between text-sm">
                {isVatApplicable ? (
                  <>
                    <span className="text-muted-foreground">TVA ({facture.tvaRate}%)</span>
                    <span className="font-medium">
                      {formatCurrency(facture.totalTTC - facture.totalHT)}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-muted-foreground">TVA</span>
                    <span className="font-medium text-muted-foreground">Non applicable (art. 293 B du CGI)</span>
                  </>
                )}
              </div>
              <div className="flex justify-between text-lg font-bold pt-3 border-t">
                <span>Total TTC</span>
                <span>{formatCurrency(facture.totalTTC)}</span>
              </div>
              {facture.status === "paye" && facture.paidAmount > 0 && (
                <div className="flex justify-between text-sm pt-2 text-green-600">
                  <span>Montant payé</span>
                  <span className="font-medium">{formatCurrency(facture.paidAmount)}</span>
                </div>
              )}
            </div>

            {/* Conditions de paiement - OBLIGATOIRE */}
            <div className="pt-6 border-t space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Conditions de règlement</h3>
                {facture.paymentTerms ? (
                  <p className="text-sm whitespace-pre-line">{facture.paymentTerms}</p>
                ) : (
                  <p className="text-sm text-red-600">⚠️ Délai de paiement non renseigné</p>
                )}
              </div>
              {(facture.paymentMethod || facture.user.paymentMethod) && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">Moyens de paiement acceptés</h3>
                  <p className="text-sm whitespace-pre-line">
                    {facture.paymentMethod || facture.user.paymentMethod}
                  </p>
                </div>
              )}
            </div>

            {/* Mentions légales obligatoires pour factures en France */}
            <div className="pt-6 border-t space-y-3 text-xs text-muted-foreground">
              <p>
                <strong>Mentions légales obligatoires :</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>
                  En cas de retard de paiement, des pénalités de retard au taux de {tauxPenalite.toFixed(2)}% par mois seront appliquées.
                </li>
                <li>
                  Une indemnité forfaitaire pour frais de recouvrement de 40€ sera due en cas de retard de paiement.
                </li>
                <li>
                  Conformément à l'article L. 441-6 du Code de commerce, tout retard de paiement entraîne de plein droit, après mise en demeure restée infructueuse, le versement d'une pénalité de retard calculée sur la base de trois fois le taux d'intérêt légal.
                </li>
                {isVatApplicable ? (
                  facture.user.vatNumber && (
                    <li>
                      Numéro TVA intracommunautaire : {facture.user.vatNumber}
                    </li>
                  )
                ) : (
                  <li>
                    TVA non applicable, art. 293 B du CGI (auto-liquidation).
                  </li>
                )}
              </ul>
              {facture.user.legalMentions && (
                <div className="mt-4 p-3 bg-muted/50 rounded-xl">
                  <p className="font-medium mb-2">Mentions particulières :</p>
                  <p className="whitespace-pre-line">{facture.user.legalMentions}</p>
                </div>
              )}
              {facture.legalMentions && (
                <div className="mt-2 p-3 bg-muted/50 rounded-xl">
                  <p className="font-medium mb-2">Mentions spécifiques à cette facture :</p>
                  <p className="whitespace-pre-line">{facture.legalMentions}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>Document généré le {formatDate(new Date())}</p>
          <p className="mt-1">Ce document a valeur de facture originale.</p>
        </div>
      </div>
    </div>
  )
}
