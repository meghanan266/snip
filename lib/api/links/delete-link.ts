import { prisma } from "@/lib/prisma"
import { linkCache } from "@/lib/api/links/cache"

export type DeleteLinkResult =
  | { success: true }
  | { error: string; code: string }

export async function deleteLink(slug: string): Promise<DeleteLinkResult> {
  const link = await prisma.link.findUnique({
    where: { slug },
    select: { id: true },
  })

  if (!link) {
    return { error: "Link not found", code: "not_found" }
  }

  await prisma.link.delete({ where: { slug } })

  // CRITICAL: invalidate cache so the deleted link stops redirecting immediately
  await linkCache.delete(slug)

  return { success: true }
}
