export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file")

    // ✅ SAFE validation
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No valid file uploaded" },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    // ✅ FIXED import (no Vercel issues)
    const pdfModule: any = await import("pdf-parse")
    const pdfParse = pdfModule.default ?? pdfModule

    const data = await pdfParse(buffer)

    return NextResponse.json({
      extractedText: data?.text ?? "",
    })

  } catch (err) {
    console.error("PDF ERROR:", err)

    return NextResponse.json(
      { error: "PDF parsing failed" },
      { status: 500 }
    )
  }
}
