import OpenAI from "openai"
import { NextResponse } from "next/server"

interface Message {
  role: string
  content: string
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { messages, deal, notes } = await req.json()

    const systemPrompt = `
You are a smart CRM sales assistant.

You help users close deals by analyzing:
- Deal info
- Activity notes
- Sales stage

Be concise, helpful, and strategic.
`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },

        {
          role: "user",
          content: `
Deal:
Company: ${deal?.company}
Value: ${deal?.value}
Stage: ${deal?.stage}

Notes:
${notes?.map((n: { content: string }) => "- " + n.content).join("\n")}

Conversation:
${messages.map((m: Message) => `${m.role}: ${m.content}`).join("\n")}
`,
        },
      ],
    })

    const reply = response.choices[0].message.content

    return NextResponse.json({ reply })
  } catch (err) {
    console.error(err)
    return NextResponse.json({
      reply: "Error generating response.",
    })
  }
}
