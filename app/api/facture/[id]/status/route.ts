import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { id } = await params
    const { status } = await request.json()

    // Valider le statut
    const validStatuses = ["brouillon", "envoye", "paye", "impaye"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Statut invalide" },
        { status: 400 }
      )
    }

    const facture = await prisma.facture.findUnique({
      where: { id },
    })

    if (!facture || facture.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Facture non trouvée" },
        { status: 404 }
      )
    }

    const updated = await prisma.facture.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating facture status:", error)
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du statut" },
      { status: 500 }
    )
  }
}

