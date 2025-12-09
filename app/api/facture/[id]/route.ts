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

    const facture = await prisma.facture.findUnique({
      where: { id },
      include: {
        client: true,
        project: true,
        items: true,
        devis: true,
      },
    })

    if (!facture || facture.userId !== session.user.id) {
      return NextResponse.json({ error: "Facture non trouvée" }, { status: 404 })
    }

    return NextResponse.json(facture)
  } catch (error) {
    console.error("Erreur lors de la récupération de la facture:", error)
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

    const facture = await prisma.facture.findUnique({
      where: { id },
    })

    if (!facture || facture.userId !== session.user.id) {
      return NextResponse.json({ error: "Facture non trouvée" }, { status: 404 })
    }

    // Ne pas permettre la suppression si la facture est payée
    if (facture.status === "paye") {
      return NextResponse.json(
        { error: "Impossible de supprimer une facture payée" },
        { status: 400 }
      )
    }

    // Supprimer la facture (les items seront supprimés automatiquement grâce à onDelete: Cascade)
    await prisma.facture.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Facture supprimée avec succès" })
  } catch (error) {
    console.error("Erreur lors de la suppression de la facture:", error)
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

    const facture = await prisma.facture.findUnique({
      where: { id },
    })

    if (!facture || facture.userId !== session.user.id) {
      return NextResponse.json({ error: "Facture non trouvée" }, { status: 404 })
    }

    // Ne pas permettre la modification si la facture est payée
    if (facture.status === "paye") {
      return NextResponse.json(
        { error: "Impossible de modifier une facture payée" },
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
      dueDate,
      serviceDate,
      paymentTerms,
      paymentMethod,
      legalMentions,
      isVatApplicable,
    } = body

    // Supprimer les anciens items
    await prisma.factureItem.deleteMany({
      where: { factureId: id },
    })

    // Mettre à jour la facture
    const updatedFacture = await prisma.facture.update({
      where: { id },
      data: {
        title,
        description: description || null,
        clientId: clientId || null,
        projectId: projectId || null,
        totalHT,
        totalTTC,
        tvaRate,
        dueDate: dueDate ? new Date(dueDate) : null,
        serviceDate: serviceDate ? new Date(serviceDate) : null,
        paymentTerms: paymentTerms || null,
        paymentMethod: paymentMethod || null,
        legalMentions: legalMentions || null,
        isVatApplicable: isVatApplicable !== false,
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

    return NextResponse.json(updatedFacture)
  } catch (error) {
    console.error("Erreur lors de la modification de la facture:", error)
    return NextResponse.json(
      { error: "Erreur lors de la modification" },
      { status: 500 }
    )
  }
}

