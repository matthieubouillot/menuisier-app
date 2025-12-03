import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

function createPrismaClient() {
  // Récupérer DATABASE_URL depuis l'environnement
  const dbUrl = process.env.DATABASE_URL
  
  if (!dbUrl) {
    throw new Error('DATABASE_URL environment variable is not set')
  }
  
  // Détecter si on utilise PostgreSQL (production) ou SQLite (développement)
  const isPostgreSQL = dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')
  
  if (isPostgreSQL) {
    // PostgreSQL : pas besoin d'adaptateur, Prisma gère nativement
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    })
  } else {
    // SQLite : utiliser l'adaptateur better-sqlite3 (uniquement en développement local)
    // Import dynamique pour éviter les erreurs en production
    const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
    
    // Extraire le chemin du fichier (enlever le préfixe "file:")
    let databasePath = dbUrl.replace(/^file:/, '')
    
    // Si c'est un chemin relatif, utiliser le chemin depuis la racine du projet
    if (databasePath.startsWith('./')) {
      databasePath = databasePath.substring(2) // Enlever "./"
    }
    
    try {
      // L'adaptateur PrismaBetterSqlite3 attend un objet avec une propriété 'url'
      const adapter = new PrismaBetterSqlite3({
        url: databasePath
      })
      
      return new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      })
    } catch (error) {
      console.error('Erreur lors de la création du client Prisma:', error)
      console.error('Database path attempted:', databasePath)
      console.error('DATABASE_URL from env:', process.env.DATABASE_URL)
      console.error('dbUrl used:', dbUrl)
      throw error
    }
  }
}

export const prisma = globalThis.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

