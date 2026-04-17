import OpenAI from "openai"
import { NextResponse } from "next/server"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { deal, notes } = await req.json()

    if (!deal) {
      return NextResponse.json({
        result: "No deal data received.",
      })
    }

    const prompt = `
You are a CRM sales assistant.

Analyze this deal and provide:
1. Deal Score (0–100%)
2. Next Best Action
3. Insight

Deal:
- Company: ${deal.company}
- Value: ${deal.value}
- Stage: ${deal.stage}

Notes:
${notes.map((n: { content: string }) => "- " + n.content).join("\n")}

Respond in this format:
Score: X%
Next Action: ...
Insight: ...
`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful CRM AI assistant." },
        { role: "user", content: prompt },
      ],
    })

    const result = response.choices[0].message.content

    return NextResponse.json({ result })
  } catch (error) {
    console.error(error)
    return NextResponse.json({
      result: "Error generating AI response.",
    })
  }
}
