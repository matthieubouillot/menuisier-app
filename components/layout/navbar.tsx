"use client"

import { useState } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, 
  FileText, 
  Calculator, 
  Calendar, 
  LogOut,
  Menu,
  Settings
} from "lucide-react"

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { data: session } = useSession()

  if (!session) return null

  return (
    <nav className="border-b-2 border-border bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="text-2xl font-bold text-primary hover:opacity-80 transition-opacity">
              Menuisier Pro
            </Link>
            <div className="hidden md:flex items-center space-x-2">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="rounded-xl">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Tableau de bord
                </Button>
              </Link>
              <Link href="/devis">
                <Button variant="ghost" size="sm" className="rounded-xl">
                  <FileText className="mr-2 h-4 w-4" />
                  Devis & Factures
                </Button>
              </Link>
              <Link href="/atelier">
                <Button variant="ghost" size="sm" className="rounded-xl">
                  <Calculator className="mr-2 h-4 w-4" />
                  Mon atelier
                </Button>
              </Link>
              <Link href="/calendrier">
                <Button variant="ghost" size="sm" className="rounded-xl">
                  <Calendar className="mr-2 h-4 w-4" />
                  Calendrier
                </Button>
              </Link>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            <Link href="/parametres">
              <Button variant="ghost" size="sm" className="rounded-xl">
                <Settings className="mr-2 h-4 w-4" />
                Paramètres
              </Button>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <span className="hidden sm:block text-sm text-muted-foreground font-medium">
              {session.user?.email}
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => signOut()}
              className="rounded-xl"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-xl"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start rounded-xl">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Tableau de bord
              </Button>
            </Link>
            <Link href="/devis" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start rounded-xl">
                <FileText className="mr-2 h-4 w-4" />
                Devis & Factures
              </Button>
            </Link>
            <Link href="/atelier" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start rounded-xl">
                <Calculator className="mr-2 h-4 w-4" />
                Mon atelier
              </Button>
            </Link>
            <Link href="/calendrier" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start rounded-xl">
                <Calendar className="mr-2 h-4 w-4" />
                Calendrier
              </Button>
            </Link>
            <Link href="/parametres" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start rounded-xl">
                <Settings className="mr-2 h-4 w-4" />
                Paramètres
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

