"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Briefcase,
  Users,
  CheckSquare,
  Settings,
} from "lucide-react"

import { useLanguage } from "@/app/context/LanguageContext"
import { translations } from "@/lib/translations"

type Lang = "en" | "fr" | "es"

export default function Sidebar() {
  const pathname = usePathname()

  // ✅ SAFE TYPE
  const { lang } = useLanguage()
  const t = translations[lang as Lang]

  // ✅ NAV ITEMS (clean + stable)
  const navItems = [
    { name: t.dashboard, href: "/dashboard", icon: LayoutDashboard },
    { name: t.deals, href: "/dashboard/deals", icon: Briefcase },
    { name: t.leads, href: "/dashboard/leads", icon: Users },
    { name: t.tasks, href: "/dashboard/tasks", icon: CheckSquare },
    { name: t.settings, href: "/dashboard/settings", icon: Settings },
  ]

  return (
    <aside className="w-64 bg-zinc-900 border-r border-white/10 px-6 py-6 flex flex-col">
      
      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-lg font-semibold text-white">DealPilot</h1>
        <p className="text-xs text-white/40">CRM Dashboard</p>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                active
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
