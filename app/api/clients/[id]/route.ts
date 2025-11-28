import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { id } = params
    if (!id) {
      return NextResponse.json({ error: "Client introuvable" }, { status: 400 })
    }

    const client = await prisma.client.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!client) {
      return NextResponse.json({ error: "Client introuvable" }, { status: 404 })
    }

    await prisma.client.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting client:", error)
    return NextResponse.json(
      { error: "Erreur lors de la suppression du client" },
      { status: 500 }
    )
  }
}

