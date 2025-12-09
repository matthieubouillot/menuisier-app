import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  formatClientName,
  formatCurrency,
  formatDate,
  formatDevisStatus,
  formatFactureStatus,
  getDevisStatusClass,
  getFactureStatusClass,
} from "@/lib/utils";
import { Plus, FileText, Receipt } from "lucide-react";
import Link from "next/link";

export default async function DevisPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  const [devis, factures] = await Promise.all([
    prisma.devis.findMany({
      where: { userId },
      include: { client: true, project: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.facture.findMany({
      where: { userId },
      include: { client: true, project: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 lg:mb-12 gap-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
            Devis & Factures
          </h1>
          <Link href="/devis/nouveau">
            <Button size="lg" className="w-full sm:w-auto">
              <Plus className="h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Nouveau devis</span>
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Liste des devis */}
          <Card className="hover:shadow-xl transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="flex items-center text-lg sm:text-xl">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-primary/10 flex items-center justify-center mr-2 sm:mr-3">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                Devis ({devis.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 sm:space-y-3">
                {devis.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6 sm:py-8">
                    Aucun devis
                  </p>
                ) : (
                  devis.map((devi) => (
                    <Link key={devi.id} href={`/devis/${devi.id}`}>
                      <div className="p-3 sm:p-4 rounded-2xl bg-secondary/50 hover:bg-secondary transition-all cursor-pointer border-2 border-transparent hover:border-primary/20">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm sm:text-base truncate">
                              {devi.number}
                            </p>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">
                              {formatClientName(devi.client)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                              {formatDate(devi.createdAt)}
                            </p>
                          </div>
                          <div className="text-right ml-2 sm:ml-4 shrink-0">
                            <p className="font-bold text-base sm:text-lg mb-1 sm:mb-2">
                              {formatCurrency(devi.totalTTC)}
                            </p>
                            <span
                              className={`text-xs px-2 sm:px-3 py-1 rounded-xl font-medium ${getDevisStatusClass(
                                devi.status
                              )}`}
                            >
                              {formatDevisStatus(devi.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Liste des factures */}
          <Card className="hover:shadow-xl transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="flex items-center text-lg sm:text-xl">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-accent/10 flex items-center justify-center mr-2 sm:mr-3">
                  <Receipt className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                </div>
                Factures ({factures.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 sm:space-y-3">
                {factures.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6 sm:py-8">
                    Aucune facture
                  </p>
                ) : (
                  factures.map((facture) => (
                    <Link
                      key={facture.id}
                      href={`/devis/facture/${facture.id}`}
                    >
                      <div className="p-3 sm:p-4 rounded-2xl bg-secondary/50 hover:bg-secondary transition-all cursor-pointer border-2 border-transparent hover:border-primary/20">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm sm:text-base truncate">
                              {facture.number}
                            </p>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">
                              {formatClientName(facture.client)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                              {formatDate(facture.createdAt)}
                            </p>
                          </div>
                          <div className="text-right ml-2 sm:ml-4 shrink-0">
                            <p className="font-bold text-base sm:text-lg mb-1 sm:mb-2">
                              {formatCurrency(facture.totalTTC)}
                            </p>
                            <span
                              className={`text-xs px-2 sm:px-3 py-1 rounded-xl font-medium ${getFactureStatusClass(
                                facture.status
                              )}`}
                            >
                              {formatFactureStatus(facture.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
