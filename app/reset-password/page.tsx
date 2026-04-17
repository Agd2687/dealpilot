"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function ResetPasswordPage() {
  const router = useRouter()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const [message, setMessage] = useState<string | null>(null)
  const [messageType, setMessageType] = useState<"error" | "success">("error")

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [hasSession, setHasSession] = useState<boolean | null>(null)

  // ✅ Check if the reset link created a valid session
  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        setHasSession(false)
        setMessageType("error")
        setMessage("Could not verify reset session. Please request a new reset link.")
        return
      }

      if (!data.session) {
        setHasSession(false)
        setMessageType("error")
        setMessage("Reset link is invalid or expired. Please request a new reset link.")
        return
      }

      setHasSession(true)
    }

    checkSession()
  }, [])

  const handleUpdatePassword = async () => {
    setMessage(null)

    if (password.length < 6) {
      setMessageType("error")
      setMessage("Password must be at least 6 characters.")
      return
    }

    if (password !== confirmPassword) {
      setMessageType("error")
      setMessage("Passwords do not match.")
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({ password })

    setLoading(false)

    if (error) {
      setMessageType("error")
      setMessage(error.message || "Failed to update password.")
      return
    }

    setMessageType("success")
    setMessage("✅ Password updated successfully! Redirecting to login...")

    setTimeout(() => {
      router.replace("/login")
    }, 1500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
      <div className="w-full max-w-md space-y-4 border border-gray-800 rounded-xl p-6 bg-neutral-950">
        <div>
          <h1 className="text-2xl font-bold">Set New Password</h1>
          <p className="text-sm text-gray-400">Enter a new password for your account.</p>
        </div>

        {/* If reset link is invalid */}
        {hasSession === false && (
          <div className="rounded-lg border border-red-800 bg-red-950 p-3 text-sm text-red-200">
            {message || "Reset link invalid or expired."}
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => router.push("/forgot-password")}
                className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-black hover:opacity-90"
              >
                Request new reset link
              </button>
              <button
                onClick={() => router.push("/login")}
                className="rounded-lg border border-gray-700 px-3 py-2 text-sm hover:bg-neutral-900"
              >
                Back to login
              </button>
            </div>
          </div>
        )}

        {/* Main form */}
        {hasSession === true && (
          <>
            {message && (
              <div
                className={`rounded-lg border p-3 text-sm ${
                  messageType === "success"
                    ? "border-green-800 bg-green-950 text-green-200"
                    : "border-red-800 bg-red-950 text-red-200"
                }`}
              >
                {message}
              </div>
            )}

            {/* New password */}
            <div className="space-y-1">
              <label className="block text-sm text-gray-300">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full rounded-lg bg-black border border-gray-800 px-3 py-2 pr-16 outline-none focus:border-gray-500"
                  placeholder="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 hover:text-white"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div className="space-y-1">
              <label className="block text-sm text-gray-300">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  className="w-full rounded-lg bg-black border border-gray-800 px-3 py-2 pr-16 outline-none focus:border-gray-500"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 hover:text-white"
                >
                  {showConfirm ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              onClick={handleUpdatePassword}
              disabled={loading}
              className="w-full rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </>
        )}

        {/* Loading session check */}
        {hasSession === null && (
          <div className="text-sm text-gray-400">Checking reset link...</div>
        )}
      </div>
    </div>
  )
}
