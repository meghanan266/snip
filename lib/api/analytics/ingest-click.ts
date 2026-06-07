import { prisma } from "@/lib/prisma"
import { parseUserAgent, parseReferrer } from "@/lib/parse-headers"
import type { ClickEvent } from "@/lib/analytics"

export async function ingestClick(event: ClickEvent): Promise<void> {
  const link = await prisma.link.findUnique({
    where: { slug: event.slug },
    select: { id: true },
  })

  // Link was deleted between the click and processing — skip silently.
  // Return without error so QStash does not retry.
  if (!link) {
    console.log(`[ingest] Link not found for slug: ${event.slug} — skipping`)
    return
  }

  const { device, browser } = parseUserAgent(event.userAgent ?? "")
  const referrer = parseReferrer(event.referrer)

  await prisma.click.create({
    data: {
      linkId: link.id,
      country: event.country ?? "Unknown",
      device,
      browser,
      referrer,
      timestamp: event.timestamp ? new Date(event.timestamp) : new Date(),
    },
  })
}
