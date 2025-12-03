import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateDevisPDF } from "@/lib/pdf-generator"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    const devis = await prisma.devis.findUnique({
      where: { clientToken: token },
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

    if (!devis) {
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
      workStartDate: devis.workStartDate,
      workDuration: devis.workDuration,
      travelExpenses: devis.travelExpenses,
      insuranceInfo: devis.insuranceInfo,
      afterSalesService: devis.afterSalesService,
      cgvReference: devis.cgvReference,
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

