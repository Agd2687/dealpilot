"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { translations } from "@/lib/translations"
import { useRouter } from "next/navigation"
type Deal = {
  id: string
  company: string
  value: string | number | null
  stage: string
}

type InsightItem = {
  type: "warning" | "success" | "info"
  message: string
}

export default function DealsClient() {
  const router = useRouter()

  const [lang, setLang] = useState<"en" | "fr" | "es">("en")
  useEffect(() => {
  const savedLang = localStorage.getItem("lang")

  if (savedLang === "en" || savedLang === "fr" || savedLang === "es") {
    setLang(savedLang)
  }
}, [])

  const t = translations[lang]

  const [deals, setDeals] = useState<Deal[]>([])
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [aiInsights, setAiInsights] = useState<{ [key: string]: string }>({})
  const [typedInsights, setTypedInsights] = useState<{ [key: string]: string }>({})
  const [selectedAI, setSelectedAI] = useState<string | null>(null)

  // ✅ FIXED STAGES (OBJECT BASED)
  const stages = [
    { key: "prospects", title: "Prospect" },
    { key: "qualified", title: "Qualified" },
    { key: "proposal", title: "Proposal" },
    { key: "negotiation", title: "Negotiation" },
    { key: "closed won", title: "Closed Won" },
    { key: "closed lost", title: "Closed Lost" },
  ]

  // 🔥 TYPEWRITER
  const typeText = (text: string, dealId: string) => {
    let index = 0
    const interval = setInterval(() => {
      setTypedInsights((prev) => ({
        ...prev,
        [dealId]: text.slice(0, index + 1),
      }))
      index++
      if (index >= text.length) clearInterval(interval)
    }, 15)
  }

  async function loadDeals() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from("deals")
      .select("*")
      .eq("user_id", user.id)

    setDeals(data || [])
  }

  useEffect(() => {
    loadDeals()
  }, [])

  async function onDragEnd(result: DropResult) {
    if (!result.destination) return

    const dealId = result.draggableId
    const newStage = result.destination.droppableId

    await supabase
      .from("deals")
      .update({ stage: newStage })
      .eq("id", dealId)

    loadDeals()
  }

  async function deleteDeal(id: string) {
    if (!confirm("Delete this deal?")) return
    await supabase.from("deals").delete().eq("id", id)
    loadDeals()
  }

  const toSafeNumber = (v: string | number | null) => Number(v || 0)

  const formatCurrency = useCallback((v: string | number | null) => {
    return toSafeNumber(v).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    })
  }, [])

  // 📊 METRICS
  const totalDeals = deals.length

  const closedDeals = deals.filter(
    (d) => d.stage?.toLowerCase().trim() === "closed won"
  )

  const totalRevenue = closedDeals.reduce(
    (sum, d) => sum + toSafeNumber(d.value),
    0
  )

  const winRate =
    totalDeals === 0 ? 0 : Math.round((closedDeals.length / totalDeals) * 100)

  // 🧠 AI
  const insights = useMemo<InsightItem[]>(() => {
    const items: InsightItem[] = []

    if (winRate < 30)
      items.push({ type: "warning", message: "Low win rate — close deals faster." })

    if (closedDeals.length > 0)
      items.push({ type: "success", message: "You’re closing deals — keep going." })

    return items
  }, [winRate, closedDeals])

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t.deals} {t.pipeline}</h1>

        <Link
          href="/dashboard/deals/new"
          className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-xl"
        >
          + {t.newDeal}
        </Link>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-4 gap-4">
        <Card title={t.deals} value={totalDeals} />
        <Card title={t.revenue} value={formatCurrency(Number(totalRevenue || 0))} />
        <Card title={t.closed} value={closedDeals.length} />
        <Card title={t.winRate} value={`${winRate}%`} />
      </div>

      {/* AI */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-white/10 p-6 rounded-2xl shadow-xl">
        <h2 className="text-lg mb-3">🧠 AI Assistant</h2>

        {insights.map((i, idx) => (
          <div key={idx} className="bg-white/5 p-3 rounded-lg mb-2 border border-white/10">
            {i.message}
          </div>
        ))}
      </div>

      {/* PIPELINE */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 scroll-smooth">

          {stages.map((stage) => {

            // ✅ FIXED FILTER
            const stageDeals = deals.filter(
              (d) =>
                d.stage?.toLowerCase().trim() ===
                stage.key.toLowerCase().trim()
            )

            return (
              <Droppable key={stage.key} droppableId={stage.key}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="min-w-[260px] bg-gradient-to-b from-slate-900 to-slate-800 border border-white/10 rounded-2xl p-4"
                  >
                    <h2 className="mb-3 font-semibold">{stage.title}</h2>

                    {/* ✅ FIXED GRID WRAP */}
                    <div className="grid grid-cols-1 gap-3">

                      {stageDeals.map((deal, index) => (
                        <Draggable key={deal.id} draggableId={deal.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => router.push(`/dashboard/deals/${deal.id}`)}
                              className="
bg-white/5 hover:bg-white/10 
p-4 rounded-xl border border-white/10 
flex flex-col gap-3 
w-full max-w-full 
min-h-[140px]
overflow-hidden
"
                              >

                              <h3 className="font-semibold">{deal.company}</h3>

                              <p className="text-white font-semibold text-sm truncate">
                              {formatCurrency(deal.value)}
                              </p>

                              {/* AI */}
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation()
                                  setLoadingId(deal.id)

                                  const res = await fetch("/api/ai", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ deals: [deal] }),
                                  })

                                  const data = await res.json()

                                  setAiInsights((prev) => ({
                                    ...prev,
                                    [deal.id]: data.result,
                                  }))

                                  typeText(data.result, deal.id)
                                  setLoadingId(null)
                                }}
                                className="mt-2 w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-xs py-1 rounded-lg"
                              >
                                {loadingId === deal.id ? "Thinking..." : "✨ AI Action"}
                              </button>

                             {aiInsights[deal.id] && (
  <div
    onClick={(e) => {
      e.stopPropagation()
      setSelectedAI(deal.id)
    }}
    className="mt-2 bg-black/30 border border-white/10 rounded-lg p-2 
    text-xs text-gray-300 max-h-[60px] overflow-hidden cursor-pointer hover:bg-black/50"
  >
    <p className="line-clamp-2">
      {typedInsights[deal.id] || aiInsights[deal.id]}
    </p>
  </div>
)}

                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteDeal(deal.id)
                                }}
                                className="text-xs text-red-400 mt-2"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </Draggable>
                      ))}

                    </div>

                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            )
          })}
        </div>
      </DragDropContext>

      {/* AI INSIGHT MODAL */}
      {selectedAI && aiInsights[selectedAI] && (
        <div
          onClick={() => setSelectedAI(null)}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md max-h-[80vh] overflow-y-auto"
          >
            <h3 className="text-lg font-semibold mb-3">AI Insight</h3>
            <p className="text-gray-300 text-sm whitespace-pre-wrap">{aiInsights[selectedAI]}</p>
            <button
              onClick={() => setSelectedAI(null)}
              className="mt-4 w-full bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Card({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-slate-900 p-4 rounded-xl border border-white/10">
      <p className="text-sm text-gray-400">{title}</p>
      <h2 className="text-xl font-bold">{value}</h2>
    </div>
  )
}
