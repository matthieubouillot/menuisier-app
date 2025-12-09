import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = session.user.id;

    // Récupérer uniquement les données de démo
    console.log("Suppression des données de démonstration...");
    const demoData = await prisma.demoData.findMany({ where: { userId } });

    if (demoData.length === 0) {
      return NextResponse.json({
        message: "Aucune donnée de démonstration à supprimer",
        data: {
          clients: 0,
          projects: 0,
          devis: 0,
          factures: 0,
          events: 0,
          calculations: 0,
          materials: 0,
        },
      });
    }

    // Grouper par type d'entité
    const byType = demoData.reduce((acc, demo) => {
      if (!acc[demo.entityType]) {
        acc[demo.entityType] = [];
      }
      acc[demo.entityType].push(demo.entityId);
      return acc;
    }, {} as Record<string, string[]>);

    // Supprimer les entités liées aux données de démo
    let deletedCounts = {
      clients: 0,
      projects: 0,
      devis: 0,
      factures: 0,
      events: 0,
      calculations: 0,
      materials: 0,
    };

    if (byType.facture) {
      // Supprimer d'abord les items des factures
      for (const factureId of byType.facture) {
        await prisma.factureItem.deleteMany({ where: { factureId } });
      }
      const result = await prisma.facture.deleteMany({
        where: { id: { in: byType.facture } },
      });
      deletedCounts.factures = result.count;
    }

    if (byType.devis) {
      // Supprimer d'abord les items des devis
      for (const devisId of byType.devis) {
        await prisma.devisItem.deleteMany({ where: { devisId } });
      }
      // Supprimer les factures liées aux devis de démo (si elles existent)
      await prisma.factureItem.deleteMany({
        where: { facture: { devisId: { in: byType.devis } } },
      });
      await prisma.facture.deleteMany({
        where: { devisId: { in: byType.devis } },
      });
      const result = await prisma.devis.deleteMany({
        where: { id: { in: byType.devis } },
      });
      deletedCounts.devis = result.count;
    }

    if (byType.client) {
      const result = await prisma.client.deleteMany({
        where: { id: { in: byType.client } },
      });
      deletedCounts.clients = result.count;
    }

    if (byType.project) {
      const result = await prisma.project.deleteMany({
        where: { id: { in: byType.project } },
      });
      deletedCounts.projects = result.count;
    }

    if (byType.material) {
      const result = await prisma.material.deleteMany({
        where: { id: { in: byType.material } },
      });
      deletedCounts.materials = result.count;
    }

    if (byType.calculation) {
      const result = await prisma.materialCalculation.deleteMany({
        where: { id: { in: byType.calculation } },
      });
      deletedCounts.calculations = result.count;
    }

    if (byType.event) {
      const result = await prisma.calendarEvent.deleteMany({
        where: { id: { in: byType.event } },
      });
      deletedCounts.events = result.count;
    }

    // Supprimer les enregistrements DemoData
    await prisma.demoData.deleteMany({ where: { userId } });

    console.log("Données de démonstration supprimées avec succès");

    return NextResponse.json({
      message: "Données de démonstration supprimées avec succès",
      data: deletedCounts,
    });
  } catch (error) {
    console.error("Erreur lors de la suppression des données:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression des données" },
      { status: 500 }
    );
  }
}
