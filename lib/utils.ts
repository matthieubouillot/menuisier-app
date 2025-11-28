import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  // Format simple sans séparateurs de milliers pour éviter les problèmes de rendu
  const formatted = amount.toFixed(2).replace('.', ',')
  return formatted + ' €'
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}


/**
 * Génère un token sécurisé pour l'accès client aux devis/factures
 * Format: base64url encodé pour être sûr dans les URLs
 * ⚠️ À utiliser uniquement côté serveur
 */
export function generateClientToken(): string {
  // Vérifier si on est côté serveur
  if (typeof window === 'undefined') {
    // Utilise crypto de Node.js (disponible dans l'environnement serveur)
    const crypto = require('crypto')
    const randomBytes = crypto.randomBytes(32)
    
    // Convertit en base64url (sans padding, URL-safe)
    return randomBytes
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
      .substring(0, 43) // 43 caractères = 256 bits en base64url
  }
  
  // Fallback côté client (ne devrait jamais arriver)
  throw new Error('generateClientToken should only be called on the server')
}

type ClientLike = {
  companyName?: string | null
  firstName?: string | null
  lastName?: string | null
} | null | undefined

export function formatClientName(client: ClientLike): string {
  if (!client) return "Sans client"
  if (client.companyName && client.companyName.trim().length > 0) {
    return client.companyName
  }
  const parts = [client.firstName, client.lastName].filter(Boolean).join(" ").trim()
  return parts || "Sans client"
}

/**
 * Formate le statut d'un devis en français
 */
export function formatDevisStatus(status: string): string {
  const statusMap: Record<string, string> = {
    brouillon: "Brouillon",
    envoye: "Envoyé",
    signe: "Signé",
    refuse: "Refusé",
    expire: "Expiré",
  }
  return statusMap[status] || status
}

/**
 * Retourne la classe CSS pour le statut d'un devis
 */
export function getDevisStatusClass(status: string): string {
  const classMap: Record<string, string> = {
    brouillon: "bg-muted text-muted-foreground",
    envoye: "bg-blue-100 text-blue-700",
    signe: "bg-green-100 text-green-700",
    refuse: "bg-red-100 text-red-700",
    expire: "bg-orange-100 text-orange-700",
  }
  return classMap[status] || "bg-muted text-muted-foreground"
}

/**
 * Formate le statut d'une facture en français
 */
export function formatFactureStatus(status: string): string {
  const statusMap: Record<string, string> = {
    brouillon: "Brouillon",
    envoye: "Envoyée",
    paye: "Payée",
    impaye: "Impayée",
  }
  return statusMap[status] || status
}

/**
 * Retourne la classe CSS pour le statut d'une facture
 */
export function getFactureStatusClass(status: string): string {
  const classMap: Record<string, string> = {
    brouillon: "bg-muted text-muted-foreground",
    envoye: "bg-blue-100 text-blue-700",
    paye: "bg-green-100 text-green-700",
    impaye: "bg-red-100 text-red-700",
  }
  return classMap[status] || "bg-muted text-muted-foreground"
}

