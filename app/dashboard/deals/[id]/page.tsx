"use client"

import { supabase } from "@/lib/supabase"
import { ArrowLeft, Pencil, Sparkles, Trash2 } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

type Deal = {
  id: string
  company: string
  value: number
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
  const [aiInsight, setAiInsight] = useState<any>(null)
  const [loadingAI, setLoadingAI] = useState(false)
  const [newNote, setNewNote] = useState("")

  // ✅ NEW STATES (FIXED)
  const [file, setFile] = useState<File | null>(null)
  const [score, setScore] = useState<number | null>(null)

  // 🔥 LOAD DEAL
  const loadDeal = async () => {
    const { data } = await supabase
      .from("deals")
      .select("*")
      .eq("id", dealId)
      .single()

    setDeal(data)
  }

  // 🔥 LOAD NOTES
  const loadNotes = async () => {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("deal_id", dealId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Notes error:", error)
      setNotes([])
      return
    }

    setNotes((data as Note[]) ?? [])
  }

  useEffect(() => {
    loadDeal()
    loadNotes()
  }, [dealId])

  // 🔥 ADD NOTE
  const addNote = async () => {
    if (!newNote) return

    await supabase.from("notes").insert({
      content: newNote,
      deal_id: dealId,
    })

    setNewNote("")
    loadNotes()
  }

  // 🔥 AI ANALYZE
  const analyzeDocument = async () => {
    try {
      setLoadingAI(true)

      // ✅ Prevent null deal crash
      if (!deal) {
        console.error("No deal loaded")
        return
      }

      const formData = new FormData()
      formData.append("deal", JSON.stringify(deal))

      // ✅ optional file
      if (file) {
        formData.append("file", file)
      }

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      })

      // ✅ handle bad response
      if (!res.ok) {
        const errText = await res.text()
        console.error("API ERROR:", errText)
        return
      }

      const data = await res.json()

      // ✅ prevent undefined crash
      setAiInsight(data || null)
      setScore(data?.score ?? null)

    } catch (err) {
      console.error("AI ERROR:", err)
    } finally {
      setLoadingAI(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* 🔥 HEADER */}
        <div className="flex justify-between items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">

          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-xl"
            >
              <ArrowLeft size={16} />
            </button>

            <div>
              <h1 className="text-xl font-semibold">{deal?.company}</h1>
              <p className="text-gray-400 text-sm">
                ${deal?.value} • {deal?.stage}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button className="px-4 py-2 bg-blue-600 rounded-xl hover:bg-blue-700 flex items-center gap-2">
              <Pencil size={16} /> Edit
            </button>

            <button className="px-4 py-2 bg-red-600 rounded-xl hover:bg-red-700 flex items-center gap-2">
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </div>

        {/* 🔥 AI ACTION */}
        <div className="flex gap-3 items-center">
          <button
            onClick={analyzeDocument}
            disabled={loadingAI}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl"
          >
            <Sparkles size={16} />
            {loadingAI ? "Analyzing..." : "Analyze Deal"}
          </button>

          {score && (
            <div className="px-4 py-2 bg-green-600 rounded-xl">
              Score: {score}/100
            </div>
          )}
        </div>

        {/* 📂 FILE UPLOAD */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Upload Deal File (PDF)
          </label>

          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-white bg-black/40 border border-white/20 rounded-lg p-2"
          />
        </div>

        {/* 🤖 AI RESULT */}
        {aiInsight && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl space-y-4">

            <h2 className="text-lg font-semibold">AI Insight</h2>

            <div>
              <p className="text-gray-400">Summary</p>
              <p>{aiInsight.summary}</p>
            </div>

            <div>
              <p className="text-gray-400">Risks</p>
              <p>{aiInsight.risks}</p>
            </div>

            <div>
              <p className="text-gray-400">Suggestions</p>
              <p>{aiInsight.suggestions}</p>
            </div>

          </div>
        )}

        {/* 🔥 MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* NOTES */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl space-y-4">
            <h2 className="text-lg font-semibold">Activity</h2>

            {notes.map((note) => (
              <div key={note.id} className="bg-white/5 p-3 rounded-xl">
                <p>{note.content}</p>
              </div>
            ))}
          </div>

          {/* ADD NOTE */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl space-y-4">
            <h2 className="text-lg font-semibold">Add Note</h2>

            <input
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="w-full p-3 rounded-xl bg-black/40 border border-white/20"
              placeholder="Write something..."
            />

            <button
              onClick={addNote}
              className="w-full py-3 bg-blue-600 rounded-xl hover:bg-blue-700"
            >
              Save Note
            </button>
          </div>

        </div>

      </div>
    </div>
  )
}
