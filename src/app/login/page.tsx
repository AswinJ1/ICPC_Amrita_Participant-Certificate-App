"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const router = useRouter()

  // Check if already authenticated
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/admin/me")
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.data) {
            router.push("/dashboard/admin")
            return
          }
        }
      } catch (err) {
        console.error("Auth check error:", err)
      } finally {
        setChecking(false)
      }
    }
    checkAuth()
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (data.success) {
        router.push("/dashboard/admin")
      } else {
        setError(data.error || "Login failed")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-slate-50">
      {/* Left image (hidden on small screens) */}
      <div className="w-full md:w-1/2 hidden md:inline-block">
        <img
          className="h-full w-full object-cover"
          src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/login/leftSideImage.png"
          alt="leftSideImage"
        />
      </div>

      {/* Right form */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center px-4 py-8 md:py-0">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md flex flex-col items-center justify-center"
        >
          <h2 className="text-3xl md:text-4xl text-gray-900 font-medium">Sign in</h2>
          <p className="text-xs md:text-sm text-gray-500/90 mt-3 text-center">
            Welcome back! Please sign in to continue
          </p>

          {error && (
            <div className="w-full mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {error}
            </div>
          )}

          {/* Google button (visual only) */}
        

          <div className="flex items-center gap-2 md:gap-4 w-full my-4 md:my-5">
            <div className="w-full h-px bg-gray-300/90" />
            <p className="text-nowrap text-xs md:text-sm text-gray-500/90">
              sign in with email
            </p>
            <div className="w-full h-px bg-gray-300/90" />
          </div>

          {/* Username (using email-style field) */}
          <div className="flex items-center w-full bg-transparent border border-gray-300/60 h-11 md:h-12 rounded-full overflow-hidden pl-4 md:pl-6 gap-2">
            <svg
              width="16"
              height="11"
              viewBox="0 0 16 11"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M0 .55.571 0H15.43l.57.55v9.9l-.571.55H.57L0 10.45zm1.143 1.138V9.9h13.714V1.69l-6.503 4.8h-.697zM13.749 1.1H2.25L8 5.356z"
                fill="#6B7280"
              />
            </svg>
            <input
              type="text"
              placeholder="Username"
              className="bg-transparent text-gray-500/80 placeholder-gray-500/80 outline-none text-xs md:text-sm w-full h-full pr-4"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="flex items-center mt-4 md:mt-6 w-full bg-transparent border border-gray-300/60 h-11 md:h-12 rounded-full overflow-hidden pl-4 md:pl-6 gap-2">
            <svg
              width="13"
              height="17"
              viewBox="0 0 13 17"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13 8.5c0-.938-.729-1.7-1.625-1.7h-.812V4.25C10.563 1.907 8.74 0 6.5 0S2.438 1.907 2.438 4.25V6.8h-.813C.729 6.8 0 7.562 0 8.5v6.8c0 .938.729 1.7 1.625 1.7h9.75c.896 0 1.625-.762 1.625-1.7zM4.063 4.25c0-1.406 1.093-2.55 2.437-2.55s2.438 1.144 2.438 2.55V6.8H4.061z"
                fill="#6B7280"
              />
            </svg>
            <input
              type="password"
              placeholder="Password"
              className="bg-transparent text-gray-500/80 placeholder-gray-500/80 outline-none text-xs md:text-sm w-full h-full pr-4"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between mt-6 md:mt-8 text-gray-500/80 gap-3 sm:gap-0">
            <div className="flex items-center gap-2">
              <input className="h-4 w-4 md:h-5 md:w-5" type="checkbox" id="remember" />
              <label className="text-xs md:text-sm" htmlFor="remember">
                Remember me
              </label>
            </div>
            <button
              type="button"
              className="text-xs md:text-sm underline underline-offset-2"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 md:mt-8 w-full h-11 rounded-full text-sm md:text-base text-white bg-indigo-500 hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-gray-500/90 text-xs md:text-sm mt-4 text-center">
            Don't have an account?{" "}
            <span className="text-indigo-400">Sign up</span>
          </p>
        </form>
      </div>
    </div>
  )
}
