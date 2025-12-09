"use client";

import Link from "next/link";
import { Archive, Calculator, Check } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AtelierPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-12 space-y-6 sm:space-y-8 lg:space-y-10">
        <div>
          <p className="text-xs sm:text-sm uppercase tracking-widest text-muted-foreground mb-2">
            Mon atelier
          </p>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-3">
            Centralise et chiffre plus vite
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-3xl hidden sm:block">
            Centralisez tous vos tarifs fournisseurs dans un catalogue unique et
            créez des devis sur-mesure en quelques clics. La marge et la
            main-d'œuvre sont calculées automatiquement pour vous faire gagner
            du temps sur chaque projet.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card className="hover:shadow-xl transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-center gap-2 sm:gap-3">
                <Archive className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" />
                <div>
                  <CardTitle className="text-xl sm:text-2xl">
                    Catalogue personnel
                  </CardTitle>
                  <CardDescription className="hidden sm:block">
                    Gérez votre base de données de matériaux avec tous vos
                    tarifs fournisseurs. Ajoutez, modifiez ou supprimez vos
                    matériaux, définissez les unités de mesure et les prix
                    unitaires. Un catalogue 100% personnalisé à votre
                    entreprise.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 sm:gap-4">
              <ul className="space-y-2 sm:space-y-3">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>
                    Gestion complète des prix unitaires et unités de mesure
                  </span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>
                    Catégorisation par type (bois, quincaillerie,
                    fournitures...)
                  </span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>Références fournisseur et stock optionnel</span>
                </li>
              </ul>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link href="/atelier/catalogue" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto">
                    <Archive className="h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" />
                    <span className="hidden sm:inline">
                      Ouvrir le catalogue
                    </span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-center gap-2 sm:gap-3">
                <Calculator className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" />
                <div>
                  <CardTitle className="text-xl sm:text-2xl">
                    Chiffrage personnalisé
                  </CardTitle>
                  <CardDescription className="hidden sm:block">
                    Créez des devis détaillés en combinant matériaux de votre
                    catalogue et prestations personnalisées. La marge et la
                    main-d'œuvre sont calculées automatiquement. Sauvegardez vos
                    chiffrages pour les réutiliser ou les exporter vers un
                    devis.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 sm:gap-4">
              <ul className="space-y-2 sm:space-y-3">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>
                    Ajout de matériaux depuis le catalogue ou lignes libres
                  </span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>
                    Calcul automatique avec marge (%) et main-d'œuvre (€)
                  </span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>
                    Export direct vers un devis ou sauvegarde pour réutilisation
                  </span>
                </li>
              </ul>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link href="/atelier/chiffrage" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    <Calculator className="h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" />
                    <span className="hidden sm:inline">
                      Accéder au chiffrage
                    </span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
