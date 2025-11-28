import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateClientToken } from "@/lib/utils"
import { generateFactureNumber } from "@/lib/server-utils"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { id } = await params

    const devis = await prisma.devis.findUnique({
      where: { id },
      include: { items: true },
    })

    if (!devis || devis.userId !== session.user.id) {
      return NextResponse.json({ error: "Devis non trouvé" }, { status: 404 })
    }

    // Vérifier si une facture existe déjà pour ce devis
    const existingFacture = await prisma.facture.findUnique({
      where: { devisId: devis.id },
    })

    if (existingFacture) {
      return NextResponse.json(
        { error: "Ce devis a déjà été converti en facture" },
        { status: 400 }
      )
    }

    const number = await generateFactureNumber(session.user.id)
    const clientToken = generateClientToken()
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 30) // 30 jours pour payer

    // Récupérer les informations légales de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: devis.userId },
    })

    const facture = await prisma.facture.create({
      data: {
        number,
        title: devis.title,
        description: devis.description,
        status: "impaye", // Statut par défaut : impayé (facture créée mais pas encore payée)
        totalHT: devis.totalHT,
        totalTTC: devis.totalTTC,
        tvaRate: devis.tvaRate,
        dueDate,
        clientToken,
        paymentTerms: devis.paymentTerms || user?.paymentTerms || null,
        paymentMethod: user?.paymentMethod || null,
        legalMentions: user?.legalMentions || null,
        isVatApplicable: devis.isVatApplicable !== false,
        userId: devis.userId,
        clientId: devis.clientId,
        projectId: devis.projectId,
        devisId: devis.id,
        items: {
          create: devis.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            total: item.total,
          })),
        },
      },
      include: { client: true, project: true, items: true },
    })

    return NextResponse.json(facture, { status: 201 })
  } catch (error) {
    console.error("Error converting devis to facture:", error)
    return NextResponse.json(
      { error: "Erreur lors de la conversion" },
      { status: 500 }
    )
  }
}

