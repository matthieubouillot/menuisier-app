import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      companyName,
      address,
      city,
      postalCode,
      phone,
      siret,
      rcs,
      vatNumber,
      legalMentions,
      paymentTerms,
    paymentMethod,
    } = body

    // Validation des champs obligatoires
    if (!name || !address || !city || !postalCode) {
      return NextResponse.json(
        { error: "Les champs marqués d'un * sont obligatoires" },
        { status: 400 }
      )
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name || null,
        companyName: companyName || null,
        address: address || null,
        city: city || null,
        postalCode: postalCode || null,
        phone: phone || null,
        siret: siret || null,
        rcs: rcs || null,
        vatNumber: vatNumber || null,
        legalMentions: legalMentions || null,
        paymentTerms: paymentTerms || null,
      paymentMethod: paymentMethod || null,
      },
    })

    return NextResponse.json({ message: "Paramètres mis à jour avec succès", user: updated })
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour des paramètres" },
      { status: 500 }
    )
  }
}

