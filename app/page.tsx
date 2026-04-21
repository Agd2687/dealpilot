"use client"

import Link from "next/link"
import { useLanguage } from "@/app/context/LanguageContext"
import { translations } from "@/lib/translations"

export default function HomePage() {
  const { lang } = useLanguage()
  const t = translations[lang]

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="max-w-2xl text-center space-y-6">

        {/* Title */}
        <h1 className="text-4xl font-bold">
          {t.welcome}
        </h1>

        {/* Subtitle */}
        <p className="text-white/60">
          Smart CRM for modern sales teams.
        </p>

        {/* CTA */}
        <Link
          href="/dashboard"
          className="inline-block mt-4 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition"
        >
          {t.getStarted}
        </Link>

      </div>
    </div>
  )
}
