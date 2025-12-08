import { NextResponse } from "next/server"

/**
 * Route de health check pour maintenir l'application active sur Render
 * Cette route peut être appelée régulièrement par un service de ping
 */
export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
    { status: 200 }
  )
}

