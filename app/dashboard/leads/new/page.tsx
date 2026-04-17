"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function NewLeadPage() {
  const router = useRouter()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)

  const handleCreate = async () => {
    if (!name) {
      alert("Name is required")
      return
    }

    setLoading(true)

    const { error } = await supabase.from("leads").insert([
      { name, email, phone }
    ])

    setLoading(false)

    if (error) {
      alert("Error creating lead")
      return
    }

    router.push("/dashboard/leads")
  }

  return (
    <div className="p-6 text-white">

      {/* 🔙 BACK BUTTON */}
      <button
        onClick={() => router.push("/dashboard/leads")}
        className="mb-6 px-3 py-1 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition text-sm"
      >
        ← Back to Leads
      </button>

      {/* 💎 FORM */}
      <div className="max-w-xl mx-auto bg-black border border-white/10 rounded-xl p-6">

        <h1 className="text-2xl font-bold mb-2">New Lead</h1>
        <p className="text-white/60 mb-6">
          Add a new potential customer
        </p>

        <input
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mb-3 p-2 rounded-lg bg-black border border-white/10"
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 p-2 rounded-lg bg-black border border-white/10"
        />

        <input
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full mb-6 p-2 rounded-lg bg-black border border-white/10"
        />

        <div className="flex gap-3">
          <button
            onClick={() => router.push("/dashboard/leads")}
            className="flex-1 border border-white/10 py-2 rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={handleCreate}
            className="flex-1 bg-blue-600 py-2 rounded-lg"
          >
            {loading ? "Creating..." : "Create Lead"}
          </button>
        </div>
      </div>
    </div>
  )
}