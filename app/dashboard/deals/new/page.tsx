"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function NewDealPage() {

  const router = useRouter()

  const [company, setCompany] = useState("")
  const [value, setValue] = useState("")
  const [loading, setLoading] = useState(false)

async function createDeal(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault()

  setLoading(true)

  // ✅ Get logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    alert("Not logged in")
    return
  }

  const { error } = await supabase.from("deals").insert([
    {
      company,
      value,
      stage: "Prospects",
      user_id: user.id,
    },
  ])

  setLoading(false)

  if (error) {
    alert(error.message)
    return
  }

  router.push("/dashboard/deals")
  router.refresh()
}

  return (
    <div className="max-w-xl space-y-6">

      <h1 className="text-2xl font-semibold">
        Create New Deal
      </h1>

      <form onSubmit={createDeal} className="space-y-4">

        <input
          placeholder="Company name"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="w-full bg-black border border-white/10 p-3 rounded-lg"
          required
        />

        <input
          placeholder="Deal value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full bg-black border border-white/10 p-3 rounded-lg"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 px-4 py-2 rounded-lg"
        >
          {loading ? "Creating..." : "Create Deal"}
        </button>

      </form>

    </div>
  )
}
