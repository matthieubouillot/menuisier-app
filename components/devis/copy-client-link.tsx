"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Link2, Check } from "lucide-react"

export function CopyClientLink({ token, type }: { token: string | null; type: "devis" | "facture" }) {
  const [copied, setCopied] = useState(false)
  const [clientUrl, setClientUrl] = useState<string>("")

  useEffect(() => {
    if (typeof window !== "undefined" && token) {
      setClientUrl(`${window.location.origin}/client/${type}/${token}`)
    } else {
      setClientUrl("")
    }
  }, [token, type])

  const handleCopy = async () => {
    if (!clientUrl || !token) return
    
    try {
      await navigator.clipboard.writeText(clientUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Erreur lors de la copie:", error)
      alert("Impossible de copier le lien. Lien: " + clientUrl)
    }
  }

  if (!token) {
    return null
  }

  const buttonContent = useMemo(() => {
    if (copied) {
      return (
        <>
          <Check className="mr-2 h-5 w-5" />
          Lien copié !
        </>
      )
    }
    return (
      <>
        <Link2 className="mr-2 h-5 w-5" />
        Copier le lien client
      </>
    )
  }, [copied])

  return (
    <Button
      onClick={handleCopy}
      variant="outline"
      size="lg"
      className="rounded-xl"
      disabled={!clientUrl}
    >
      {buttonContent}
    </Button>
  )
}
