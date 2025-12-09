import { Navbar } from "@/components/layout/navbar"
import { SettingsNav } from "@/components/settings/settings-nav"
import { ReactNode } from "react"

export default function ParametresLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-12">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8 lg:mb-12 text-foreground">Paramètres</h1>
        <div className="space-y-6">
          <SettingsNav />
          <div className="max-w-4xl space-y-6">{children}</div>
        </div>
      </div>
    </div>
  )
}

