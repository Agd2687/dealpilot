"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function Topbar() {
  const router = useRouter()

  // UI state
  const [avatarUrl, setAvatarUrl] = useState("")
  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  // persisted state (Supabase)
  const [isOnline, setIsOnline] = useState(true)
  const [hasUnread, setHasUnread] = useState(true)

  // 🔥 LOAD USER + PROFILE
  useEffect(() => {
    let isMounted = true

    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      if (isMounted) setEmail(user.email || "")

      const { data, error } = await supabase
        .from("profiles")
        .select("avatar_url, full_name, is_online, has_unread")
        .eq("id", user.id)
        .single()

      if (error || !data) return

      // avatar
      if (data.avatar_url) {
        const { data: avatarData } = supabase.storage
          .from("avatars")
          .getPublicUrl(data.avatar_url)

        if (isMounted) setAvatarUrl(avatarData.publicUrl)
      }

      // name
      if (data.full_name && isMounted) {
        setFullName(data.full_name)
      }

      // status
      if (data.is_online !== null && isMounted) {
        setIsOnline(data.is_online)
      }

      // notifications
      if (data.has_unread !== null && isMounted) {
        setHasUnread(data.has_unread)
      }
    }

    loadProfile()

    return () => {
      isMounted = false
    }
  }, [])

  // 🔥 CLOSE DROPDOWNS WHEN CLICK OUTSIDE
  useEffect(() => {
    const handleClickOutside = () => {
      setMenuOpen(false)
      setNotificationsOpen(false)
    }

    window.addEventListener("click", handleClickOutside)
    return () => window.removeEventListener("click", handleClickOutside)
  }, [])

  // 🔥 TOGGLE ONLINE STATUS
  const toggleStatus = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  const newStatus = !isOnline  // ✅ THIS WAS MISSING

  setIsOnline(newStatus)

  await supabase
    .from("profiles")
    .update({ is_online: newStatus })
    .eq("id", user.id)
}
  // 🔥 CLEAR NOTIFICATIONS
  const clearNotifications = async () => {
    setHasUnread(false)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    await supabase
      .from("profiles")
      .update({ has_unread: false })
      .eq("id", user.id)
  }

  // 🔥 LOGOUT
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <div className="w-full flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black">

      {/* LEFT */}
      <div>
        <h1 className="text-lg font-semibold text-white">
          DealPilotDashboard
        </h1>
        <p className="text-sm text-white/50">
          Welcome back, {fullName || "User"} 👋
        </p>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4 relative">
        {/* 🔔 NOTIFICATIONS */}
        <div
          onClick={(e) => {
            e.stopPropagation()
            setNotificationsOpen((prev) => !prev)
            clearNotifications()
          }}
          className="relative cursor-pointer"
        >
          <div className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition">
            🔔
          </div>

          {/* GREEN DOT */}
          {hasUnread && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></span>
          )}
        </div>

        {/* 🔔 NOTIFICATION DROPDOWN */}
        {notificationsOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute right-20 top-12 w-64 bg-black border border-white/10 rounded-xl shadow-xl p-4 space-y-2"
          >
            <p className="text-white/70 text-sm">Notifications</p>

            <div className="bg-white/5 p-2 rounded-lg text-sm">
              🟢 New deal created
            </div>
            <div className="bg-white/5 p-2 rounded-lg text-sm">
              💡 AI suggests follow-up
            </div>
            <div className="bg-white/5 p-2 rounded-lg text-sm">
              📊 Pipeline updated
            </div>
          </div>
        )}

        {/* 👤 NAME */}
        <span className="text-sm text-white/70 hidden sm:block">
          {fullName || email}
        </span>

        {/* 👤 AVATAR */}
        <div
          onClick={(e) => {
            e.stopPropagation()
            setMenuOpen((prev) => !prev)
          }}
          className="relative cursor-pointer"
        >
          {avatarUrl ? (
  <img
    src={avatarUrl}
    alt="avatar"
    className="w-10 h-10 rounded-full object-cover border-2 border-blue-500/40"
  />
) : (
  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
    {(fullName || email)?.charAt(0)?.toUpperCase()}
  </div>
)}

          {/* 🟢 ONLINE STATUS DOT */}
          <span
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-black ${
              isOnline ? "bg-green-500" : "bg-gray-400"
            }`}
          />
        </div>

        {/* 👤 DROPDOWN */}
        {menuOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-12 w-48 bg-black border border-white/10 rounded-xl shadow-xl"
          >
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full text-left px-4 py-3 hover:bg-white/10"
            >
              Profile
            </button>

            <button
              onClick={() => router.push("/dashboard/settings")}
              className="w-full text-left px-4 py-3 hover:bg-white/10"
            >
              Settings
            </button>

            <button
              onClick={toggleStatus}
              className="w-full text-left px-4 py-3 hover:bg-white/10"
            >
              {isOnline ? "Go Offline" : "Go Online"}
            </button>

            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 text-red-400 hover:bg-white/10"
            >
              Log Out
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
