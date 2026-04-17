"use client"

import { useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleReset = async () => {
    setLoading(true)
    setMsg(null)
    setErrorMsg(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setLoading(false)

    if (error) {
      setErrorMsg(error.message)
      return
    }

    setMsg("Check your email for a password reset link.")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-md space-y-4 p-6">
        <h1 className="text-2xl font-bold">Forgot password</h1>
        <p className="text-sm text-gray-400">
          Enter your email and we’ll send you a reset link.
        </p>

        {errorMsg && <p className="text-red-400">{errorMsg}</p>}
        {msg && <p className="text-green-400">{msg}</p>}

        <input
          className="w-full p-2 rounded bg-gray-800"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={handleReset}
          disabled={loading || !email}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 p-2 rounded"
        >
          {loading ? "Sending..." : "Send reset link"}
        </button>

        <p className="text-sm">
          <Link href="/login" className="text-blue-400 hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  )
}