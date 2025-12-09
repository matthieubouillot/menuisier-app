import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { MobileBackButton } from "@/components/layout/mobile-back-button";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  formatClientName,
  formatCurrency,
  formatDate,
  formatFactureStatus,
  getFactureStatusClass,
} from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, Download, Edit } from "lucide-react";
import { UpdateFactureStatus } from "@/components/facture/update-status";
import { DeleteFactureButton } from "@/components/facture/delete-facture";

export default async function FactureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  const facture = await prisma.facture.findUnique({
    where: { id },
    include: {
      client: true,
      project: true,
      items: true,
      devis: {
        select: {
          number: true,
        },
      },
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
  });

  if (!facture || facture.userId !== session.user.id) {
    redirect("/devis");
  }

  const isVatApplicable = facture.isVatApplicable !== false;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-12">
        <MobileBackButton href="/devis" />
        <div className="hidden md:block mb-6">
          <Link href="/devis">
            <Button variant="ghost" className="rounded-xl">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 lg:mb-12 gap-4">
          <div>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-2 tracking-widest">
              FACTURE
            </p>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2">
              {facture.title}
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg font-semibold">
              N° {facture.number}
            </p>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">
              Date d'émission : {formatDate(facture.createdAt)}
            </p>
            {facture.serviceDate && (
              <p className="text-muted-foreground text-xs sm:text-sm">
                Date de prestation : {formatDate(facture.serviceDate)}
              </p>
            )}
            {facture.devis?.number && (
              <p className="text-muted-foreground text-xs sm:text-sm">
                Devis d'origine : {facture.devis.number}
              </p>
            )}
            {facture.dueDate && (
              <p className="text-muted-foreground text-xs sm:text-sm">
                Échéance : {formatDate(facture.dueDate)}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-4 w-full sm:w-auto">
            <div className="flex-1 sm:flex-none">
              <UpdateFactureStatus
                factureId={facture.id}
                currentStatus={facture.status}
              />
            </div>
            {facture.status !== "paye" && (
              <Link
                href={`/devis/facture/${facture.id}/modifier`}
                className="flex-1 sm:flex-none"
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-xl w-full sm:w-auto"
                >
                  <Edit className="h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Modifier</span>
                </Button>
              </Link>
            )}
            <a
              href={`/api/facture/${facture.id}/pdf`}
              download={`Facture-${facture.number}.pdf`}
              className="flex-1 sm:flex-none"
            >
              <Button
                size="lg"
                variant="outline"
                className="rounded-xl w-full sm:w-auto"
              >
                <Download className="h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Télécharger PDF</span>
              </Button>
            </a>
            {facture.status !== "paye" && (
              <DeleteFactureButton
                factureId={facture.id}
                factureNumber={facture.number}
                status={facture.status}
              />
            )}
          </div>
        </div>

        <Card className="hover:shadow-xl transition-shadow duration-200 mb-4 sm:mb-6">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">
              Coordonnées vendeur
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                Nom / Entreprise
              </p>
              <p className="font-medium text-sm sm:text-base">
                {facture.user?.companyName ||
                  facture.user?.name ||
                  "Non renseigné"}
              </p>
            </div>
            {facture.user?.siret && (
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                  SIRET
                </p>
                <p className="font-medium text-sm sm:text-base">
                  {facture.user.siret}
                </p>
              </div>
            )}
            {(facture.user?.address ||
              facture.user?.postalCode ||
              facture.user?.city) && (
              <div className="sm:col-span-2">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                  Adresse
                </p>
                <p className="text-sm sm:text-base">
                  {facture.user?.address}
                  {facture.user?.postalCode &&
                    facture.user?.city &&
                    `, ${facture.user.postalCode} ${facture.user.city}`}
                </p>
              </div>
            )}
            {facture.user?.phone && (
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                  Téléphone
                </p>
                <p className="text-sm sm:text-base">{facture.user.phone}</p>
              </div>
            )}
            {facture.user?.email && (
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                  Email
                </p>
                <p className="text-sm sm:text-base break-all">
                  {facture.user.email}
                </p>
              </div>
            )}
            {facture.user?.rcs && (
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                  RCS
                </p>
                <p className="text-sm sm:text-base">{facture.user.rcs}</p>
              </div>
            )}
            {facture.user?.vatNumber && facture.isVatApplicable !== false && (
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                  Numéro TVA intracommunautaire
                </p>
                <p className="text-sm sm:text-base">{facture.user.vatNumber}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {facture.client && (
          <Card className="hover:shadow-xl transition-shadow duration-200 mb-4 sm:mb-6">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">
                Coordonnées acheteur
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="font-medium text-base sm:text-lg">
                {formatClientName(facture.client)}
              </p>
              {facture.client.type === "professionnel" && (
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Contact : {facture.client.firstName} {facture.client.lastName}
                </p>
              )}
              {facture.client.address && (
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {facture.client.address}
                </p>
              )}
              {facture.client.postalCode && facture.client.city && (
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {facture.client.postalCode} {facture.client.city}
                </p>
              )}
              {facture.client.siret && (
                <p className="text-xs sm:text-sm text-muted-foreground">
                  SIRET : {facture.client.siret}
                </p>
              )}
              {facture.client.email && (
                <p className="text-xs sm:text-sm text-muted-foreground break-all">
                  {facture.client.email}
                </p>
              )}
              {facture.client.phone && (
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {facture.client.phone}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <Card className="hover:shadow-xl transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Détails</CardTitle>
              </CardHeader>
              <CardContent>
                {facture.description && (
                  <div className="mb-3 sm:mb-4">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                      Description
                    </p>
                    <p className="text-sm sm:text-base">
                      {facture.description}
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                      Projet
                    </p>
                    <p className="text-sm sm:text-base">
                      {facture.project ? facture.project.name : "Aucun projet"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                      Date d'émission
                    </p>
                    <p className="font-medium text-sm sm:text-base">
                      {formatDate(facture.createdAt)}
                    </p>
                  </div>
                  {facture.serviceDate && (
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                        Date de prestation
                      </p>
                      <p className="font-medium text-sm sm:text-base">
                        {formatDate(facture.serviceDate)}
                      </p>
                    </div>
                  )}
                  {facture.devis?.number && (
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                        Devis d'origine
                      </p>
                      <p className="font-medium text-sm sm:text-base">
                        {facture.devis.number}
                      </p>
                    </div>
                  )}
                  {facture.dueDate && (
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                        Échéance
                      </p>
                      <p className="font-medium text-sm sm:text-base">
                        {formatDate(facture.dueDate)}
                      </p>
                    </div>
                  )}
                  {facture.paidAt && (
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                        Payée le
                      </p>
                      <p className="font-medium text-green-600 text-sm sm:text-base">
                        {formatDate(facture.paidAt)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">
                  Lignes de facture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 sm:space-y-3">
                  {facture.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-3 sm:p-4 rounded-2xl bg-secondary/50"
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="font-semibold text-sm sm:text-base truncate">
                          {item.description}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                          {item.quantity} {item.unit} ×{" "}
                          {formatCurrency(item.unitPrice)}
                        </p>
                      </div>
                      <p className="font-bold text-base sm:text-lg shrink-0">
                        {formatCurrency(item.total)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <Card className="hover:shadow-xl transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">
                  Récapitulatif
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="flex justify-between text-sm sm:text-base">
                  <span>Total HT</span>
                  <span className="font-medium">
                    {formatCurrency(facture.totalHT)}
                  </span>
                </div>
                {isVatApplicable ? (
                  <div className="flex justify-between text-sm sm:text-base">
                    <span>TVA ({facture.tvaRate}%)</span>
                    <span className="font-medium">
                      {formatCurrency(facture.totalTTC - facture.totalHT)}
                    </span>
                  </div>
                ) : (
                  <div className="flex justify-between text-sm sm:text-base">
                    <span>TVA</span>
                    <span className="font-medium text-muted-foreground text-xs sm:text-sm">
                      Non applicable (art. 293 B du CGI)
                    </span>
                  </div>
                )}
                <div className="border-t pt-3 sm:pt-4 flex justify-between text-base sm:text-lg font-bold">
                  <span>Total TTC</span>
                  <span>{formatCurrency(facture.totalTTC)}</span>
                </div>
                {facture.status === "paye" && (
                  <div className="pt-3 sm:pt-4 border-t">
                    <div className="flex justify-between text-sm sm:text-base">
                      <span>Montant payé</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(facture.paidAmount)}
                      </span>
                    </div>
                  </div>
                )}
                <div className="pt-3 sm:pt-4 border-t hidden sm:block">
                  <p className="text-sm text-muted-foreground mb-1">Créée le</p>
                  <p className="text-sm">{formatDate(facture.createdAt)}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">
                  Conditions de paiement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Délai / modalités
                  </p>
                  {facture.paymentTerms ? (
                    <p className="text-sm whitespace-pre-line">
                      {facture.paymentTerms}
                    </p>
                  ) : (
                    <p className="text-sm text-red-600">
                      ⚠️ Délai de paiement non renseigné
                    </p>
                  )}
                </div>
                {(facture.paymentMethod || facture.user?.paymentMethod) && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Moyens de paiement acceptés
                    </p>
                    <p className="text-sm whitespace-pre-line">
                      {facture.paymentMethod || facture.user?.paymentMethod}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="hover:shadow-xl transition-shadow duration-200 mt-4 sm:mt-6">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">
              Mentions légales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <p className="text-sm font-semibold text-foreground mb-2">
                  TVA :
                </p>
                <p className="text-sm text-muted-foreground">
                  {isVatApplicable
                    ? `TVA applicable au taux de ${facture.tvaRate}%`
                    : "TVA non applicable (art. 293 B du CGI)"}
                </p>
                {isVatApplicable && facture.user?.vatNumber && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Numéro TVA intracommunautaire : {facture.user.vatNumber}
                  </p>
                )}
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground mb-2">
                  Pénalités de retard :
                </p>
                <p className="text-sm text-muted-foreground">
                  En cas de retard de paiement, des pénalités de retard au taux
                  de 3 fois le taux d'intérêt légal en vigueur seront
                  appliquées, ainsi qu'une indemnité forfaitaire pour frais de
                  recouvrement de 40€.
                </p>
              </div>

              {facture.user?.legalMentions && (
                <div>
                  <p className="text-sm font-semibold text-foreground mb-2">
                    Mentions particulières :
                  </p>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {facture.user.legalMentions}
                  </p>
                </div>
              )}

              {facture.legalMentions && (
                <div>
                  <p className="text-sm font-semibold text-foreground mb-2">
                    Mentions complémentaires :
                  </p>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {facture.legalMentions}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
