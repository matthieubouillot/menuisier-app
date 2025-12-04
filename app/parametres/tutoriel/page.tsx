import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Clock, FileText, Calculator, Calendar, Users, TrendingUp, Zap } from "lucide-react"

export default async function TutorielPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const steps = [
    {
      icon: FileText,
      title: "1. Créer votre premier devis",
      description: "Générez des devis professionnels en quelques clics",
      details: [
        "Allez dans 'Devis & Factures' → 'Nouveau devis'",
        "Sélectionnez un projet (ou créez-en un)",
        "Ajoutez vos lignes de prestation avec quantités et prix",
        "Le devis est automatiquement numéroté et conforme à la législation française",
        "Téléchargez le PDF et envoyez-le à votre client"
      ]
    },
    {
      icon: Calculator,
      title: "2. Calculer vos matériaux",
      description: "Optimisez vos coûts avec le calculateur de matériaux",
      details: [
        "Allez dans 'Mon atelier' → 'Chiffrage'",
        "Sélectionnez le type de projet (cuisine, escalier, fenêtre, etc.)",
        "Entrez les dimensions de votre projet",
        "Le système calcule automatiquement les matériaux nécessaires",
        "Ajoutez une marge et la main-d'œuvre pour obtenir votre prix de vente"
      ]
    },
    {
      icon: Users,
      title: "3. Gérer vos clients",
      description: "Centralisez toutes les informations de vos clients",
      details: [
        "Allez dans 'Paramètres' → 'Clients'",
        "Ajoutez vos clients (particuliers ou professionnels)",
        "Associez-les à vos projets et devis",
        "Tous les documents sont automatiquement liés"
      ]
    },
    {
      icon: Calendar,
      title: "4. Organiser votre planning",
      description: "Planifiez vos chantiers et rendez-vous",
      details: [
        "Allez dans 'Calendrier'",
        "Créez des événements pour vos chantiers",
        "Planifiez vos rendez-vous clients",
        "Suivez vos deadlines et échéances"
      ]
    },
    {
      icon: FileText,
      title: "5. Convertir un devis en facture",
      description: "Transformez vos devis signés en factures en un clic",
      details: [
        "Allez dans 'Devis & Factures'",
        "Ouvrez un devis signé",
        "Cliquez sur 'Convertir en facture'",
        "La facture reprend automatiquement toutes les informations du devis",
        "Téléchargez et envoyez la facture à votre client"
      ]
    },
    {
      icon: TrendingUp,
      title: "6. Suivre votre activité",
      description: "Analysez vos performances avec le tableau de bord",
      details: [
        "Consultez vos statistiques sur le tableau de bord",
        "Suivez vos devis en cours, signés et refusés",
        "Visualisez votre chiffre d'affaires",
        "Identifiez vos meilleurs clients"
      ]
    }
  ]

  const benefits = [
    {
      icon: Zap,
      title: "Gain de temps",
      description: "Réduisez de 70% le temps passé sur l'administration"
    },
    {
      icon: TrendingUp,
      title: "ROI garanti",
      description: "Récupérez votre investissement en moins de 2 mois"
    },
    {
      icon: CheckCircle2,
      title: "Conformité légale",
      description: "Tous vos documents sont conformes à la législation française"
    },
    {
      icon: Clock,
      title: "Disponible 24/7",
      description: "Accédez à vos données depuis n'importe où, à tout moment"
    }
  ]

  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2 text-foreground">Guide de démarrage</h2>
        <p className="text-muted-foreground">
          Découvrez comment utiliser Menuisier Pro pour optimiser votre activité et gagner du temps
        </p>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <Card key={index} className="hover:shadow-xl transition-shadow duration-200">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{benefit.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="space-y-6">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <Card key={index} className="hover:shadow-xl transition-shadow duration-200">
                <CardHeader>
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{step.title}</CardTitle>
                      <CardDescription className="text-base">{step.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {step.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-start space-x-2">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card className="mt-12 bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl">💡 Astuce</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-muted-foreground mb-4">
              <strong>Conseil d'expert :</strong> Commencez par configurer vos informations légales dans les paramètres entreprise. 
              Ensuite, créez votre premier client et votre premier projet. Vous pourrez alors générer votre premier devis en quelques minutes !
            </p>
            <p className="text-sm text-muted-foreground">
              Besoin d'aide ? N'hésitez pas à nous contacter. Nous sommes là pour vous accompagner dans votre réussite.
            </p>
          </CardContent>
        </Card>
    </>
  )
}

