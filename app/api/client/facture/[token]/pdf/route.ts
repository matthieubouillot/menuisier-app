import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateFacturePDF } from "@/lib/pdf-generator"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    const facture = await prisma.facture.findUnique({
      where: { clientToken: token },
      include: {
        client: true,
        devis: {
          select: {
            number: true,
          },
        },
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

    if (!facture) {
      return NextResponse.json(
        { error: "Facture non trouvée" },
        { status: 404 }
      )
    }

    const pdfBuffer = await generateFacturePDF({
      number: facture.number,
      title: facture.title,
      description: facture.description,
      createdAt: facture.createdAt,
      dueDate: facture.dueDate,
      serviceDate: facture.serviceDate,
      devisNumber: facture.devis?.number || null,
      totalHT: facture.totalHT,
      totalTTC: facture.totalTTC,
      tvaRate: facture.tvaRate,
      paidAmount: facture.paidAmount,
      paymentTerms: facture.paymentTerms,
      paymentMethod: facture.paymentMethod,
      isVatApplicable: facture.isVatApplicable,
      items: facture.items,
      user: facture.user,
      client: facture.client,
    })

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Facture-${facture.number}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Error generating PDF:", error)
    return NextResponse.json(
      { error: "Erreur lors de la génération du PDF" },
      { status: 500 }
    )
  }
}

