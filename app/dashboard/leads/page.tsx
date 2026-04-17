"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function NewLeadPage() {
  const router = useRouter()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [status, setStatus] = useState("new")
  const [loading, setLoading] = useState(false)

  const createLead = async () => {
    if (!name || !email) {
      alert("Name and Email are required")
      return
    }

    setLoading(true)

    const { error } = await supabase.from("leads").insert([
      { name, email, phone, status },
    ])

    setLoading(false)

    if (!error) {
      router.push("/dashboard/leads")
    } else {
      alert("Error creating lead")
    }
  }

  return (
    <div className="p-6 flex justify-center items-start">

      {/* 🌌 BLUE GRADIENT CARD */}
      <div className="w-full max-w-xl rounded-2xl p-6 space-y-6
        bg-gradient-to-br from-blue-900/40 via-blue-800/30 to-purple-900/30
        border border-blue-500/20 shadow-xl backdrop-blur">

        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-semibold text-white">
            New Lead
          </h1>
          <p className="text-sm text-blue-200/70">
            Add a new potential customer to your pipeline
          </p>
        </div>

        {/* FORM */}
        <div className="space-y-4">

          {/* NAME */}
          <div>
            <label className="text-sm text-blue-200/80">
              Full Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="mt-1 w-full bg-black/40 border border-blue-500/20 px-4 py-2 rounded-lg outline-none text-white focus:border-blue-400"
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-sm text-blue-200/80">
              Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@email.com"
              className="mt-1 w-full bg-black/40 border border-blue-500/20 px-4 py-2 rounded-lg outline-none text-white focus:border-blue-400"
            />
          </div>

          {/* PHONE */}
          <div>
            <label className="text-sm text-blue-200/80">
              Phone
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 123-4567"
              className="mt-1 w-full bg-black/40 border border-blue-500/20 px-4 py-2 rounded-lg outline-none text-white focus:border-blue-400"
            />
          </div>

          {/* STATUS */}
          <div>
            <label className="text-sm text-blue-200/80">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              aria-label="Lead Status"
              className="mt-1 w-full bg-black/40 border border-blue-500/20 px-4 py-2 rounded-lg text-white focus:border-blue-400"
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="lost">Lost</option>
            </select>
          </div>

        </div>

        {/* ACTIONS */}
        <div className="flex gap-3 pt-4">

          <button
            onClick={() => router.push("/dashboard/leads")}
            className="flex-1 border border-blue-500/20 py-2 rounded-lg text-blue-200 hover:bg-blue-500/10 transition"
          >
            Cancel
          </button>

          <button
            onClick={createLead}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 py-2 rounded-lg font-medium text-white hover:opacity-90 transition shadow-lg"
          >
            {loading ? "Creating..." : "Create Lead"}
          </button>

        </div>

      </div>
    </div>
  )
}
