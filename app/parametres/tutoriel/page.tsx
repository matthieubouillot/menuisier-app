import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/layout/navbar"
import { CheckCircle2, FileText, Calculator, Calendar, Users, TrendingUp, Clock, Shield, Zap } from "lucide-react"

export default async function TutorielPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const steps = [
    {
      icon: Shield,
      title: "1. Configurer vos informations légales",
      description: "Remplissez une seule fois, utilisez partout",
      details: [
        "Allez dans 'Paramètres' > 'Entreprise'",
        "Remplissez vos informations légales (SIRET, adresse, TVA, etc.)",
        "Configurez vos conditions de paiement par défaut",
        "Ces informations apparaîtront automatiquement sur tous vos devis et factures",
        "⚠️ Important : Faites-le en premier, c'est nécessaire pour créer des devis conformes"
      ]
    },
    {
      icon: Users,
      title: "2. Ajouter vos premiers clients",
      description: "Centralisez toutes les informations de vos clients",
      details: [
        "Allez dans 'Paramètres' > 'Clients'",
        "Cliquez sur 'Ajouter un client'",
        "Remplissez les informations (nom, adresse, téléphone, email)",
        "Choisissez le type : particulier ou professionnel",
        "Vos clients seront disponibles pour vos projets et devis"
      ]
    },
    {
      icon: Calculator,
      title: "3. Créer votre catalogue de matériaux",
      description: "Préparez votre base de données de matériaux",
      details: [
        "Allez dans 'Mon atelier' > 'Catalogue'",
        "Ajoutez vos matériaux (bois, quincaillerie, colle, etc.)",
        "Définissez les prix unitaires et les unités de mesure",
        "Ce catalogue servira pour vos calculs de chiffrage",
        "Vous pourrez ensuite utiliser le calculateur pour estimer vos besoins"
      ]
    },
    {
      icon: FileText,
      title: "4. Créer votre premier devis",
      description: "Générez des devis professionnels en quelques clics",
      details: [
        "Allez dans 'Devis & Factures' puis cliquez sur 'Nouveau devis'",
        "Sélectionnez un client (ou créez-en un nouveau)",
        "Choisissez ou créez un projet associé",
        "Ajoutez vos lignes de prestation (matériaux, main-d'œuvre, etc.)",
        "Le système calcule automatiquement les totaux HT et TTC",
        "Téléchargez le PDF professionnel prêt à envoyer à vos clients"
      ]
    },
    {
      icon: Calendar,
      title: "5. Organiser votre planning",
      description: "Planifiez vos chantiers et rendez-vous",
      details: [
        "Allez dans 'Calendrier'",
        "Créez des événements pour vos chantiers",
        "Associez-les à vos projets existants",
        "Planifiez vos rendez-vous clients",
        "Visualisez votre planning en un coup d'œil"
      ]
    }
  ]

  const benefits = [
    {
      icon: Clock,
      title: "Gain de temps",
      description: "Réduisez de 70% le temps passé sur l'administration. Créez un devis en 5 minutes au lieu de 30."
    },
    {
      icon: TrendingUp,
      title: "Augmentation du chiffre d'affaires",
      description: "Envoyez plus de devis, plus rapidement. Les clients signent plus vite quand ils reçoivent un devis professionnel rapidement."
    },
    {
      icon: Zap,
      title: "Moins d'erreurs",
      description: "Calculs automatiques, conformité légale garantie. Plus d'erreurs de calcul ou de mentions légales oubliées."
    },
    {
      icon: CheckCircle2,
      title: "Professionnalisme",
      description: "Des documents PDF impeccables qui renforcent votre image de marque et inspirent confiance à vos clients."
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="mb-8 lg:mb-12">
          <h1 className="text-4xl font-bold mb-4 text-foreground">
            🎯 Guide de démarrage rapide
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Bienvenue sur Menuisier Pro ! Ce guide vous accompagne dans vos premiers pas pour maîtriser l'outil et optimiser votre productivité.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <Card key={index} className="hover:shadow-xl transition-shadow duration-200">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-bold mb-6 text-foreground">
            📚 Étapes pour démarrer
          </h2>
          
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <Card key={index} className="hover:shadow-xl transition-shadow duration-200">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl">{step.title}</CardTitle>
                      <CardDescription className="mt-1">{step.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {step.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-start space-x-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card className="mt-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                💡 Astuce ROI
              </h3>
              <p className="text-lg text-muted-foreground mb-4 max-w-2xl mx-auto">
                Les menuisiers qui utilisent Menuisier Pro gagnent en moyenne <strong className="text-primary">5 heures par semaine</strong> sur l'administration.
              </p>
              <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                Cela représente <strong className="text-primary">20 heures par mois</strong> que vous pouvez consacrer à votre cœur de métier : créer, fabriquer, et satisfaire vos clients.
              </p>
              <p className="text-sm text-muted-foreground mt-4 max-w-2xl mx-auto">
                💰 <strong>Calcul rapide :</strong> Si vous facturez 50€/h, c'est <strong className="text-primary">1000€ de valeur ajoutée par mois</strong> récupérée sur l'administration.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-4 text-foreground">
                🚀 Prêt à commencer ?
              </h3>
              <p className="text-muted-foreground mb-4">
                Commencez par configurer vos informations légales dans les paramètres, puis créez votre premier devis !
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
