import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import nodemailer from "nodemailer"
import { generateDevisPDF } from "@/lib/pdf-generator"

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

    if (!devis.clientToken) {
      return NextResponse.json(
        { error: "Token client manquant" },
        { status: 400 }
      )
    }

    // Configuration de l'email (utilise les variables d'environnement ou SMTP par défaut)
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

    // URL du devis pour le client
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const devisUrl = `${baseUrl}/client/devis/${devis.clientToken}`

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
            .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Devis ${devis.number}</h1>
              <p><strong>${devis.title}</strong></p>
            </div>
            
            <p>Bonjour,</p>
            
            <p>Vous trouverez ci-dessous le lien pour consulter votre devis :</p>
            
            <p><strong>Montant total TTC :</strong> ${devis.totalTTC.toFixed(2)} €</p>
            
            ${devis.validUntil ? `<p><strong>Valide jusqu'au :</strong> ${new Date(devis.validUntil).toLocaleDateString("fr-FR")}</p>` : ""}
            
            <p>
              <a href="${devisUrl}" class="button">Voir le devis en ligne</a>
            </p>
            
            <p>Ou copiez ce lien dans votre navigateur :</p>
            <p style="word-break: break-all; color: #007bff;">${devisUrl}</p>
            
            <p>Après avoir consulté le devis, merci de le signer et de nous le renvoyer par email ou de nous confirmer votre accord.</p>
            
            <div class="footer">
              <p>Cordialement,</p>
              <p><strong>${devis.user.companyName || devis.user.name}</strong></p>
              ${devis.user.email ? `<p>Email : ${devis.user.email}</p>` : ""}
              ${devis.user.phone ? `<p>Téléphone : ${devis.user.phone}</p>` : ""}
            </div>
          </div>
        </body>
      </html>
    `

    const emailText = `
Devis ${devis.number} - ${devis.title}

Bonjour,

Vous trouverez ci-dessous le lien pour consulter votre devis :

Montant total TTC : ${devis.totalTTC.toFixed(2)} €
${devis.validUntil ? `Valide jusqu'au : ${new Date(devis.validUntil).toLocaleDateString("fr-FR")}` : ""}

Lien pour voir le devis : ${devisUrl}

Après avoir consulté le devis, merci de le signer et de nous le renvoyer par email ou de nous confirmer votre accord.

Cordialement,
${devis.user.companyName || devis.user.name}
${devis.user.email ? `Email : ${devis.user.email}` : ""}
${devis.user.phone ? `Téléphone : ${devis.user.phone}` : ""}
    `

    // Envoyer l'email avec le PDF en pièce jointe
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER || "noreply@menuisier-pro.fr",
      to: email,
      subject: `Devis ${devis.number} - ${devis.title}`,
      text: emailText,
      html: emailHtml,
      attachments: [
        {
          filename: `Devis-${devis.number}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    })

    // Mettre à jour le statut du devis à "envoye"
    await prisma.devis.update({
      where: { id },
      data: { status: "envoye" },
    })

    return NextResponse.json({ 
      success: true, 
      message: "Devis envoyé par email avec succès" 
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

