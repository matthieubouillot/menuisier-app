import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const events = await prisma.calendarEvent.findMany({
      where: { userId: session.user.id },
      include: { project: true },
      orderBy: { startDate: "asc" },
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération" },
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
    const { title, description, startDate, endDate, type, location, projectId } = body

    if (!title || !startDate) {
      return NextResponse.json(
        { error: "Titre et date de début requis" },
        { status: 400 }
      )
    }

    const event = await prisma.calendarEvent.create({
      data: {
        title,
        description: description || null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        type: type || "chantier",
        location: location || null,
        projectId: projectId || null,
        userId: session.user.id,
      },
      include: { project: true },
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error("Error creating event:", error)
    return NextResponse.json(
      { error: "Erreur lors de la création" },
      { status: 500 }
    )
  }
}

