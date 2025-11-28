import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const materials = await prisma.material.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
    })

    return NextResponse.json(materials)
  } catch (error) {
    console.error("Error fetching materials:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await request.json()
    const { name, category, unit, unitPrice, supplier, stockQuantity, minStock } = body

    if (!name?.trim() || !category?.trim() || !unit?.trim()) {
      return NextResponse.json(
        { error: "Nom, catégorie et unité sont obligatoires." },
        { status: 400 }
      )
    }

    const parsedUnitPrice = parseFloat(unitPrice)
    if (Number.isNaN(parsedUnitPrice) || parsedUnitPrice < 0) {
      return NextResponse.json({ error: "Le prix doit être un nombre positif." }, { status: 400 })
    }

    const material = await prisma.material.create({
      data: {
        name: name.trim(),
        category: category.trim(),
        unit: unit.trim(),
        unitPrice: parsedUnitPrice,
        supplier: supplier?.trim() || null,
        stockQuantity: stockQuantity ? parseFloat(stockQuantity) || 0 : 0,
        minStock: minStock ? parseFloat(minStock) || 0 : 0,
        userId: session.user.id,
      },
    })

    return NextResponse.json(material, { status: 201 })
  } catch (error) {
    console.error("Error creating material:", error)
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 })
  }
}


