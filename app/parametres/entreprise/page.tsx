import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SettingsForm } from "@/components/settings/settings-form";

export default async function EntrepriseSettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
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
      paymentMethod: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <Card className="hover:shadow-xl transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl">
          Informations légales
        </CardTitle>
        <CardDescription className="hidden sm:block">
          Ces informations sont obligatoires pour générer des devis et factures
          conformes à la législation française. Elles apparaîtront sur tous vos
          documents.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SettingsForm user={user} />
      </CardContent>
    </Card>
  );
}
