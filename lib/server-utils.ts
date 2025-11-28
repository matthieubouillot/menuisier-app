import { prisma } from "@/lib/prisma"

/**
 * Génère un numéro de devis séquentiel conforme à la loi française
 * Format: DEV-YYYY-XXX (séquentiel, continu, chronologique)
 * ⚠️ À utiliser uniquement côté serveur
 */
export async function generateDevisNumber(userId: string): Promise<string> {
  const year = new Date().getFullYear()
  
  // Trouver le dernier numéro de devis de l'année pour cet utilisateur
  const lastDevis = await prisma.devis.findFirst({
    where: {
      userId,
      number: {
        startsWith: `DEV-${year}-`,
      },
    },
    orderBy: {
      number: "desc",
    },
  })

  let nextNumber = 1
  if (lastDevis) {
    // Extraire le numéro séquentiel du dernier devis
    const match = lastDevis.number.match(/DEV-\d{4}-(\d+)/)
    if (match && match[1]) {
      nextNumber = parseInt(match[1], 10) + 1
    }
  }

  return `DEV-${year}-${nextNumber.toString().padStart(3, '0')}`
}

/**
 * Génère un numéro de facture séquentiel conforme à la loi française
 * Format: FAC-YYYY-XXX (séquentiel, continu, chronologique)
 * ⚠️ À utiliser uniquement côté serveur
 */
export async function generateFactureNumber(userId: string): Promise<string> {
  const year = new Date().getFullYear()
  
  // Trouver le dernier numéro de facture de l'année pour cet utilisateur
  const lastFacture = await prisma.facture.findFirst({
    where: {
      userId,
      number: {
        startsWith: `FAC-${year}-`,
      },
    },
    orderBy: {
      number: "desc",
    },
  })

  let nextNumber = 1
  if (lastFacture) {
    // Extraire le numéro séquentiel de la dernière facture
    const match = lastFacture.number.match(/FAC-\d{4}-(\d+)/)
    if (match && match[1]) {
      nextNumber = parseInt(match[1], 10) + 1
    }
  }

  return `FAC-${year}-${nextNumber.toString().padStart(3, '0')}`
}

