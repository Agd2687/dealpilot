"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function Topbar() {
  const router = useRouter()

  // UI state
  const [avatarUrl, setAvatarUrl] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [fullName, setFullName] = useState<string>("")
  const [menuOpen, setMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  // persisted state
  const [isOnline, setIsOnline] = useState(true)
  const [hasUnread, setHasUnread] = useState(true)

  // 🔥 LOAD USER + PROFILE
  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      setEmail(user.email || "")

      const { data, error } = await supabase
        .from("profiles")
        .select("avatar_url, full_name, is_online, has_unread")
        .eq("id", user.id)
        .single()

      if (error) {
        console.error(error)
        return
      }

      if (data) {
        setAvatarUrl(data.avatar_url || "")
        setFullName(data.full_name || "")
        setIsOnline(data.is_online ?? true)
        setHasUnread(data.has_unread ?? true)
      }
    }

    loadProfile()
  }, [])

  // 🔥 TOGGLE ONLINE STATUS
  const toggleStatus = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const newStatus = !isOnline
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
        <h1 className="text-lg font-semibold text-white">DealPilotDashboard</h1>
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
          <div className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
            🔔
          </div>

          {/* GREEN DOT */}
          {hasUnread && (
            <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full" />
          )}
        </div>

        {/* 🔔 DROPDOWN */}
        {notificationsOpen && (
          <div className="absolute right-0 top-12 w-64 bg-black border border-white/10 rounded-xl p-4 shadow-xl z-50">
            <p className="text-sm text-white/70 mb-2">Notifications</p>
            <div className="space-y-2 text-sm">
              <div className="bg-white/5 p-2 rounded">New deal created</div>
              <div className="bg-white/5 p-2 rounded">AI suggests follow-up</div>
              <div className="bg-white/5 p-2 rounded">Pipeline updated</div>
            </div>
          </div>
        )}

        {/* 👤 USER */}
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
              className="w-10 h-10 rounded-full object-cover border border-blue-500"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
              {(fullName || email)?.charAt(0).toUpperCase()}
            </div>
          )}

          {/* 🟢 ONLINE DOT */}
          <span
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-black ${
              isOnline ? "bg-green-500" : "bg-gray-500"
            }`}
          />
        </div>

        {/* 👤 DROPDOWN */}
        {menuOpen && (
          <div className="absolute right-0 top-12 w-48 bg-black border border-white/10 rounded-xl p-3 shadow-xl z-50">
            <p className="text-sm text-white mb-2">{email}</p>

            <button
              onClick={toggleStatus}
              className="w-full text-left text-sm text-white/80 hover:text-white mb-2"
            >
              {isOnline ? "Go Offline" : "Go Online"}
            </button>

            <button
              onClick={handleLogout}
              className="w-full text-left text-sm text-red-400 hover:text-red-500"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
