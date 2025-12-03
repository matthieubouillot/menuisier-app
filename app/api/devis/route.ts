import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateClientToken } from "@/lib/utils"
import { generateDevisNumber } from "@/lib/server-utils"

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const devis = await prisma.devis.findMany({
      where: { userId: session.user.id },
      include: { client: true, project: true, items: true },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(devis)
  } catch (error) {
    console.error("Error fetching devis:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des devis" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await request.json()
    const { 
      title, 
      description, 
      clientId, 
      projectId, 
      items, 
      totalHT, 
      totalTTC, 
      tvaRate, 
      validUntil,
      advancePayment,
      paymentTerms,
      isVatApplicable,
      cgvReference,
      workStartDate,
      workDuration,
      travelExpenses,
      insuranceInfo,
      afterSalesService
    } = body

    if (!title || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Titre et lignes de devis requis" },
        { status: 400 }
      )
    }

    if (!projectId) {
      return NextResponse.json(
        { error: "Un projet doit être sélectionné" },
        { status: 400 }
      )
    }

    // Validation des champs obligatoires légaux
    if (!workStartDate) {
      return NextResponse.json(
        { error: "La date de début des travaux est obligatoire" },
        { status: 400 }
      )
    }

    if (!workDuration || workDuration.trim() === "") {
      return NextResponse.json(
        { error: "La durée estimée des travaux est obligatoire" },
        { status: 400 }
      )
    }

    // Récupérer les paramètres utilisateur pour paymentTerms si non fourni
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { paymentTerms: true }
    })

    const finalPaymentTerms = paymentTerms || user?.paymentTerms || null
    
    if (!finalPaymentTerms || finalPaymentTerms.trim() === "") {
      return NextResponse.json(
        { error: "Le délai de paiement est obligatoire. Veuillez le configurer dans vos paramètres entreprise." },
        { status: 400 }
      )
    }

    if (!validUntil) {
      return NextResponse.json(
        { error: "La date de validité du devis est obligatoire" },
        { status: 400 }
      )
    }

    // Vérifier que le projet existe et appartient à l'utilisateur
    const project = await prisma.project.findFirst({
      where: { 
        id: projectId,
        userId: session.user.id 
      },
      select: { clientId: true },
    })

    if (!project) {
      return NextResponse.json(
        { error: "Projet introuvable ou non autorisé" },
        { status: 404 }
      )
    }

    // Utiliser le client du projet si aucun client n'est fourni
    const finalClientId = clientId || project?.clientId || null

    const number = await generateDevisNumber(session.user.id)
    const clientToken = generateClientToken()

    const devis = await prisma.devis.create({
      data: {
        number,
        title,
        description: description || null,
        status: "brouillon", // Statut par défaut : brouillon
        totalHT: parseFloat(totalHT) || 0,
        totalTTC: parseFloat(totalTTC) || 0,
        tvaRate: parseFloat(tvaRate) || 20,
        validUntil: validUntil ? new Date(validUntil) : null,
        advancePayment: advancePayment ? parseFloat(advancePayment) : null,
        paymentTerms: finalPaymentTerms,
        isVatApplicable: isVatApplicable !== false,
        cgvReference: cgvReference || null,
        workStartDate: workStartDate ? new Date(workStartDate) : null,
        workDuration: workDuration || null,
        travelExpenses: travelExpenses ? parseFloat(travelExpenses) : null,
        insuranceInfo: insuranceInfo || null,
        afterSalesService: afterSalesService || null,
        clientToken,
        userId: session.user.id,
        clientId: finalClientId,
        projectId: projectId || null,
        items: {
          create: items.map((item: any) => ({
            description: item.description,
            quantity: parseFloat(item.quantity) || 0,
            unit: item.unit || "unité",
            unitPrice: parseFloat(item.unitPrice) || 0,
            total: parseFloat(item.total) || 0,
          })),
        },
      },
      include: { client: true, project: true, items: true },
    })

    return NextResponse.json(devis, { status: 201 })
  } catch (error: any) {
    console.error("Error creating devis:", error)
    return NextResponse.json(
      { error: error?.message || "Erreur lors de la création du devis", details: error },
      { status: 500 }
    )
  }
}

