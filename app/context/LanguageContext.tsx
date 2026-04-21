"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type Lang = "en" | "fr" | "es"

type LanguageContextType = {
  lang: Lang
  setLang: (lang: Lang) => void
}

const LanguageContext = createContext<LanguageContextType | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en")

  // ✅ Update HTML lang
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  // ✅ LOAD language from Supabase
  useEffect(() => {
    const loadLanguage = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      const { data } = await supabase
        .from("profiles")
        .select("language")
        .eq("id", user.id)
        .single()

      if (data?.language) {
        setLangState(data.language)
      }
    }

    loadLanguage()
  }, [])

  // ✅ SAVE language to Supabase
  const setLang = async (newLang: Lang) => {
    setLangState(newLang)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    await supabase
      .from("profiles")
      .update({ language: newLang })
      .eq("id", user.id)
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

// ✅ Hook
export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider")
  return context
}
