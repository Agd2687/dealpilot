"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Pencil, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

type Deal = {
  id: string
  company: string
  value: string | number
  stage: string
}

type Note = {
  id: string
  content: string
  created_at: string
  deal_id: string
}

export default function DealDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const dealId = String(params.id)

  const [deal, setDeal] = useState<Deal | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [newNote, setNewNote] = useState("")
  const [aiInsight, setAiInsight] = useState<string | null>(null)
  const [loadingAI, setLoadingAI] = useState(false)
  const [saving, setSaving] = useState(false)
  const [now, setNow] = useState(0)
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [input, setInput] = useState("")
  const [chatLoading, setChatLoading] = useState(false)

  const generateAIInsight = async () => {
  setLoadingAI(true)
  
  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deal,
        notes,
      }),
    })

    const data = await res.json()
    setAiInsight(data.result)
  } catch (err) {
    console.error(err)
    setAiInsight("Something went wrong generating insight.")
  }
  setLoadingAI(false)
}

const sendMessage = async () => {
  if (!input.trim()) return

  const newMessages = [...messages, { role: "user", content: input }]
  setMessages(newMessages)
  setInput("")
  setChatLoading(true)

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: newMessages,
        deal,
        notes,
      }),
    })

    const data = await res.json()

    setMessages([
      ...newMessages,
      { role: "assistant", content: data.reply },
    ])
  } catch (err) {
    console.error(err)
  }

  setChatLoading(false)
}

const scoreMatch = aiInsight?.match(/Score: (\d+)%/)
const actionMatch = aiInsight?.match(/Next Action: (.*)/)
const insightMatch = aiInsight?.match(/Insight: (.*)/)

const score = scoreMatch?.[1] || "0"
const action = actionMatch?.[1] || ""
const insight = insightMatch?.[1] || ""
  // 🎨 Stage color
  const stageTone = useMemo(() => {
    const stage = deal?.stage?.toLowerCase() || ""

    if (stage.includes("qualified"))
      return "bg-blue-500/20 text-blue-300 border-blue-400/30"

    if (stage.includes("proposal"))
      return "bg-yellow-500/20 text-yellow-300 border-yellow-400/30"

    if (stage.includes("closed"))
      return "bg-green-500/20 text-green-300 border-green-400/30"

    return "bg-gray-500/20 text-gray-300 border-gray-400/30"
  }, [deal?.stage])

  // 💰 Currency
  const formatCurrency = (value: string | number) => {
    const num = Number(value)
    if (isNaN(num)) return `$${value}`

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(num)
  }

  // ⏱ Time ago
  const formatTime = (dateString: string) => {
    const diff = Math.floor((now - new Date(dateString).getTime()) / 1000)

    if (diff < 60) return "Just now"
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`
    return new Date(dateString).toLocaleDateString()
  }

  // 🔥 Activity detection
  const getActivityMeta = (content: string) => {
    const text = content.toLowerCase()

    if (text.includes("call")) {
      return {
        icon: "📞",
        label: "Call",
        color: "bg-green-500/20 text-green-300 ring-green-400/30",
        dot: "bg-green-500",
      }
    }

    if (text.includes("email")) {
      return {
        icon: "📧",
        label: "Email",
        color: "bg-purple-500/20 text-purple-300 ring-purple-400/30",
        dot: "bg-purple-500",
      }
    }

    return {
      icon: "📝",
      label: "Note",
      color: "bg-blue-500/20 text-blue-300 ring-blue-400/30",
      dot: "bg-blue-500",
    }
  }

  // 📡 Load data
  const loadDeal = useCallback(async () => {
    const { data } = await supabase
      .from("deals")
      .select("*")
      .eq("id", dealId)
      .single()

    setDeal(data)
  }, [dealId])

  const loadNotes = useCallback(async () => {
    const { data } = await supabase
      .from("notes")
      .select("*")
      .eq("deal_id", dealId)
      .order("created_at", { ascending: false })

    setNotes(data || [])
  }, [dealId])

  const addNote = async () => {
    if (!newNote.trim()) return

    setSaving(true)

    await supabase.from("notes").insert([
      {
        content: newNote,
        deal_id: dealId,
      },
    ])

    setNewNote("")
    await loadNotes()
    setSaving(false)
  }

  useEffect(() => {
    const fetch = async () => {
      await Promise.all([loadDeal(), loadNotes()])
    }
    fetch()
  }, [loadDeal, loadNotes])

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

return (
  <div className="min-h-screen bg-black text-white">
    <div className="mx-auto max-w-6xl p-6 space-y-6">

     {/* 🔥 STICKY PREMIUM HEADER */}
<div className="sticky top-0 z-50 bg-black/80 backdrop-blur border-b border-white/10 mb-6">

  <div className="flex items-center justify-between px-6 py-4">

    {/* LEFT SIDE */}
    <div className="flex items-center gap-4">

      {/* BACK BUTTON */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 transition text-sm"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      {/* DEAL INFO */}
      <div>
        <h1 className="text-xl font-semibold">{deal?.company}</h1>
        <div className="flex items-center gap-2">
          <p className="text-xs text-gray-400">Deal Details • {formatCurrency(deal?.value || 0)}</p>
          {deal?.stage && (
            <span className={`text-xs px-3 py-1 rounded-full border ${stageTone}`}>
              {deal.stage}
            </span>
          )}
        </div>
      </div>

    </div>

    {/* RIGHT SIDE ACTIONS */}
    <div className="flex items-center gap-3">

      <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-medium transition">
        <Pencil size={16} />
        Edit
      </button>

      <button className="flex items-center gap-2 px-4 py-2 bg-red-600/80 hover:bg-red-600 rounded-xl text-sm font-medium transition">
        <Trash2 size={16} />
        Delete
      </button>

    </div>

  </div>

</div> 

        {/* MAIN */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* TIMELINE */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">

            <h2 className="text-2xl font-semibold mb-4">Activity</h2>

            {notes.length === 0 ? (
              <p className="text-gray-400">
                No activity yet. Add your first note.
              </p>
            ) : (
              <div className="space-y-5">
                {notes.map((note) => {
                  const meta = getActivityMeta(note.content)

                  return (
                    <div key={note.id} className="flex gap-4">

                      {/* DOT */}
                      <div className={`w-3 h-3 mt-2 rounded-full ${meta.dot}`} />

                      {/* CARD */}
                      <div className="flex-1 bg-black/30 p-4 rounded-xl border border-white/10">

                        <div className="flex justify-between items-center">

                          <div className="flex items-center gap-2">

                            <div className={`p-2 rounded-lg ${meta.color}`}>
                              {meta.icon}
                            </div>

                            <p className="font-semibold text-white">
                              {meta.label}
                            </p>
                          </div>

                          <span className="text-xs text-gray-400">
                            {formatTime(note.created_at)}
                          </span>
                        </div>

                        <p className="mt-3 text-gray-300">
                          {note.content}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* ADD NOTE */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">

            <h2 className="text-2xl font-semibold mb-4">
              Log Activity
            </h2>

            <textarea
              rows={5}
              className="w-full p-4 bg-black/40 border border-white/10 rounded-xl text-white"
              placeholder="Type call, email, or note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={addNote}
                disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 p-3 rounded-xl"
              >
                {saving ? "Saving..." : "Add Activity"}
              </button>

              <button
                onClick={generateAIInsight}
                disabled={loadingAI}
                className="flex-1 bg-purple-600 hover:bg-purple-700 p-3 rounded-xl"
              >
                {loadingAI ? "Generating..." : "Get AI Insight"}
              </button>
            </div>

           {aiInsight && (
  <div className="mt-4 space-y-4">

    {/* SCORE */}
    <div className="flex items-center justify-between p-4 rounded-xl bg-green-500/10 border border-green-500/20">
      <span className="text-sm text-green-300">Deal Score</span>
      <span className="text-lg font-bold text-green-400">{score}%</span>
    </div>

    {/* NEXT ACTION */}
    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
      <h3 className="text-sm text-blue-300 mb-1">📌 Next Action</h3>
      <p className="text-sm text-gray-200">{action}</p>
    </div>

    {/* INSIGHT */}
    <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
      <h3 className="text-sm text-purple-300 mb-1">🧠 Insight</h3>
      <p className="text-sm text-gray-200">{insight}</p>
    </div>

  </div>
)}
          </div>

        {/* CHAT */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold mb-4">Chat Assistant</h2>

          <div className="flex flex-col h-96">

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">

              {messages.length === 0 && (
                <p className="text-white/40 text-sm">Ask anything about this deal...</p>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`max-w-[75%] p-3 rounded-xl text-sm ${
                    msg.role === "user"
                      ? "ml-auto bg-blue-600 text-white"
                      : "bg-white/10 text-white"
                  }`}
                >
                  {msg.content}
                </div>
              ))}

              {chatLoading && (
                <div className="bg-white/10 text-white p-3 rounded-xl text-sm w-fit">
                  Thinking...
                </div>
              )}

            </div>

            {/* INPUT */}
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Ask about the deal..."
                className="flex-1 p-3 bg-black/40 border border-white/20 rounded-xl text-white"
              />

              <button
                onClick={sendMessage}
                className="bg-blue-600 hover:bg-blue-700 px-4 rounded-xl"
              >
                Send
              </button>
            </div>

          </div>
        </div>
      </div>

    </div>
  </div>
)
}