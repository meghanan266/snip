import { NextRequest } from "next/server"
import { qstash } from "@/lib/qstash"

export type ClickEvent = {
  slug: string
  country: string
  userAgent: string
  referrer: string
  timestamp: string
}

// Called via ev.waitUntil(recordClick(...)) in lib/middleware/link.ts
// Runs AFTER the redirect response is sent — does not block the redirect
// QStash receives this event and delivers it to /api/analytics/ingest
// with automatic retries if the endpoint is temporarily unavailable
//
// Production equivalent: AWS SQS sendMessage() — same decoupling pattern
export async function recordClick({
  slug,
  req,
}: {
  slug: string
  req: NextRequest
}): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  if (!appUrl) {
    console.error("[recordClick] NEXT_PUBLIC_APP_URL is not set")
    return
  }

  const payload: ClickEvent = {
    slug,
    // x-vercel-ip-country is set by Vercel in production
    // in local dev this will be null so we fall back to "Unknown"
    country: req.headers.get("x-vercel-ip-country") ?? "Unknown",
    userAgent: req.headers.get("user-agent") ?? "",
    referrer: req.headers.get("referer") ?? "",
    timestamp: new Date().toISOString(),
  }

  try {
    await qstash.publishJSON({
      url: `${appUrl}/api/analytics/ingest`,
      body: payload,
    })
  } catch (error) {
    // Never throw from recordClick — a failed analytics write
    // must never break the redirect experience for the user
    console.error("[recordClick] QStash publish failed:", error)
  }
}
