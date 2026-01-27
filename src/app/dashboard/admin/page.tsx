"use client"

import ParticipantsTable from "@/components/ParticipantsTable"
import PieChartStats from "@/components/PieChartStats"
import BarChartStats from "@/components/BarChartStats"
import TrendChart from "@/components/TrendChart"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

type TrendPoint = {
  date: string
  count: number
  downloads: number
  newUsers: number
}

type Stats = {
  totalParticipants: number
  verifiedParticipants: number
  unverifiedParticipants: number
  totalDownloads: number
  dailyTrends: TrendPoint[]
}

type AdminUser = {
  username: string
  role: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      try {
        const meRes = await fetch("/api/admin/me")
        
        if (!meRes.ok || meRes.status === 401) {
          // Not authenticated, redirect to login
          router.push("/login")
          return
        }

        const meJson = await meRes.json()
        if (!meJson.success || !meJson.data) {
          router.push("/login")
          return
        }

        setAdmin(meJson.data)
        setIsAuthenticated(true)

        // Now fetch stats
        const statsRes = await fetch("/api/admin/stats")
        if (statsRes.ok) {
          const statsJson = await statsRes.json()
          if (statsJson.success) {
            setStats(statsJson.data)
          }
        }
      } catch (error) {
        console.error("Error loading admin dashboard:", error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/login")
  }

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
          <p className="text-sm text-slate-600 tracking-wide uppercase">
            Loading admin console...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Bar */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Left: Brand + breadcrumb */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                 <Image src="/amrita.png" alt="CERTIFY Logo" width={72} height={72} />
               
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-900 tracking-tight">
                  CERTIFY - DASHBOARD
                  </span>
                 
                </div>
              </div>
            </div>

            {/* Right: user info + logout */}
            <div className="flex items-center gap-4">
              {admin && (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-slate-900">
                      {admin.username}
                    </div>
                 
                  </div>
           
                </div>
              )}

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2  border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-colors"
              >
                <span className="hidden sm:inline">Logout</span>
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M11.25 4.5V3.75C11.25 3.05964 10.6904 2.5 10 2.5H4.5C3.80964 2.5 3.25 3.05964 3.25 3.75V16.25C3.25 16.9404 3.80964 17.5 4.5 17.5H10C10.6904 17.5 11.25 16.9404 11.25 16.25V15.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M8.75 10H16.75M16.75 10L14.5 7.75M16.75 10L14.5 12.25"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI row */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="bg-white p-5  shadow-sm border border-slate-100">
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Total Participants
            </p>
            <p className="mt-3 text-3xl font-bold text-slate-900">
              {stats?.totalParticipants || 0}
            </p>
          </div>

          <div className="bg-white p-5  shadow-sm border border-slate-100">
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Verified
            </p>
            <p className="mt-3 text-3xl font-bold text-emerald-600">
              {stats?.verifiedParticipants || 0}
            </p>
          </div>

          <div className="bg-white p-5  shadow-sm border border-slate-100">
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Total Downloads
            </p>
            <p className="mt-3 text-3xl font-bold text-amber-600">
              {stats?.totalDownloads || 0}
            </p>
          </div>

        
        </section>

        {/* Charts */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PieChartStats stats={stats} />
          <BarChartStats stats={stats} />
        </section>

        {/* Trend chart */}
        <section className="w-full">
          <TrendChart stats={stats} />
        </section>

        {/* Table */}
        <section className="bg-white  shadow-sm border border-slate-100 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Participants
            </h2>
            <p className="text-xs text-slate-500">
              Detailed overview of all registered participants
            </p>
          </div>
          <ParticipantsTable />
        </section>
      </main>
    </div>
  )
}
