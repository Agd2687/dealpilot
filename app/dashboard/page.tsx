"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useLanguage } from "@/app/context/LanguageContext"
import { translations } from "@/lib/translations"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts"

type Deal = {
  id: string
  company: string
  value: number | string | null
  stage: string
  created_at?: string
}

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#ef4444", "#06b6d4"]

const COLOR_CLASSES = [
  "bg-[#3b82f6]",
  "bg-[#22c55e]",
  "bg-[#f59e0b]",
  "bg-[#a855f7]",
  "bg-[#ef4444]",
  "bg-[#06b6d4]",
]

const STAGES = [
  "Prospect",
  "Qualified",
  "Proposal",
  "Negotiation",
  "Closed Won",
  "Closed Lost",
]

  export default function DashboardPage() {

  // 🌍 LANGUAGE (ADD THIS)
  const { lang } = useLanguage()
  const t = translations[lang]

  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  async function loadDeals() {
    const { data, error } = await supabase
      .from("deals")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error loading deals:", error)
      return []
    }

    return data || []
  }

  useEffect(() => {
    loadDeals().then((data) => {
      setDeals(data)
      setLoading(false)
    })
  }, [])

  function toSafeNumber(value: number | string | null | undefined) {
    if (value === null || value === undefined) return 0
    const cleaned = String(value).replace(/[$,]/g, "").trim()
    const num = Number(cleaned)
    return Number.isNaN(num) ? 0 : num
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value)
  }

  const normalizedDeals = useMemo(() => {
    return deals.map((deal) => ({
      ...deal,
      safeValue: toSafeNumber(deal.value),
      safeStage: deal.stage?.trim() || "",
    }))
  }, [deals])

  const revenueByStage = useMemo(() => {
    return STAGES.map((stage) => ({
      name: stage,
      value: normalizedDeals
        .filter(
          (deal) =>
            deal.safeStage.toLowerCase() === stage.toLowerCase()
        )
        .reduce((sum, deal) => sum + deal.safeValue, 0),
    }))
  }, [normalizedDeals])

  const dealsByStage = useMemo(() => {
    return STAGES.map((stage) => ({
      name: stage,
      value: normalizedDeals.filter(
        (deal) =>
          deal.safeStage.toLowerCase() === stage.toLowerCase()
      ).length,
    }))
  }, [normalizedDeals])

  const totalDeals = normalizedDeals.length

  const wonDeals = normalizedDeals.filter(
    (deal) => deal.safeStage.toLowerCase() === "closed won"
  )

  const lostDeals = normalizedDeals.filter(
    (deal) => deal.safeStage.toLowerCase() === "closed lost"
  )

  const activeDeals = normalizedDeals.filter(
    (deal) =>
      deal.safeStage.toLowerCase() !== "closed won" &&
      deal.safeStage.toLowerCase() !== "closed lost"
  )

  const totalRevenueWon = wonDeals.reduce((sum, deal) => sum + deal.safeValue, 0)

  const openPipelineValue = activeDeals.reduce(
    (sum, deal) => sum + deal.safeValue,
    0
  )

  const winRate =
    wonDeals.length + lostDeals.length === 0
      ? 0
      : Math.round((wonDeals.length / (wonDeals.length + lostDeals.length)) * 100)

  const averageDealSize =
    totalDeals === 0
      ? 0
      : Math.round(
          normalizedDeals.reduce((sum, deal) => sum + deal.safeValue, 0) / totalDeals
        )

  const highestDeal = useMemo(() => {
    if (!normalizedDeals.length) return null
    return [...normalizedDeals].sort((a, b) => b.safeValue - a.safeValue)[0]
  }, [normalizedDeals])

  const strongestStage = useMemo(() => {
    if (!dealsByStage.length) return null
    return [...dealsByStage].sort((a, b) => b.value - a.value)[0]
  }, [dealsByStage])

  const forecastRevenue = Math.round(openPipelineValue * 0.35)

  const notifications = [
    activeDeals.length > 0
      ? `${activeDeals.length} active deal${activeDeals.length === 1 ? "" : "s"} need attention`
      : "No active deals right now",
    highestDeal
      ? `Highest-value deal is ${highestDeal.company} at ${formatCurrency(
          highestDeal.safeValue
        )}`
      : "No highest-value deal yet",
    winRate < 30
      ? "Win rate is low — focus on closing qualified opportunities"
      : "Win rate is improving",
  ]

  const insights = [
    `Open pipeline value is ${formatCurrency(openPipelineValue)}.`,
    highestDeal
      ? `${highestDeal.company} is currently your top-value opportunity.`
      : "Add more deals to unlock deeper insights.",
    strongestStage && strongestStage.value > 0
      ? `${strongestStage.name} is your most active stage right now.`
      : "No strong stage trend yet.",
  ]

  const recentActivity = normalizedDeals.slice(0, 5)

  if (loading) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-white/10 bg-slate-900 p-6 text-white">
          Loading dashboard...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
         <h1 className="text-3xl font-bold">
  {t.dashboardTitle || "Executive Dashboard"}
</h1>
          <p className="mt-1 text-sm text-slate-400">
  {t.dashboardDesc || "Premium sales overview with insights, forecasting, and activity."}
</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/deals/new"
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
          >
            + New Deal
          </Link>
          <Link
            href="/dashboard/deals"
            className="rounded-xl border border-white/10 bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:border-white/20 hover:bg-slate-800"
          >
            Open Pipeline
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4 md:grid-cols-2">
        <StatCard
          title="Total Deals"
          value={totalDeals}
          subtitle={`${activeDeals.length} active now`}
        />
        <StatCard
          title="Revenue Won"
          value={formatCurrency(totalRevenueWon)}
          subtitle={`${wonDeals.length} won deal${wonDeals.length === 1 ? "" : "s"}`}
        />
        <StatCard
          title="Open Pipeline"
          value={formatCurrency(openPipelineValue)}
          subtitle="Expected future revenue"
        />
        <StatCard
          title="Win Rate"
          value={`${winRate}%`}
          subtitle="Closed-won vs closed-lost"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-3xl border border-white/10 bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 p-6 shadow-2xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">AI Insights</h2>
              <p className="mt-1 text-sm text-slate-300">
                Smart summaries based on your current deal pipeline.
              </p>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
              Live
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {insights.map((insight, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200 backdrop-blur-sm"
              >
                {index === 0 && <div className="mb-2 text-lg">💡</div>}
                {index === 1 && <div className="mb-2 text-lg">💰</div>}
                {index === 2 && <div className="mb-2 text-lg">🚀</div>}
                <p>{insight}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-white">Forecast</h2>
          <p className="mt-1 text-sm text-slate-400">
            Estimated close value from current active deals.
          </p>

          <div className="mt-6 rounded-2xl bg-slate-800/70 p-5">
            <p className="text-sm text-slate-400">Projected Revenue</p>
            <h3 className="mt-2 text-3xl font-bold text-white">
              {formatCurrency(forecastRevenue)}
            </h3>
            <p className="mt-2 text-xs text-emerald-400">
              Based on a 35% conversion assumption
            </p>
          </div>

          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <div className="flex items-center justify-between">
              <span>Average Deal Size</span>
              <span className="font-medium text-white">
                {formatCurrency(averageDealSize)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Top Opportunity</span>
              <span className="font-medium text-white">
                {highestDeal ? highestDeal.company : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-xl">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-white">Revenue by Stage</h2>
            <p className="mt-1 text-sm text-slate-400">
              See where your pipeline value is concentrated.
            </p>
          </div>

          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={revenueByStage}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value || 0))}
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "14px",
                  color: "#fff",
                }}
              />
              <Bar dataKey="value" radius={[10, 10, 0, 0]} animationDuration={900}>
                {revenueByStage.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-xl">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-white">Deals Distribution</h2>
            <p className="mt-1 text-sm text-slate-400">
              Breakdown of deal count across each stage.
            </p>
          </div>

          <ResponsiveContainer width="100%" height={340}>
            <PieChart>
              <Pie
                data={dealsByStage}
                dataKey="value"
                nameKey="name"
                outerRadius={110}
                innerRadius={55}
                paddingAngle={3}
              >
                {dealsByStage.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatCurrency(Number(value || 0))}
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "14px",
                  color: "#fff",
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-300 md:grid-cols-3">
            {dealsByStage.map((item, index) => (
              <div
                key={item.name}
                className="flex items-center gap-2 rounded-xl bg-slate-800/60 px-3 py-2"
              >
                <div
                  className={`inline-block h-3 w-3 rounded-full ${COLOR_CLASSES[index % COLOR_CLASSES.length]}`}
                />
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-xl xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
              <p className="mt-1 text-sm text-slate-400">
                Latest deal movement and pipeline updates.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <div className="rounded-2xl bg-slate-800/60 p-4 text-sm text-slate-400">
                No activity yet.
              </div>
            ) : (
              recentActivity.map((deal, index) => (
                <div
                  key={deal.id}
                  className="flex items-start gap-4 rounded-2xl bg-slate-800/60 p-4"
                >
                  <div className="mt-1 h-3 w-3 rounded-full bg-emerald-400" />
                  <div className="flex-1">
                    <p className="font-medium text-white">
                      {deal.company} moved to {deal.safeStage}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      Deal value: {formatCurrency(deal.safeValue)}
                    </p>
                  </div>
                  <div className="text-xs text-slate-500">
                    #{index + 1}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-white">Notifications</h2>
          <p className="mt-1 text-sm text-slate-400">
            Important updates for your workspace.
          </p>

          <div className="mt-4 space-y-3">
            {notifications.map((note, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/10 bg-slate-800/60 p-4 text-sm text-slate-200"
              >
                <div className="mb-2 text-base">
                  {index === 0 ? "🔔" : index === 1 ? "📌" : "⚠️"}
                </div>
                {note}
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4">
            <p className="text-sm text-white/90">Quick Actions</p>
            <div className="mt-3 flex flex-col gap-2">
              <Link
                href="/dashboard/deals/new"
                className="rounded-xl bg-white/10 px-3 py-2 text-sm text-white transition hover:bg-white/20"
              >
                Create Deal
              </Link>
              <Link
                href="/dashboard/deals"
                className="rounded-xl bg-white/10 px-3 py-2 text-sm text-white transition hover:bg-white/20"
              >
                Manage Pipeline
              </Link>
              <Link
                href="/dashboard/leads"
                className="rounded-xl bg-white/10 px-3 py-2 text-sm text-white transition hover:bg-white/20"
              >
                View Leads
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string
  value: string | number
  subtitle: string
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900 p-5 shadow-md transition hover:-translate-y-1 hover:shadow-blue-500/10">
      <p className="text-sm text-slate-400">{title}</p>
      <h3 className="mt-2 text-3xl font-bold text-white">{value}</h3>
      <p className="mt-2 text-xs text-emerald-400">{subtitle}</p>
    </div>
  )
}
