import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name, companyName } = body

    // Validation des champs requis
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      )
    }

    // Validation de la longueur du mot de passe
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 6 caractères" },
        { status: 400 }
      )
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé" },
        { status: 400 }
      )
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10)

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        companyName: companyName || null,
      },
    })

    return NextResponse.json(
      { message: "Utilisateur créé avec succès", userId: user.id },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Registration error:", error)
    console.error("Error details:", {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
      stack: error?.stack
    })
    
    // Retourner un message d'erreur plus détaillé en développement
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? error?.message || "Erreur lors de l'inscription"
      : "Erreur lors de l'inscription"
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    )
  }
}

