import { NextResponse } from "next/server"
import OpenAI from "openai"

export const runtime = "nodejs"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function POST(req: Request) {
  try {
    const formData = await req.formData()

    const deal = JSON.parse(formData.get("deal") as string)
    const file = formData.get("file") as File | null

    let fileText = ""

    // ✅ READ FILE CONTENT (basic version)
    if (file) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // ⚠️ TEMP: convert to text (simple)
      fileText = buffer.toString("utf-8")
    }

    // 🔥 COMBINE DEAL + FILE
    const prompt = `
Analyze this sales deal.

Deal:
${JSON.stringify(deal)}

File Content:
${fileText}

Return JSON:
{
  "summary": "",
  "risks": "",
  "suggestions": "",
  "score": 0
}
`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    })

    const text = completion.choices[0].message.content || "{}"

    const parsed = JSON.parse(text)

    return NextResponse.json(parsed)

  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "AI failed" }, { status: 500 })
  }
}
