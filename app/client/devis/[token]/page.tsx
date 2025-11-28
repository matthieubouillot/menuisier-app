import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatClientName, formatCurrency, formatDate } from "@/lib/utils"
import { FileText, Building2, User, Calendar, CheckCircle2, XCircle, Clock, Download } from "lucide-react"
import { notFound } from "next/navigation"

export default async function ClientDevisPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const devis = await prisma.devis.findUnique({
    where: { clientToken: token },
    include: {
      client: true,
      project: true,
      items: true,
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
        },
      },
    },
  })

  if (!devis) {
    notFound()
  }

  const statusConfig = {
    signe: { label: "Signé", icon: CheckCircle2, color: "text-green-600 bg-green-50" },
    refuse: { label: "Refusé", icon: XCircle, color: "text-red-600 bg-red-50" },
    envoye: { label: "Envoyé", icon: Clock, color: "text-blue-600 bg-blue-50" },
    expire: { label: "Expiré", icon: XCircle, color: "text-gray-600 bg-gray-50" },
    brouillon: { label: "Brouillon", icon: Clock, color: "text-gray-600 bg-gray-50" },
  }

  const status = statusConfig[devis.status as keyof typeof statusConfig] || statusConfig.brouillon
  const StatusIcon = status.icon

  return (
    <div className="min-h-screen bg-background py-8 lg:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <div className="mb-6 flex justify-end">
          <a href={`/api/client/devis/${token}/pdf`} download={`Devis-${devis.number}.pdf`}>
            <Button size="lg" className="rounded-xl">
              <Download className="mr-2 h-5 w-5" />
              Télécharger le PDF
            </Button>
          </a>
        </div>
        {/* Titre "DEVIS" en très gros - OBLIGATOIRE */}
        <div className="mb-8 text-center border-b-4 border-primary pb-6">
          <h1 className="text-6xl font-bold text-primary mb-4">DEVIS</h1>
          <p className="text-2xl font-semibold text-foreground">
            {devis.user.companyName || devis.user.name || "Menuisier Pro"}
          </p>
        </div>

        {/* En-tête avec coordonnées professionnelles du menuisier - OBLIGATOIRE */}
        <div className="mb-8 p-6 rounded-3xl bg-card border-2 border-border shadow-lg">
          <h2 className="text-xl font-bold text-foreground mb-4">Coordonnées professionnelles</h2>
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
            {devis.user.rcs && (
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-1">RCS</p>
                <p className="font-medium">{devis.user.rcs}</p>
              </div>
            )}
            {devis.user.vatNumber && (
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-1">TVA intracommunautaire</p>
                <p className="font-medium">{devis.user.vatNumber}</p>
              </div>
            )}
          </div>
        </div>

        <Card className="hover:shadow-xl transition-shadow duration-200 mb-6">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl mb-2">{devis.title}</CardTitle>
                <p className="text-lg font-semibold text-primary">Devis n° {devis.number}</p>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium ${status.color}`}>
                <StatusIcon className="h-5 w-5" />
                <span>{status.label}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Coordonnées client - OBLIGATOIRE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Coordonnées client
                </h3>
                {devis.client ? (
                  <div className="space-y-1">
                    <p className="font-medium">
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
                    <span className="text-muted-foreground">Émis le: </span>
                    <span className="font-medium">{formatDate(devis.createdAt)}</span>
                  </p>
                  {devis.validUntil && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">Valide jusqu'au: </span>
                      <span className="font-medium">{formatDate(devis.validUntil)}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            {devis.description && (
              <div className="pb-6 border-b">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Description</h3>
                <p className="text-sm whitespace-pre-line">{devis.description}</p>
              </div>
            )}

            {/* Lignes de devis */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Détail des prestations
              </h3>
              <div className="space-y-3">
                {devis.items.map((item) => (
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

            {/* Récapitulatif */}
            <div className="pt-6 border-t space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total HT</span>
                <span className="font-medium">{formatCurrency(devis.totalHT)}</span>
              </div>
              {devis.isVatApplicable !== false ? (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">TVA ({devis.tvaRate}%)</span>
                  <span className="font-medium">
                    {formatCurrency(devis.totalTTC - devis.totalHT)}
                  </span>
                </div>
              ) : (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">TVA</span>
                  <span className="font-medium text-muted-foreground">Non applicable (art. 293 B du CGI)</span>
                </div>
              )}
              {devis.advancePayment && devis.advancePayment > 0 && (
                <div className="flex justify-between text-sm pt-2 border-t">
                  <span className="text-muted-foreground">Acompte</span>
                  <span className="font-medium text-primary">{formatCurrency(devis.advancePayment)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-3 border-t">
                <span>Total TTC</span>
                <span>{formatCurrency(devis.totalTTC)}</span>
              </div>
              {devis.advancePayment && devis.advancePayment > 0 && (
                <div className="flex justify-between text-base font-semibold pt-2 border-t text-primary">
                  <span>Reste à payer</span>
                  <span>{formatCurrency(devis.totalTTC - devis.advancePayment)}</span>
                </div>
              )}
            </div>

            {/* Mentions légales obligatoires - OBLIGATOIRE */}
            <div className="pt-6 border-t space-y-3 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground text-base mb-2">Mentions légales obligatoires :</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>
                  <strong>Durée de validité :</strong> Ce devis est valable jusqu'au{" "}
                  {devis.validUntil ? (
                    <span className="font-medium text-foreground">{formatDate(devis.validUntil)}</span>
                  ) : (
                    <span className="text-red-600">⚠️ Date de validité non renseignée</span>
                  )}
                </li>
                {devis.paymentTerms ? (
                  <li>
                    <strong>Délai de paiement :</strong> {devis.paymentTerms}
                  </li>
                ) : (
                  <li>
                    <strong>Délai de paiement :</strong>{" "}
                    <span className="text-red-600">⚠️ Non renseigné</span>
                  </li>
                )}
                {devis.advancePayment && devis.advancePayment > 0 && (
                  <li>
                    <strong>Acompte :</strong> Un acompte de {formatCurrency(devis.advancePayment)} est demandé à la commande.
                  </li>
                )}
                <li>
                  <strong>TVA :</strong>{" "}
                  {devis.isVatApplicable !== false ? (
                    <>TVA applicable au taux de {devis.tvaRate}%</>
                  ) : (
                    <>TVA non applicable (art. 293 B du CGI - auto-liquidation)</>
                  )}
                </li>
                {devis.cgvReference && (
                  <li>
                    Les conditions générales de vente sont disponibles sur demande ou à l'adresse suivante : {devis.cgvReference}
                  </li>
                )}
              </ul>
              {devis.user.legalMentions && (
                <div className="mt-4 p-4 bg-muted/50 rounded-xl">
                  <p className="font-medium mb-2 text-foreground">Mentions particulières :</p>
                  <p className="whitespace-pre-line">{devis.user.legalMentions}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Message informatif */}
        <Card className="hover:shadow-xl transition-shadow duration-200">
          <CardContent className="pt-6">
            <div className="space-y-2 text-sm">
              <p className="font-medium text-foreground">
                {devis.status === "signe" 
                  ? "✅ Devis accepté" 
                  : devis.status === "refuse"
                  ? "❌ Devis refusé"
                  : "📄 Devis en attente de signature"}
              </p>
              <p className="text-muted-foreground">
                Merci de signer ce devis et de le renvoyer par email à {devis.user.email || "votre menuisier"}.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>Document généré le {formatDate(new Date())}</p>
        </div>
      </div>
    </div>
  )
}
