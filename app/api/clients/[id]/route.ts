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
    if (!id) {
      return NextResponse.json({ error: "Client introuvable" }, { status: 400 })
    }

    const body = await request.json()
    const { firstName, lastName, type = "particulier", companyName, siret, email, phone, address, city, postalCode, notes } = body

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: "Prénom et nom requis" },
        { status: 400 }
      )
    }

    if (type === "professionnel" && (!companyName || companyName.trim() === "")) {
      return NextResponse.json(
        { error: "Le nom de l'entreprise est requis pour un client professionnel." },
        { status: 400 }
      )
    }
    if (type === "professionnel" && (!siret || siret.trim() === "")) {
      return NextResponse.json(
        { error: "Le SIRET est requis pour un client professionnel." },
        { status: 400 }
      )
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

    const updatedClient = await prisma.client.update({
      where: { id },
      data: {
        firstName,
        lastName,
        type,
        companyName: companyName || null,
        siret: siret || null,
        email: email || null,
        phone: phone || null,
        address: address || null,
        city: city || null,
        postalCode: postalCode || null,
        notes: notes || null,
      },
    })

    return NextResponse.json(updatedClient)
  } catch (error) {
    console.error("Error updating client:", error)
    return NextResponse.json(
      { error: "Erreur lors de la modification du client" },
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

