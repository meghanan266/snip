import { NextRequest, NextResponse } from "next/server"
import { deleteLink } from "@/lib/api/links/delete-link"

export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const result = await deleteLink(slug)

    if ("error" in result) {
      const status = result.code === "not_found" ? 404 : 500
      return NextResponse.json(
        { error: { code: result.code, message: result.error } },
        { status }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("[DELETE /api/links/[slug]]", error)
    return NextResponse.json(
      { error: { code: "internal_error", message: "Something went wrong" } },
      { status: 500 }
    )
  }
}
