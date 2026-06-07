import { prisma } from "@/lib/prisma"
import { linkCache } from "@/lib/api/links/cache"
import type { ProcessedLink } from "@/lib/api/links/process-link"

export type CreatedLink = {
  id: string
  url: string
  slug: string
  shortLink: string
  expiresAt: Date | null
  createdAt: Date
}

export async function createLink(link: ProcessedLink): Promise<CreatedLink> {
  // 1. Write to MySQL
  const created = await prisma.link.create({
    data: {
      url: link.url,
      slug: link.slug,
      password: link.password,
      expiresAt: link.expiresAt,
    },
  })

  // 2. Write to Redis cache immediately after DB write
  // This ensures the first redirect after creation is a cache hit
  // Reference: dub/apps/web/lib/api/links/create-link.ts does the same
  await linkCache.set({
    slug: created.slug,
    url: created.url,
    password: created.password,
    expiresAt: created.expiresAt,
  })

  // 3. Build the full short link URL
  const shortLink = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/${created.slug}`

  return {
    id: created.id,
    url: created.url,
    slug: created.slug,
    shortLink,
    expiresAt: created.expiresAt,
    createdAt: created.createdAt,
  }
}
