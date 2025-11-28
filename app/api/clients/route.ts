import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const clients = await prisma.client.findMany({
      where: { userId: session.user.id },
      orderBy: [
        { type: "asc" },
        { companyName: "asc" },
        { lastName: "asc" },
      ],
    })

    return NextResponse.json(clients)
  } catch (error) {
    console.error("Error fetching clients:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des clients" },
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

    const client = await prisma.client.create({
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
        userId: session.user.id,
      },
    })

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    console.error("Error creating client:", error)
    return NextResponse.json(
      { error: "Erreur lors de la création du client" },
      { status: 500 }
    )
  }
}

