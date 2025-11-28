import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateDevisPDF } from "@/lib/pdf-generator"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { id } = await params

    const devis = await prisma.devis.findUnique({
      where: { id },
      include: {
        client: true,
        user: {
          select: {
            name: true,
            companyName: true,
            address: true,
            city: true,
            postalCode: true,
            phone: true,
            email: true,
            siret: true,
            rcs: true,
            vatNumber: true,
          },
        },
        items: true,
      },
    })

    if (!devis || devis.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Devis non trouvé" },
        { status: 404 }
      )
    }

    const pdfBuffer = await generateDevisPDF({
      number: devis.number,
      title: devis.title,
      description: devis.description,
      createdAt: devis.createdAt,
      validUntil: devis.validUntil,
      totalHT: devis.totalHT,
      totalTTC: devis.totalTTC,
      tvaRate: devis.tvaRate,
      advancePayment: devis.advancePayment,
      paymentTerms: devis.paymentTerms,
      isVatApplicable: devis.isVatApplicable,
      items: devis.items,
      user: devis.user,
      client: devis.client,
    })

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Devis-${devis.number}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Error generating PDF:", error)
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue"
    console.error("Full error details:", errorMessage)
    return NextResponse.json(
      { error: `Erreur lors de la génération du PDF: ${errorMessage}` },
      { status: 500 }
    )
  }
}

