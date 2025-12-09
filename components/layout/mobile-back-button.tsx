"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface MobileBackButtonProps {
  href?: string;
  label?: string;
}

/**
 * Bouton retour pour mobile uniquement
 * À utiliser sur les pages qui ne sont pas accessibles directement via le menu burger
 * (ex: pages de détail, formulaires, sous-pages)
 */
export function MobileBackButton({ href }: MobileBackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <div className="md:hidden mb-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        className="text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
      </Button>
    </div>
  );
}
