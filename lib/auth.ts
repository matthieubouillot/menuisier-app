import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import bcrypt from "bcryptjs"

// Import lazy de Prisma pour éviter les problèmes avec Edge Runtime
async function getPrisma() {
  const { prisma } = await import("./prisma")
  return prisma
}

const providers: any[] = []

// Ajouter Google OAuth seulement si les clés sont configurées
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && 
    process.env.GOOGLE_CLIENT_ID !== "" && process.env.GOOGLE_CLIENT_SECRET !== "") {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    })
  )
}

// Ajouter GitHub OAuth seulement si les clés sont configurées
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET &&
    process.env.GITHUB_CLIENT_ID !== "" && process.env.GITHUB_CLIENT_SECRET !== "") {
  providers.push(
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    })
  )
}

// Toujours ajouter le provider Credentials
providers.push(
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = credentials.email as string
        const password = credentials.password as string

        const prisma = await getPrisma()
        const user = await prisma.user.findUnique({
          where: { email }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      }
    })
)

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true, // Autoriser tous les hosts (nécessaire pour Render)
  providers,
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Autoriser toutes les connexions par credentials
      if (account?.provider === "credentials") {
        return true
      }

      // Pour OAuth (Google, GitHub)
      if (account?.provider === "google" || account?.provider === "github") {
        try {
          // Pour Google, l'email peut être dans user.email ou profile.email
          // Pour GitHub, l'email est généralement dans user.email
          const email = user.email || (profile as any)?.email || (profile as any)?.emailAddress
          
          console.log("OAuth signIn - Debug:", {
            provider: account.provider,
            userEmail: user.email,
            profileEmail: (profile as any)?.email,
            finalEmail: email,
            userName: user.name,
            profileName: (profile as any)?.name
          })
          
          if (!email) {
            console.error("OAuth: Email non disponible", { 
              user, 
              profile,
              account: { provider: account.provider, type: account.type }
            })
            // Pour le développement, on peut autoriser même sans email pour voir ce qui se passe
            // En production, vous devriez retourner false
            return false
          }
          
          // Vérifier si l'utilisateur existe déjà
          const prisma = await getPrisma()
          const existingUser = await prisma.user.findUnique({
            where: { email },
          })

          if (!existingUser) {
            // Créer un nouvel utilisateur pour OAuth
            const newUser = await prisma.user.create({
              data: {
                email,
                name: user.name || (profile as any)?.name || email.split("@")[0],
                password: null, // Pas de mot de passe pour OAuth
              },
            })
            console.log("Nouvel utilisateur OAuth créé:", newUser.id)
          } else {
            console.log("Utilisateur OAuth existant trouvé:", existingUser.id)
          }
          
          return true
        } catch (error) {
          console.error("Erreur lors de la connexion OAuth:", error)
          // En cas d'erreur, on retourne false pour bloquer la connexion
          return false
        }
      }

      // Par défaut, autoriser la connexion
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.email = user.email
      }
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      // Utiliser les données du token JWT au lieu de faire une requête Prisma
      // Cela évite les problèmes avec Edge Runtime
      if (session.user && token.id) {
        session.user.id = token.id as string
      }
      return session
    }
  }
})

