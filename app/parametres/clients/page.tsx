import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ClientsManager } from "@/components/settings/clients-manager"

export default function ClientsSettingsPage() {
  return (
    <Card className="hover:shadow-xl transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="text-xl">Base clients</CardTitle>
        <CardDescription>
          Gérez l’ensemble de vos contacts. Classez-les en clients particuliers ou professionnels pour préparer vos devis
          et factures plus rapidement.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ClientsManager />
      </CardContent>
    </Card>
  )
}

