import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import nodemailer from "nodemailer"
import { generateFacturePDF } from "@/lib/pdf-generator"

export async function POST(
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
    const { email } = body

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Email valide requis" },
        { status: 400 }
      )
    }

    const facture = await prisma.facture.findUnique({
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

    if (!facture || facture.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Facture non trouvée" },
        { status: 404 }
      )
    }

    if (!facture.clientToken) {
      return NextResponse.json(
        { error: "Token client manquant" },
        { status: 400 }
      )
    }

    // Configuration de l'email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_FROM,
        pass: process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD,
      },
    })

    // Générer le PDF
    const pdfBuffer = await generateFacturePDF({
      number: facture.number,
      title: facture.title,
      description: facture.description,
      createdAt: facture.createdAt,
      dueDate: facture.dueDate,
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

    // URL de la facture pour le client
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const factureUrl = `${baseUrl}/client/facture/${facture.clientToken}`

    // Contenu de l'email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #28a745; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
            .amount { font-size: 24px; font-weight: bold; color: #28a745; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Facture ${facture.number}</h1>
              <p><strong>${facture.title}</strong></p>
            </div>
            
            <p>Bonjour,</p>
            
            <p>Vous trouverez ci-dessous le lien pour consulter votre facture :</p>
            
            <p class="amount">Montant total TTC : ${facture.totalTTC.toFixed(2)} €</p>
            
            ${facture.dueDate ? `<p><strong>Date d'échéance :</strong> ${new Date(facture.dueDate).toLocaleDateString("fr-FR")}</p>` : ""}
            
            <p>
              <a href="${factureUrl}" class="button">Voir la facture en ligne</a>
            </p>
            
            <p>Ou copiez ce lien dans votre navigateur :</p>
            <p style="word-break: break-all; color: #007bff;">${factureUrl}</p>
            
            ${facture.paymentMethod ? `<p><strong>Moyen de paiement :</strong> ${facture.paymentMethod}</p>` : ""}
            
            <div class="footer">
              <p>Cordialement,</p>
              <p><strong>${facture.user.companyName || facture.user.name}</strong></p>
              ${facture.user.email ? `<p>Email : ${facture.user.email}</p>` : ""}
              ${facture.user.phone ? `<p>Téléphone : ${facture.user.phone}</p>` : ""}
            </div>
          </div>
        </body>
      </html>
    `

    const emailText = `
Facture ${facture.number} - ${facture.title}

Bonjour,

Vous trouverez ci-dessous le lien pour consulter votre facture :

Montant total TTC : ${facture.totalTTC.toFixed(2)} €
${facture.dueDate ? `Date d'échéance : ${new Date(facture.dueDate).toLocaleDateString("fr-FR")}` : ""}

Lien pour voir la facture : ${factureUrl}

${facture.paymentMethod ? `Moyen de paiement : ${facture.paymentMethod}` : ""}

Cordialement,
${facture.user.companyName || facture.user.name}
${facture.user.email ? `Email : ${facture.user.email}` : ""}
${facture.user.phone ? `Téléphone : ${facture.user.phone}` : ""}
    `

    // Envoyer l'email avec le PDF en pièce jointe
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER || "noreply@menuisier-pro.fr",
      to: email,
      subject: `Facture ${facture.number} - ${facture.title}`,
      text: emailText,
      html: emailHtml,
      attachments: [
        {
          filename: `Facture-${facture.number}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    })

    // Mettre à jour le statut de la facture à "envoye"
    await prisma.facture.update({
      where: { id },
      data: { status: "envoye" },
    })

    return NextResponse.json({ 
      success: true, 
      message: "Facture envoyée par email avec succès" 
    })
  } catch (error) {
    console.error("Error sending email:", error)
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue"
    return NextResponse.json(
      { error: `Erreur lors de l'envoi de l'email: ${errorMessage}` },
      { status: 500 }
    )
  }
}

