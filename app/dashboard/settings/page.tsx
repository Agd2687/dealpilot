"use client"

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

type Profile = {
  id: string
  full_name: string | null
  email: string | null
  avatar_url: string | null
  company_name?: string | null
  job_title?: string | null
}

export default function SettingsPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const [userId, setUserId] = useState("")
  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [jobTitle, setJobTitle] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

 const avatarPreview = useMemo(() => {
  if (!avatarUrl) return ""

  const { data } = supabase
    .storage
    .from("avatars")
    .getPublicUrl(avatarUrl)

  return data.publicUrl
}, [avatarUrl])
  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true)
        setError("")
        setMessage("")

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError) throw authError

        if (!user) {
          router.push("/login")
          return
        }

        setUserId(user.id)
        setEmail(user.email ?? "")

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, full_name, email, avatar_url, company_name, job_title")
          .eq("id", user.id)
          .maybeSingle()

        if (profileError) throw profileError

        if (profile) {
          setFullName(profile.full_name ?? "")
          setCompanyName(profile.company_name ?? "")
          setJobTitle(profile.job_title ?? "")
          setAvatarUrl(profile.avatar_url ?? "")
          setEmail(profile.email ?? user.email ?? "")
        } else {
          const starterProfile: Profile = {
            id: user.id,
            full_name: "",
            email: user.email ?? "",
            avatar_url: "",
            company_name: "",
            job_title: "",
          }

          const { error: insertError } = await supabase.from("profiles").upsert(starterProfile)

          if (insertError) throw insertError
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load settings."
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [router])

  const handleAvatarUpload = async (e: ChangeEvent<HTMLInputElement>) => {
  try {
    const file = e.target.files?.[0]
    if (!file || !userId) return

    setUploadingAvatar(true)

    const fileExt = file.name.split(".").pop()
    const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`

    const { error } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true })

    if (error) throw error
    const { data: publicUrlData } = supabase
  .storage
  .from("avatars")
  .getPublicUrl(filePath)

const newAvatarUrl = publicUrlData.publicUrl
window.dispatchEvent(
  new CustomEvent("avatarUpdated", {
    detail: newAvatarUrl,
  })
)
    // 💥 INSTANT PREVIEW
    const { data } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath)

    setAvatarUrl(filePath)

    // 💥 AUTO SAVE TO DB
    await supabase
      .from("profiles")
      .update({ avatar_url: filePath })
      .eq("id", userId)

  } catch (err) {
    console.error(err)
  } finally {
    setUploadingAvatar(false)
  }
}

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault()

    try {
      setSavingProfile(true)
      setError("")
      setMessage("")

      if (!userId) throw new Error("User not found.")

      const payload = {
        id: userId,
        full_name: fullName.trim(),
        email: email.trim(),
        avatar_url: avatarUrl || null,
        company_name: companyName.trim() || null,
        job_title: jobTitle.trim() || null,
        updated_at: new Date().toISOString(),
      }

      const { error: profileError } = await supabase.from("profiles").upsert(payload)
      if (profileError) throw profileError

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user?.email && email.trim() && email.trim() !== user.email) {
        const { error: authUpdateError } = await supabase.auth.updateUser({
          email: email.trim(),
        })

        if (authUpdateError) throw authUpdateError
        setMessage("Profile saved. Check your email to confirm the new address.")
        return
      }

      setMessage("Profile updated successfully.")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save profile."
      setError(message)
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePasswordUpdate = async (e: FormEvent) => {
    e.preventDefault()

    try {
      setSavingPassword(true)
      setError("")
      setMessage("")

      if (!newPassword || !confirmPassword) {
        throw new Error("Please fill in both password fields.")
      }

      if (newPassword.length < 6) {
        throw new Error("Password must be at least 6 characters.")
      }

      if (newPassword !== confirmPassword) {
        throw new Error("Passwords do not match.")
      }

      const { error: passwordError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (passwordError) throw passwordError

      setNewPassword("")
      setConfirmPassword("")
      setMessage("Password updated successfully.")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update password."
      setError(message)
    } finally {
      setSavingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-6 md:p-10">
        <div className="mx-auto max-w-6xl animate-pulse space-y-6">
          <div className="h-10 w-56 rounded-xl bg-white/10" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 h-96 rounded-3xl bg-white/5 border border-white/10" />
            <div className="h-96 rounded-3xl bg-white/5 border border-white/10" />
          </div>
          <div className="h-72 rounded-3xl bg-white/5 border border-white/10" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-blue-400/80">DealPilot</p>
            <h1 className="text-3xl md:text-4xl font-bold">Settings</h1>
            <p className="mt-2 text-sm text-white/60">
              Manage your profile, security, workspace details, and account preferences.
            </p>
          </div>

          <button
            onClick={() => router.back()}
            className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Back
          </button>
        </div>

        {(message || error) && (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${
              error
                ? "border-red-500/30 bg-red-500/10 text-red-200"
                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
            }`}
          >
            {error || message}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 shadow-2xl backdrop-blur-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Profile</h2>
                <p className="mt-1 text-sm text-white/60">
                  Update your personal details and how your account appears.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="flex flex-col gap-5 md:flex-row md:items-center">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-white/5">
                  {avatarPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-semibold text-white/50">
                      {fullName?.trim()?.charAt(0)?.toUpperCase() || "D"}
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="inline-flex cursor-pointer items-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10">
                    {uploadingAvatar ? "Uploading..." : "Upload Avatar"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-white/50">
                    Best results: square image, JPG or PNG.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-blue-400/50"
                />

                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-blue-400/50"
                />

                <input
                  type="text"
                  placeholder="Company Name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-blue-400/50"
                />

                <input
                  type="text"
                  placeholder="Job Title"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-blue-400/50"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingProfile ? "Saving..." : "Save Profile"}
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  Go to Dashboard
                </button>
              </div>
            </form>
          </div>

          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-6 shadow-2xl backdrop-blur-xl">
            <h2 className="text-xl font-semibold">Account Snapshot</h2>
            <p className="mt-1 text-sm text-white/60">
              Quick view of your current workspace identity.
            </p>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="text-xs uppercase tracking-wide text-white/40">Full Name</p>
                <p className="mt-1 font-medium">{fullName || "Not set yet"}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="text-xs uppercase tracking-wide text-white/40">Email</p>
                <p className="mt-1 font-medium break-all">{email || "No email found"}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="text-xs uppercase tracking-wide text-white/40">Company</p>
                <p className="mt-1 font-medium">{companyName || "Not set yet"}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="text-xs uppercase tracking-wide text-white/40">Role / Title</p>
                <p className="mt-1 font-medium">{jobTitle || "Not set yet"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 shadow-2xl backdrop-blur-xl">
            <h2 className="text-2xl font-semibold">Security</h2>
            <p className="mt-1 text-sm text-white/60">
              Keep your account secure with a stronger password.
            </p>

            <form onSubmit={handlePasswordUpdate} className="mt-6 space-y-4">
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-blue-400/50"
              />

              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-blue-400/50"
              />

              <button
                type="submit"
                disabled={savingPassword}
                className="rounded-2xl bg-white text-black px-5 py-3 text-sm font-semibold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingPassword ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 shadow-2xl backdrop-blur-xl">
            <h2 className="text-2xl font-semibold">Workspace Preferences</h2>
            <p className="mt-1 text-sm text-white/60">
              Placeholder section for future CRM settings.
            </p>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-white/50">Coming soon</p>
                </div>
                <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/50">
                  Soon
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                <div>
                  <p className="font-medium">Team Permissions</p>
                  <p className="text-sm text-white/50">Admin controls coming soon</p>
                </div>
                <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/50">
                  Soon
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                <div>
                  <p className="font-medium">AI Preferences</p>
                  <p className="text-sm text-white/50">Customize insights later</p>
                </div>
                <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/50">
                  Soon
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-6 shadow-2xl backdrop-blur-xl">
          <h2 className="text-2xl font-semibold text-red-200">Danger Zone</h2>
          <p className="mt-1 text-sm text-red-200/70">
            Sensitive account actions should live here later.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-medium text-red-200 transition hover:bg-red-500/20"
            >
              Sign out other sessions
            </button>

            <button
              type="button"
              className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-medium text-red-200 transition hover:bg-red-500/20"
            >
              Delete account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
