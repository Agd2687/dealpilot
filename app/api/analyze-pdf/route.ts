export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    // ✅ SAFE dynamic import (this fixes Vercel)
    const pdfParse = await import("pdf-parse").then(
      (mod) => mod.default || mod
    )

    const data = await pdfParse(buffer)

    return NextResponse.json({
      extractedText: data.text,
    })

  } catch (err) {
    console.error("PDF ERROR:", err)

    return NextResponse.json(
      { error: "PDF parsing failed" },
      { status: 500 }
    )
  }
}
