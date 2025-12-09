import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
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
      include: {
        client: true,
        project: true,
        items: true,
        facture: true,
      },
    })

    if (!devis || devis.userId !== session.user.id) {
      return NextResponse.json({ error: "Devis non trouvé" }, { status: 404 })
    }

    return NextResponse.json(devis)
  } catch (error) {
    console.error("Erreur lors de la récupération du devis:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération" },
      { status: 500 }
    )
  }
}

export async function DELETE(
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
      include: { facture: true },
    })

    if (!devis || devis.userId !== session.user.id) {
      return NextResponse.json({ error: "Devis non trouvé" }, { status: 404 })
    }

    // Ne pas permettre la suppression si une facture est liée
    if (devis.facture) {
      return NextResponse.json(
        { error: "Impossible de supprimer un devis qui a été converti en facture" },
        { status: 400 }
      )
    }

    // Supprimer le devis (les items seront supprimés automatiquement grâce à onDelete: Cascade)
    await prisma.devis.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Devis supprimé avec succès" })
  } catch (error) {
    console.error("Erreur lors de la suppression du devis:", error)
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const devis = await prisma.devis.findUnique({
      where: { id },
      include: { facture: true },
    })

    if (!devis || devis.userId !== session.user.id) {
      return NextResponse.json({ error: "Devis non trouvé" }, { status: 404 })
    }

    // Ne pas permettre la modification si une facture est liée
    if (devis.facture) {
      return NextResponse.json(
        { error: "Impossible de modifier un devis qui a été converti en facture" },
        { status: 400 }
      )
    }

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
      afterSalesService,
    } = body

    // Supprimer les anciens items
    await prisma.devisItem.deleteMany({
      where: { devisId: id },
    })

    // Mettre à jour le devis
    const updatedDevis = await prisma.devis.update({
      where: { id },
      data: {
        title,
        description: description || null,
        clientId: clientId || null,
        projectId: projectId || null,
        totalHT,
        totalTTC,
        tvaRate,
        validUntil: validUntil ? new Date(validUntil) : null,
        advancePayment: advancePayment ? parseFloat(advancePayment) : null,
        paymentTerms: paymentTerms || null,
        isVatApplicable: isVatApplicable !== false,
        cgvReference: cgvReference || null,
        workStartDate: workStartDate ? new Date(workStartDate) : null,
        workDuration: workDuration || null,
        travelExpenses: travelExpenses ? parseFloat(travelExpenses) : null,
        insuranceInfo: insuranceInfo || null,
        afterSalesService: afterSalesService || null,
        items: {
          create: items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            total: item.total,
          })),
        },
      },
      include: {
        client: true,
        project: true,
        items: true,
      },
    })

    return NextResponse.json(updatedDevis)
  } catch (error) {
    console.error("Erreur lors de la modification du devis:", error)
    return NextResponse.json(
      { error: "Erreur lors de la modification" },
      { status: 500 }
    )
  }
}

