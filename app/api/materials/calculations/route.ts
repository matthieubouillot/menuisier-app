import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const calculations = await prisma.materialCalculation.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    })

    // Récupérer les clients associés séparément pour éviter les problèmes de relation
    const clientIds = calculations
      .map((calc) => calc.clientId)
      .filter((id): id is string => id !== null)
    const clients = clientIds.length > 0
      ? await prisma.client.findMany({
          where: { id: { in: clientIds }, userId: session.user.id },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
            type: true,
          },
        })
      : []

    const clientMap = new Map(clients.map((c) => [c.id, c]))
    const calculationsWithClients = calculations.map((calc) => ({
      ...calc,
      client: calc.clientId ? clientMap.get(calc.clientId) || null : null,
    }))

    return NextResponse.json(calculationsWithClients)
  } catch (error) {
    console.error("Error fetching calculations:", error)
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue"
    return NextResponse.json(
      { error: "Erreur lors de la récupération", details: errorMessage },
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

    const calculation = await prisma.materialCalculation.create({
      data: {
        projectType,
        dimensions: JSON.stringify(dimensions),
        materials: JSON.stringify(materials),
        totalCost: parseFloat(totalCost) || 0,
        userId: session.user.id,
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

    return NextResponse.json(calculation, { status: 201 })
  } catch (error) {
    console.error("Error saving calculation:", error)
    return NextResponse.json({ error: "Erreur lors de la sauvegarde" }, { status: 500 })
  }
}

