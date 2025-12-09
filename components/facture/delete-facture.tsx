"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface DeleteFactureButtonProps {
  factureId: string;
  factureNumber: string;
  status: string;
}

export function DeleteFactureButton({
  factureId,
  factureNumber,
  status,
}: DeleteFactureButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (status === "paye") {
      alert("Impossible de supprimer une facture payée.");
      return;
    }

    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer la facture ${factureNumber} ? Cette action est irréversible.`
    );

    if (!confirmed) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/facture/${factureId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la suppression");
      }

      router.push("/devis");
      router.refresh();
    } catch (error: any) {
      alert(error.message || "Erreur lors de la suppression de la facture");
    } finally {
      setLoading(false);
    }
  };

  if (status === "paye") {
    return null;
  }

  return (
    <Button
      size="lg"
      variant="destructive"
      className="rounded-xl w-full sm:w-auto"
      onClick={handleDelete}
      disabled={loading}
    >
      <Trash2 className="h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" />
      <span className="hidden sm:inline">
        {loading ? "Suppression..." : "Supprimer"}
      </span>
    </Button>
  );
}
