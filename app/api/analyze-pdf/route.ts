import pdfParse from "pdf-parse"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return Response.json({ error: "No file uploaded" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const parsed = await pdfParse(buffer)

    return Response.json({
      text: parsed.text,
    })
  } catch (error) {
    console.error(error)
    return Response.json({ error: "PDF failed" }, { status: 500 })
  }
}
