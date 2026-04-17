"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"

type Lead = {
  id: string
  name: string
  email: string
  phone: string
}

export default function LeadDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [lead, setLead] = useState<Lead | null>(null)

  useEffect(() => {
    const loadLead = async () => {
      const { data } = await supabase
        .from("leads")
        .select("*")
        .eq("id", id)
        .single()

      if (data) setLead(data)
    }

    loadLead()
  }, [id])

  // 🤖 AI SCORE
  const getScore = () => {
    if (!lead) return "Cold"
    if (lead.email && lead.phone) return "Hot"
    if (lead.email || lead.phone) return "Warm"
    return "Cold"
  }

  // 🧠 AI INSIGHTS
  const getInsights = () => {
    if (!lead) return ""

    if (lead.email && lead.phone) {
      return "This lead has strong contact data. High likelihood to convert."
    }

    if (lead.email || lead.phone) {
      return "Partial contact info available. Recommend follow-up."
    }

    return "Limited data. Needs qualification before outreach."
  }

  const getAction = () => {
    if (!lead) return ""

    if (lead.email && lead.phone) return "Call immediately and send follow-up email."
    if (lead.email) return "Send personalized email outreach."
    if (lead.phone) return "Call and gather more information."
    return "Collect contact details before outreach."
  }

  if (!lead) return <div className="p-6 text-white">Loading...</div>

  return (
    <div className="p-6 text-white">

      {/* 🔙 BACK */}
      <button
        onClick={() => router.push("/dashboard/leads")}
        className="mb-6 px-3 py-1 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition"
      >
        ← Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* 💎 LEFT SIDE (LEAD INFO) */}
        <div className="md:col-span-2 bg-black border border-white/10 p-6 rounded-xl">
          <h1 className="text-2xl font-bold mb-4">{lead.name}</h1>

          <p className="mb-2 text-white/60">Email: {lead.email || "-"}</p>
          <p className="mb-4 text-white/60">Phone: {lead.phone || "-"}</p>

          <div className="mt-4 text-sm text-white/40">
            Lead ID: {lead.id}
          </div>
        </div>

        {/* 🤖 RIGHT SIDE (AI PANEL) */}
        <div className="bg-black border border-white/10 p-6 rounded-xl">

          <h2 className="text-lg font-semibold mb-4">AI Insights</h2>

          {/* SCORE */}
          <div className="mb-4">
            <p className="text-white/60 text-sm mb-1">Lead Score</p>
            <div className="px-3 py-1 inline-block rounded-full bg-blue-500/20 text-blue-400 text-sm">
              {getScore()}
            </div>
          </div>

          {/* INSIGHT */}
          <div className="mb-4">
            <p className="text-white/60 text-sm mb-1">Insight</p>
            <p className="text-sm">{getInsights()}</p>
          </div>

          {/* ACTION */}
          <div>
            <p className="text-white/60 text-sm mb-1">Next Action</p>
            <p className="text-sm">{getAction()}</p>
          </div>

        </div>
      </div>
    </div>
  )
}
