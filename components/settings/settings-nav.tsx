"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/parametres/tutoriel", label: "Guide de démarrage" },
  { href: "/parametres/entreprise", label: "Entreprise" },
  { href: "/parametres/clients", label: "Clients" },
]

export function SettingsNav() {
  const pathname = usePathname()

  return (
    <aside className="lg:w-64 shrink-0">
      <nav className="flex lg:flex-col gap-2 rounded-3xl border bg-card p-3 shadow-sm">
        {navLinks.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex-1 rounded-2xl px-4 py-2 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

