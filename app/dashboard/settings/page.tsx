"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { useLanguage } from "@/app/context/LanguageContext"
import { translations } from "@/lib/translations"

type Lang = "en" | "fr" | "es"

type ProfileRow = {
  id: string
  full_name: string | null
  company_name: string | null
  job_title: string | null
  avatar_url: string | null
}

export default function SettingsPage() {
  const router = useRouter()
  const { lang, setLang } = useLanguage()
  const t = translations[lang as keyof typeof translations] ?? translations.en

  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)

  const [userId, setUserId] = useState("")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [company, setCompany] = useState("")
  const [jobTitle, setJobTitle] = useState("")
  const [avatarPath, setAvatarPath] = useState<string | null>(null)

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const avatarSrc = useMemo(() => {
    if (!avatarPath) return "/default-avatar.png"

    if (avatarPath.startsWith("http://") || avatarPath.startsWith("https://")) {
      return avatarPath
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(avatarPath)
    return data.publicUrl
  }, [avatarPath])

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      setUserId(user.id)
      setEmail(user.email ?? "")

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, company_name, job_title, avatar_url")
        .eq("id", user.id)
        .single()

      if (!error && data) {
        const profile = data as ProfileRow
        setFullName(profile.full_name ?? "")
        setCompany(profile.company_name ?? "")
        setJobTitle(profile.job_title ?? "")
        setAvatarPath(profile.avatar_url ?? null)
      }

      setLoading(false)
    }

    loadUser()
  }, [router])

  const handleSaveProfile = async () => {
    if (!userId) return
    setSavingProfile(true)

    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      full_name: fullName.trim(),
      company_name: company.trim(),
      job_title: jobTitle.trim(),
      avatar_url: avatarPath,
    })

    setSavingProfile(false)

    if (error) {
      alert(error.message)
      return
    }

    alert(t.saveProfileSuccess ?? "Profile saved successfully.")
  }

  const handlePasswordUpdate = async () => {
    if (!password || !confirmPassword) {
      alert(t.passwordRequired ?? "Please fill in both password fields.")
      return
    }

    if (password !== confirmPassword) {
      alert(t.passwordMismatch ?? "Passwords do not match.")
      return
    }

    setSavingPassword(true)

    const { error } = await supabase.auth.updateUser({ password })

    setSavingPassword(false)

    if (error) {
      alert(error.message)
      return
    }

    setPassword("")
    setConfirmPassword("")
    alert(t.passwordUpdatedSuccess ?? "Password updated successfully.")
  }

  const handleAvatarUpload = async (file: File | null) => {
    if (!file || !userId) return

    setUploadingAvatar(true)

    const safeName = file.name.replace(/\s+/g, "-")
    const filePath = `${userId}/${Date.now()}-${safeName}`

    const { error } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true })

    setUploadingAvatar(false)

    if (error) {
      alert(error.message)
      return
    }

    setAvatarPath(filePath)
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      t.deleteWarningConfirm ?? "Are you sure you want to delete your account?"
    )
    if (!confirmed || !userId) return

    setDeletingAccount(true)

    await supabase.from("profiles").delete().eq("id", userId)
    await supabase.auth.signOut()

    setDeletingAccount(false)
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl p-6 text-white">
        {t.loading ?? "Loading..."}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl p-6 text-white">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-blue-400/80">
                DealPilot
              </p>
              <h1 className="mt-2 text-3xl font-bold md:text-4xl">
                {t.settings}
              </h1>
              <p className="mt-2 text-white/60">
                {t.settingsDesc}
              </p>
            </div>

            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium transition hover:bg-white/10"
            >
              {t.back}
            </button>
          </div>

          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 shadow-[0_0_40px_rgba(255,255,255,0.04)]">
            <h2 className="text-2xl font-semibold">{t.profile}</h2>
            <p className="mt-1 text-sm text-white/60">{t.profileDesc}</p>

            <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center">
              <div className="h-24 w-24 overflow-hidden rounded-full border border-white/10 bg-black/40">
                <Image
                  src={avatarSrc}
                  alt="Profile avatar"
                  width={96}
                  height={96}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="space-y-3">
                <label className="inline-flex cursor-pointer items-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium transition hover:bg-white/10">
                  {uploadingAvatar ? t.uploadingAvatar : t.uploadAvatar}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    className="hidden"
                    onChange={(e) => handleAvatarUpload(e.target.files?.[0] ?? null)}
                  />
                </label>

                  <p className="text-sm text-white/45">
                  {t.avatarHint}
                  </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t.fullName}
                className="rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none transition placeholder:text-white/35 focus:border-blue-400/50"
              />

              <input
                value={email}
                disabled
                className="rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white/65 outline-none"
              />

              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder={t.company}
                className="rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none transition placeholder:text-white/35 focus:border-blue-400/50"
              />

              <input
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder={t.role}
                className="rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none transition placeholder:text-white/35 focus:border-blue-400/50"
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={handleSaveProfile}
                className="rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-3 text-sm font-semibold text-white shadow-[0_0_30px_rgba(56,189,248,0.25)] transition hover:opacity-95"
              >
                {savingProfile ? t.saving : t.saveProfile}
              </button>

              <button
                onClick={() => router.push("/dashboard")}
                className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium transition hover:bg-white/10"
              >
                {t.goDashboard}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 shadow-[0_0_40px_rgba(255,255,255,0.04)]">
              <h2 className="text-2xl font-semibold">{t.security}</h2>
              <p className="mt-1 text-sm text-white/60">{t.securityDesc}</p>

              <div className="mt-6 space-y-4">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.newPassword}
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none transition placeholder:text-white/35 focus:border-blue-400/50"
                />

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t.confirmPassword}
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none transition placeholder:text-white/35 focus:border-blue-400/50"
                />
              </div>

              <button
                onClick={handlePasswordUpdate}
                className="mt-6 rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                {savingPassword ? t.updating ?? t.saving : t.updatePassword}
              </button>
            </div>

            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 shadow-[0_0_40px_rgba(255,255,255,0.04)]">
              <h2 className="text-2xl font-semibold">{t.language}</h2>
              <p className="mt-1 text-sm text-white/60">{t.languageDesc}</p>

              <label className="mt-6 block text-sm text-white/45">
                {t.language}
              </label>

              <select
                aria-label="Language selector"
                value={lang}
                onChange={(e) => setLang(e.target.value as Lang)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none transition focus:border-blue-400/50"
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="es">Español</option>
              </select>
            </div>
          </div>

          <div className="rounded-3xl border border-red-500/20 bg-gradient-to-br from-red-500/10 to-red-900/10 p-6 shadow-[0_0_40px_rgba(239,68,68,0.08)]">
            <h2 className="text-2xl font-semibold text-red-400">
              {t.dangerZone ?? "Danger Zone"}
            </h2>
            <p className="mt-2 text-sm text-red-200/70">
              {t.deleteWarning ?? "This action cannot be undone."}
            </p>

            <button
              onClick={handleDeleteAccount}
              className="mt-6 rounded-2xl bg-red-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-600"
            >
              {deletingAccount
                ? t.deletingAccount ?? "Deleting..."
                : t.deleteAccount ?? "Delete Account"}
            </button>
          </div>
        </div>

        <aside className="rounded-3xl border border-cyan-400/10 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-transparent p-6 shadow-[0_0_40px_rgba(6,182,212,0.08)] h-fit">
          <p className="text-sm text-white/60">
            {t.preview}
          </p>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs uppercase tracking-wide text-white/35">
                {t.fullName}
              </p>
              <p className="mt-2 text-lg font-medium">{fullName || "—"}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs uppercase tracking-wide text-white/35">
                {t.email}
              </p>
              <p className="mt-2 text-lg font-medium break-all">{email || "—"}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs uppercase tracking-wide text-white/35">
                {t.company}
              </p>
              <p className="mt-2 text-lg font-medium">{company || "—"}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs uppercase tracking-wide text-white/35">
                {t.role}
              </p>
              <p className="mt-2 text-lg font-medium">{jobTitle || "—"}</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
