import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SettingsForm } from "@/components/settings/settings-form"

export default async function EntrepriseSettingsPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      companyName: true,
      address: true,
      city: true,
      postalCode: true,
      phone: true,
      siret: true,
      rcs: true,
      vatNumber: true,
      legalMentions: true,
      paymentTerms: true,
    },
  })

  if (!user) {
    redirect("/login")
  }

  return (
    <>
      <Card className="hover:shadow-xl transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="text-xl">Informations légales</CardTitle>
          <CardDescription>
            Ces informations sont obligatoires pour générer des devis et factures conformes à la législation française.
            Elles apparaîtront sur tous vos documents.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SettingsForm user={user} />
        </CardContent>
      </Card>

      <Card className="hover:shadow-xl transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="text-xl">Informations obligatoires</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div>
            <p className="font-semibold text-foreground mb-1">Pour les factures :</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>SIRET</strong> : Obligatoire pour toutes les factures</li>
              <li><strong>Adresse complète</strong> : Adresse, code postal et ville</li>
              <li><strong>Numéro TVA intracommunautaire</strong> : Obligatoire si vous êtes assujetti à la TVA</li>
              <li><strong>RCS</strong> : Obligatoire si vous êtes immatriculé au RCS</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-foreground mb-1">Pour les devis :</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Adresse complète fortement recommandée</li>
              <li>Date de validité du devis obligatoire</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

