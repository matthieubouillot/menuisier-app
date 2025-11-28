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
    const existing = await prisma.material.findUnique({ where: { id } })
    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Matériau introuvable" }, { status: 404 })
    }

    const body = await request.json()
    const { name, category, unit, unitPrice, supplier, supplierRef, stockQuantity, minStock } = body

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

    const material = await prisma.material.update({
      where: { id },
      data: {
        name: name.trim(),
        category: category.trim(),
        unit: unit.trim(),
        unitPrice: parsedUnitPrice,
        supplier: supplier?.trim() || null,
        supplierRef: supplierRef?.trim() || null,
        stockQuantity:
          stockQuantity !== undefined ? parseFloat(stockQuantity) || 0 : existing.stockQuantity,
        minStock: minStock !== undefined ? parseFloat(minStock) || 0 : existing.minStock,
      },
    })

    return NextResponse.json(material)
  } catch (error) {
    console.error("Error updating material:", error)
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
    const existing = await prisma.material.findUnique({ where: { id } })
    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Matériau introuvable" }, { status: 404 })
    }

    await prisma.material.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting material:", error)
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 })
  }
}


