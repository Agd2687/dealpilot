"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  const handleSignup = async () => {
    setLoading(true)
    setErrorMsg(null)
    setMsg(null)

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false)

    if (error) {
      // If email already exists
      if (error.message.toLowerCase().includes("already")) {
      setErrorMsg("This email already exists, please log in.")
    } else {
      setErrorMsg(error.message)
    }
      return
    }
    // Show success message and redirect to Login
    setMsg("Account already created! Please check your email to confirm.")

  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-black to-gray-900">
      <div className="w-full max-w-md space-y-4 rounded-xl border border-white/20 p-6">
        <h1 className="text-2xl font-semibold text-white">
          Sign up for DealPilot
        </h1>

        <input
          className="w-full rounded-lg bg-white/5 border border-white/20 px-3 py-2 text-white"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />

        <input
          className="w-full rounded-lg bg-white/5 border border-white/20 px-3 py-2 text-white"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />

        {errorMsg && (
          <p className="text-sm text-red-400">
            {errorMsg}
          </p>
        )}

        {msg && (
          <p className="text-sm text-green-400">
            {msg}
          </p>
        )}

        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full rounded-lg bg-white text-black py-2 font-semibold"
        >
          {loading ? "Creating..." : "Sign up"}
        </button>

        <p className="text-sm text-white/70">
          Already have an account?{" "}
          <Link className="underline" href="/login">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}
