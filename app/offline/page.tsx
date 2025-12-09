import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
            <WifiOff className="h-10 w-10 text-muted-foreground" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Mode hors ligne
          </h1>
          <p className="text-muted-foreground">
            Vous n'êtes pas connecté à Internet. Certaines fonctionnalités
            peuvent être limitées.
          </p>
        </div>
        <Button asChild>
          <Link href="/">Réessayer</Link>
        </Button>
      </div>
    </div>
  );
}

