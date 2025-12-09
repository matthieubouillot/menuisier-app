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
    const body = await request.json()
    const { title, description, startDate, endDate, type, location, projectId } = body

    if (!title || !startDate) {
      return NextResponse.json(
        { error: "Titre et date de début requis" },
        { status: 400 }
      )
    }

    // Vérifier que l'événement appartient à l'utilisateur
    const existingEvent = await prisma.calendarEvent.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingEvent) {
      return NextResponse.json(
        { error: "Événement non trouvé" },
        { status: 404 }
      )
    }

    const updatedEvent = await prisma.calendarEvent.update({
      where: { id },
      data: {
        title,
        description: description || null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        type: type || "chantier",
        location: location || null,
        projectId: projectId || null,
      },
      include: { project: true },
    })

    return NextResponse.json(updatedEvent)
  } catch (error) {
    console.error("Error updating event:", error)
    return NextResponse.json(
      { error: "Erreur lors de la modification" },
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

    // Vérifier que l'événement appartient à l'utilisateur
    const existingEvent = await prisma.calendarEvent.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingEvent) {
      return NextResponse.json(
        { error: "Événement non trouvé" },
        { status: 404 }
      )
    }

    await prisma.calendarEvent.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting event:", error)
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    )
  }
}

