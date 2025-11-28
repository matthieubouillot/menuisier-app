import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateClientToken } from "@/lib/utils"

export async function POST() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const userId = session.user.id

    // Supprimer toutes les anciennes données de démo
    console.log("Suppression des données existantes...")
    await prisma.calendarEvent.deleteMany({ where: { userId } })
    await prisma.materialCalculation.deleteMany({ where: { userId } })
    await prisma.material.deleteMany({ where: { userId } })
    await prisma.factureItem.deleteMany({ where: { facture: { userId } } })
    await prisma.facture.deleteMany({ where: { userId } })
    await prisma.devisItem.deleteMany({ where: { devis: { userId } } })
    await prisma.devis.deleteMany({ where: { userId } })
    await prisma.project.deleteMany({ where: { userId } })
    await prisma.client.deleteMany({ where: { userId } })
    console.log("Données supprimées avec succès")

    // 1. Créer des clients variés (particuliers et professionnels)
    const clients = await Promise.all([
      prisma.client.create({
        data: {
          firstName: "Thomas",
          lastName: "Dubois",
          siret: null,
          type: "particulier",
          email: "thomas.dubois@email.com",
          phone: "06 12 34 56 78",
          address: "28 Avenue Victor Hugo",
          city: "Paris",
          postalCode: "75016",
          notes: "Client régulier, très satisfait des précédents travaux",
          userId,
        },
      }),
      prisma.client.create({
        data: {
          firstName: "Camille",
          lastName: "Rousseau",
          type: "professionnel",
          companyName: "Rousseau Immobilier",
          siret: "852 147 963 00012",
          email: "contact@rousseau-immobilier.fr",
          phone: "01 23 45 67 89",
          address: "15 Boulevard Haussmann",
          city: "Paris",
          postalCode: "75009",
          notes: "Entreprise de promotion immobilière, commandes régulières",
          userId,
        },
      }),
      prisma.client.create({
        data: {
          firstName: "Lucas",
          lastName: "Moreau",
          siret: null,
          type: "particulier",
          email: "lucas.moreau@email.com",
          phone: "06 98 76 54 32",
          address: "42 Rue de la Paix",
          city: "Lyon",
          postalCode: "69002",
          notes: "Premier projet, besoin de conseils",
          userId,
        },
      }),
      prisma.client.create({
        data: {
          firstName: "Emma",
          lastName: "Petit",
          type: "professionnel",
          companyName: "Petit Design",
          siret: "123 456 789 00034",
          email: "emma@petit-design.fr",
          phone: "04 56 78 90 12",
          address: "8 Place Bellecour",
          city: "Lyon",
          postalCode: "69002",
          notes: "Agence de design, projets sur mesure haut de gamme",
          userId,
        },
      }),
    ])

    // 2. Créer des matériaux dans le catalogue
    const materials = await Promise.all([
      prisma.material.create({
        data: {
          name: "Plan de travail granit",
          category: "bois",
          unit: "m²",
          unitPrice: 280,
          supplier: "Dispano",
          stockQuantity: 0,
          minStock: 0,
          userId,
        },
      }),
      prisma.material.create({
        data: {
          name: "Caisson de cuisine standard",
          category: "bois",
          unit: "unité",
          unitPrice: 160,
          supplier: "Leroy Merlin",
          stockQuantity: 0,
          minStock: 0,
          userId,
        },
      }),
      prisma.material.create({
        data: {
          name: "Porte de meuble standard",
          category: "bois",
          unit: "unité",
          unitPrice: 95,
          supplier: "Point P",
          stockQuantity: 0,
          minStock: 0,
          userId,
        },
      }),
      prisma.material.create({
        data: {
          name: "Charnière amortie",
          category: "quincaillerie",
          unit: "unité",
          unitPrice: 4.5,
          supplier: "Bricomarché",
          stockQuantity: 0,
          minStock: 0,
          userId,
        },
      }),
      prisma.material.create({
        data: {
          name: "Poignée inox brossé",
          category: "quincaillerie",
          unit: "unité",
          unitPrice: 6,
          supplier: "Leroy Merlin",
          stockQuantity: 0,
          minStock: 0,
          userId,
        },
      }),
      prisma.material.create({
        data: {
          name: "Panneau MDF 18mm",
          category: "bois",
          unit: "m²",
          unitPrice: 32,
          supplier: "Point P",
          stockQuantity: 0,
          minStock: 0,
          userId,
        },
      }),
      prisma.material.create({
        data: {
          name: "Plateau chêne massif",
          category: "bois",
          unit: "m²",
          unitPrice: 135,
          supplier: "Scierie Dubois",
          stockQuantity: 0,
          minStock: 0,
          userId,
        },
      }),
      prisma.material.create({
        data: {
          name: "Pieds de table chêne",
          category: "bois",
          unit: "unité",
          unitPrice: 55,
          supplier: "Artisan Bois",
          stockQuantity: 0,
          minStock: 0,
          userId,
        },
      }),
    ])

    // 3. Créer des projets
    const projects = await Promise.all([
      prisma.project.create({
        data: {
          name: "Cuisine moderne avec îlot",
          description: "Rénovation complète d'une cuisine avec îlot central, électroménager intégré et plan de travail granit",
          type: "cuisine",
          status: "en_cours",
          startDate: new Date("2025-01-15"),
          endDate: new Date("2025-03-30"),
          budget: 32000,
          userId,
          clientId: clients[0].id,
        },
      }),
      prisma.project.create({
        data: {
          name: "Armoire sur mesure chêne",
          description: "Armoire 3 portes avec miroir intégré, finition chêne clair",
          type: "armoire",
          status: "termine",
          startDate: new Date("2024-11-01"),
          endDate: new Date("2024-12-15"),
          budget: 4200,
          userId,
          clientId: clients[1].id,
        },
      }),
      prisma.project.create({
        data: {
          name: "Table à manger 8 personnes",
          description: "Table en chêne massif avec rallonges, style rustique moderne",
          type: "table",
          status: "en_cours",
          startDate: new Date("2025-02-10"),
          endDate: new Date("2025-04-20"),
          budget: 3500,
          userId,
          clientId: clients[3].id,
        },
      }),
    ])

    // 4. Créer des calculs de matériaux (chiffrages) AVANT les devis
    // Ces calculs seront utilisés pour préremplir les devis
    const calculation1Materials = [
      { name: "Plan de travail granit", quantity: 5.5, unit: "m²", unitPrice: 280, total: 1540 },
      { name: "Caisson de cuisine standard", quantity: 8, unit: "unité", unitPrice: 160, total: 1280 },
      { name: "Porte de meuble standard", quantity: 8, unit: "unité", unitPrice: 95, total: 760 },
      { name: "Charnière amortie", quantity: 16, unit: "unité", unitPrice: 4.5, total: 72 },
      { name: "Poignée inox brossé", quantity: 16, unit: "unité", unitPrice: 6, total: 96 },
    ]
    const calculation1Total = calculation1Materials.reduce((sum, m) => sum + m.total, 0)

    const calculation2Materials = [
      { name: "Panneau MDF 18mm", quantity: 9.5, unit: "m²", unitPrice: 32, total: 304 },
      { name: "Porte de meuble standard", quantity: 3, unit: "unité", unitPrice: 95, total: 285 },
      { name: "Charnière amortie", quantity: 6, unit: "unité", unitPrice: 4.5, total: 27 },
      { name: "Poignée inox brossé", quantity: 3, unit: "unité", unitPrice: 6, total: 18 },
    ]
    const calculation2Total = calculation2Materials.reduce((sum, m) => sum + m.total, 0)

    const calculation3Materials = [
      { name: "Plateau chêne massif", quantity: 2.86, unit: "m²", unitPrice: 135, total: 386.1 },
      { name: "Pieds de table chêne", quantity: 4, unit: "unité", unitPrice: 55, total: 220 },
    ]
    const calculation3Total = calculation3Materials.reduce((sum, m) => sum + m.total, 0)

    const calculations = await Promise.all([
      prisma.materialCalculation.create({
        data: {
          projectType: "Cuisine moderne avec îlot",
          dimensions: JSON.stringify({
            mode: "custom",
            marginPercent: 15,
            laborCost: 1800,
            name: "Cuisine moderne avec îlot",
          }),
          materials: JSON.stringify(calculation1Materials),
          totalCost: calculation1Total,
          userId,
          clientId: clients[0].id,
        },
      }),
      prisma.materialCalculation.create({
        data: {
          projectType: "Armoire sur mesure chêne",
          dimensions: JSON.stringify({
            mode: "custom",
            marginPercent: 20,
            laborCost: 1360,
            name: "Armoire sur mesure chêne",
          }),
          materials: JSON.stringify(calculation2Materials),
          totalCost: calculation2Total,
          userId,
          clientId: clients[1].id,
        },
      }),
      prisma.materialCalculation.create({
        data: {
          projectType: "Table à manger 8 personnes",
          dimensions: JSON.stringify({
            mode: "custom",
            marginPercent: 18,
            laborCost: 2293.9,
            name: "Table à manger 8 personnes",
          }),
          materials: JSON.stringify(calculation3Materials),
          totalCost: calculation3Total,
          userId,
          clientId: clients[3].id,
        },
      }),
    ])

    // 5. Créer des devis avec les MÊMES données que les calculs (pour cohérence)
    const devisData = [
      {
        number: "DEV-2025-001",
        title: "Devis cuisine moderne avec îlot",
        description: "Rénovation complète cuisine avec îlot central et électroménager",
        status: "signe",
        totalHT: 26666.67,
        totalTTC: 32000,
        clientId: clients[0].id,
        projectId: projects[0].id,
        validUntil: new Date("2025-02-15"),
        advancePayment: 8000,
        paymentTerms: "Acompte de 8000€ à la commande. Solde à la livraison, délai de paiement : 30 jours.",
        isVatApplicable: true,
        items: [
          { description: "Plan de travail granit", quantity: 5.5, unit: "m²", unitPrice: 280, total: 1540 },
          { description: "Caisson de cuisine standard", quantity: 8, unit: "unité", unitPrice: 160, total: 1280 },
          { description: "Porte de meuble standard", quantity: 8, unit: "unité", unitPrice: 95, total: 760 },
          { description: "Charnière amortie", quantity: 16, unit: "unité", unitPrice: 4.5, total: 72 },
          { description: "Poignée inox brossé", quantity: 16, unit: "unité", unitPrice: 6, total: 96 },
          { description: "Îlot central avec rangements", quantity: 1, unit: "unité", unitPrice: 3200, total: 3200 },
          { description: "Pose et installation", quantity: 1, unit: "forfait", unitPrice: 1800, total: 1800 },
          { description: "Électroménager intégré (four, lave-vaisselle, hotte)", quantity: 1, unit: "lot", unitPrice: 14500, total: 14500 },
        ],
      },
      {
        number: "DEV-2025-002",
        title: "Devis armoire sur mesure chêne",
        description: "Armoire 3 portes chêne clair avec miroir",
        status: "envoye",
        totalHT: 3500,
        totalTTC: 4200,
        clientId: clients[1].id,
        projectId: projects[1].id,
        validUntil: new Date("2025-01-20"),
        advancePayment: 0,
        paymentTerms: "Paiement à la livraison, délai de paiement : 30 jours.",
        isVatApplicable: true,
        items: [
          { description: "Panneau MDF 18mm", quantity: 9.5, unit: "m²", unitPrice: 32, total: 304 },
          { description: "Porte de meuble standard", quantity: 3, unit: "unité", unitPrice: 95, total: 285 },
          { description: "Charnière amortie", quantity: 6, unit: "unité", unitPrice: 4.5, total: 27 },
          { description: "Poignée inox brossé", quantity: 3, unit: "unité", unitPrice: 6, total: 18 },
          { description: "Structure armoire MDF 18mm", quantity: 1, unit: "unité", unitPrice: 1400, total: 1400 },
          { description: "Portes 3 battants avec miroir", quantity: 3, unit: "unité", unitPrice: 420, total: 1260 },
          { description: "Pose et finition", quantity: 1, unit: "forfait", unitPrice: 1360, total: 1360 },
        ],
      },
      {
        number: "DEV-2025-003",
        title: "Devis table à manger 8 personnes",
        description: "Table chêne massif avec rallonges",
        status: "signe",
        totalHT: 2916.67,
        totalTTC: 3500,
        clientId: clients[3].id,
        projectId: projects[2].id,
        validUntil: new Date("2025-03-01"),
        advancePayment: 0,
        paymentTerms: "Paiement à la livraison, délai de paiement : 30 jours.",
        isVatApplicable: true,
        items: [
          { description: "Plateau chêne massif", quantity: 2.86, unit: "m²", unitPrice: 135, total: 386.1 },
          { description: "Pieds de table chêne", quantity: 4, unit: "unité", unitPrice: 55, total: 220 },
          { description: "Système de rallonges", quantity: 1, unit: "unité", unitPrice: 380, total: 380 },
          { description: "Finition huile naturelle", quantity: 1, unit: "forfait", unitPrice: 220, total: 220 },
          { description: "Fabrication et finition", quantity: 1, unit: "forfait", unitPrice: 2293.9, total: 2293.9 },
        ],
      },
    ]

    const devis = await Promise.all(
      devisData.map(async (devis) => {
        const clientToken = generateClientToken()
        const created = await prisma.devis.create({
          data: {
            number: devis.number,
            title: devis.title,
            description: devis.description,
            status: devis.status,
            totalHT: devis.totalHT,
            totalTTC: devis.totalTTC,
            tvaRate: 20,
            validUntil: devis.validUntil,
            clientToken,
            advancePayment: devis.advancePayment,
            paymentTerms: devis.paymentTerms,
            isVatApplicable: devis.isVatApplicable,
            userId,
            clientId: devis.clientId,
            projectId: devis.projectId,
            items: {
              create: devis.items,
            },
          },
        })
        return created
      })
    )

    // 6. Créer des factures (converties depuis devis acceptés)
    const facturesData = [
      {
        number: "FAC-2025-001",
        title: "Facture cuisine moderne avec îlot",
        description: "Facture correspondant au devis DEV-2025-001",
        status: "paye",
        totalHT: 26666.67,
        totalTTC: 32000,
        paidAmount: 32000,
        paidAt: new Date("2025-01-20"),
        dueDate: new Date("2025-02-20"),
        paymentTerms: "Paiement par virement bancaire – échéance à 30 jours. Acompte de 8000€ déjà reçu.",
        paymentMethod: "Virement bancaire (IBAN FR76 1234 5678 9012 3456 7890 123) ou chèque à l'ordre de Menuisier Pro.",
        isVatApplicable: true,
        clientId: clients[0].id,
        projectId: projects[0].id,
        devisId: devis[0].id,
        items: devisData[0].items,
      },
      {
        number: "FAC-2025-002",
        title: "Facture table à manger 8 personnes",
        description: "Facture correspondant au devis DEV-2025-003",
        status: "impaye",
        totalHT: 2916.67,
        totalTTC: 3500,
        paidAmount: 0,
        dueDate: new Date("2025-04-30"),
        paymentTerms: "Paiement à réception par virement ou chèque – délai de paiement : 30 jours. Pénalités de retard applicables au-delà de cette date.",
        paymentMethod: "Virement bancaire (IBAN FR76 1234 5678 9012 3456 7890 123) ou chèque à l'ordre de Menuisier Pro.",
        isVatApplicable: true,
        clientId: clients[3].id,
        projectId: projects[2].id,
        devisId: devis[2].id,
        items: devisData[2].items,
      },
    ]

    const factures = await Promise.all(
      facturesData.map(async (facture) => {
        const clientToken = generateClientToken()
        const created = await prisma.facture.create({
          data: {
            number: facture.number,
            title: facture.title,
            description: facture.description,
            status: facture.status,
            totalHT: facture.totalHT,
            totalTTC: facture.totalTTC,
            tvaRate: 20,
            paidAmount: facture.paidAmount,
            paidAt: facture.paidAt,
            dueDate: facture.dueDate,
            clientToken,
            paymentTerms: facture.paymentTerms,
            paymentMethod: facture.paymentMethod,
            isVatApplicable: facture.isVatApplicable ?? true,
            userId,
            clientId: facture.clientId,
            projectId: facture.projectId,
            devisId: facture.devisId,
            items: {
              create: facture.items,
            },
          },
        })
        return created
      })
    )

    // 7. Créer des événements de calendrier
    const events = await Promise.all([
      prisma.calendarEvent.create({
        data: {
          title: "Pose cuisine - Thomas Dubois",
          description: "Installation des meubles bas et hauts, pose du plan de travail granit",
          startDate: new Date("2025-03-15T09:00:00"),
          endDate: new Date("2025-03-15T17:00:00"),
          type: "chantier",
          location: "28 Avenue Victor Hugo, Paris",
          userId,
          projectId: projects[0].id,
        },
      }),
      prisma.calendarEvent.create({
        data: {
          title: "Rendez-vous client - Camille Rousseau",
          description: "Prise de mesures pour nouvelle commande d'armoires",
          startDate: new Date("2025-01-20T14:00:00"),
          endDate: new Date("2025-01-20T15:30:00"),
          type: "rendez_vous",
          location: "15 Boulevard Haussmann, Paris",
          userId,
          projectId: projects[1].id,
        },
      }),
      prisma.calendarEvent.create({
        data: {
          title: "Finition table - Emma Petit",
          description: "Application de la finition huile naturelle sur la table",
          startDate: new Date("2025-04-10T08:00:00"),
          endDate: new Date("2025-04-10T12:00:00"),
          type: "chantier",
          location: "Atelier",
          userId,
          projectId: projects[2].id,
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      message: "Données de démonstration créées avec succès",
      data: {
        clients: clients.length,
        materials: materials.length,
        projects: projects.length,
        devis: devis.length,
        factures: factures.length,
        events: events.length,
        calculations: calculations.length,
      },
    })
  } catch (error) {
    console.error("Error seeding demo data:", error)
    return NextResponse.json(
      {
        error: "Erreur lors de la création des données de démonstration",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
