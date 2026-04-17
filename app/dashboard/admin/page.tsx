"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

interface Deal {
  id: string
  company: string
  value: number
  stage: string
}

export default function Page() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    const fetchDeals = async () => {
      const { data } = await supabase.from("deals").select("*")
      setDeals(data || [])
      setLoading(false)
    }
    fetchDeals()
  }, [])

  const totalRevenue = deals.reduce((sum, deal) => {
  const cleanValue = String(deal.value || "0")
    .replace(/[^0-9.]/g, "") // remove $, commas, etc

  return sum + parseFloat(cleanValue || "0")
}, 0)

  return (
    <div className="p-6 text-white space-y-6">

      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
  Admin Dashboard
</h1>
        <p className="text-gray-400 mt-1">
          Overview of your CRM performance
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#111] p-4 rounded-xl border border-gray-800">
          <p className="text-gray-400 text-sm">Total Deals</p>
          <h2 className="text-2xl font-bold">{deals.length}</h2>
        </div>

        <div className="bg-[#111] p-4 rounded-xl border border-gray-800">
          <p className="text-gray-400 text-sm">Revenue</p>
          <h2 className="text-2xl font-bold text-green-400">
          ${totalRevenue.toLocaleString()}
          </h2>
        </div>

        <div className="bg-[#111] p-4 rounded-xl border border-gray-800">
          <p className="text-gray-400 text-sm">Pipeline</p>
          <h2 className="text-2xl font-bold text-purple-400">
            {deals.filter(d => d.stage !== "closed").length}
          </h2>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Recent Deals</h2>

        {loading ? (
          <p>Loading...</p>
        ) : (
          deals.map((deal) => (
            <div
              key={deal.id}
              className="bg-[#111] p-4 rounded-xl border border-gray-800 flex justify-between"
            >
              <div>
                <p className="font-semibold">{deal.company}</p>
                <p className="text-sm text-gray-400">{deal.stage}</p>
              </div>

              <p className="text-green-400 font-bold">
                ${deal.value}
              </p>
            </div>
          ))
        )}
      </div>

    </div>
  )
}
