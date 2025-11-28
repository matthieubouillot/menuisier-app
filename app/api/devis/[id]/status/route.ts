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
    const validStatuses = ["brouillon", "envoye", "signe", "refuse", "expire"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Statut invalide" },
        { status: 400 }
      )
    }

    const devis = await prisma.devis.findUnique({
      where: { id },
    })

    if (!devis || devis.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Devis non trouvé" },
        { status: 404 }
      )
    }

    const updated = await prisma.devis.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating devis status:", error)
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du statut" },
      { status: 500 }
    )
  }
}

