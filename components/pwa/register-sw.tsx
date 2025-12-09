"use client";

import { useEffect } from "react";

export function RegisterServiceWorker() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker enregistré avec succès:", registration);
        })
        .catch((error) => {
          console.log("Erreur lors de l'enregistrement du Service Worker:", error);
        });
    }
  }, []);

  return null;
}

