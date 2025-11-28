import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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
    const existing = await prisma.materialCalculation.findFirst({
      where: { id, userId: session.user.id },
    })
    if (!existing) {
      return NextResponse.json({ error: "Calcul introuvable." }, { status: 404 })
    }

    const body = await request.json()
    const { projectType, dimensions, materials, totalCost, clientId } = body

    let resolvedClientId: string | null = null
    if (clientId) {
      const client = await prisma.client.findFirst({
        where: { id: clientId, userId: session.user.id },
        select: { id: true },
      })
      if (!client) {
        return NextResponse.json(
          { error: "Client introuvable pour votre compte." },
          { status: 400 }
        )
      }
      resolvedClientId = client.id
    }

    const calculation = await prisma.materialCalculation.update({
      where: { id },
      data: {
        projectType,
        dimensions: JSON.stringify(dimensions),
        materials: JSON.stringify(materials),
        totalCost: parseFloat(totalCost) || 0,
        clientId: resolvedClientId,
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
          },
        },
      },
    })

    return NextResponse.json(calculation)
  } catch (error) {
    console.error("Error updating calculation:", error)
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { id } = await params
    const existing = await prisma.materialCalculation.findFirst({
      where: { id, userId: session.user.id },
      select: { id: true },
    })
    if (!existing) {
      return NextResponse.json({ error: "Calcul introuvable." }, { status: 404 })
    }

    await prisma.materialCalculation.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting calculation:", error)
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 })
  }
}


