"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/parametres/tutoriel", label: "Guide de démarrage" },
  { href: "/parametres/entreprise", label: "Entreprise" },
  { href: "/parametres/clients", label: "Clients" },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="w-full border-b border-border">
      <div className="flex gap-1">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-all border-b-2 -mb-px",
                isActive
                  ? "text-primary border-primary"
                  : "text-muted-foreground border-transparent hover:text-foreground hover:border-muted-foreground/30"
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
