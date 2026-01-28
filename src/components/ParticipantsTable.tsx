"use client"

import { useEffect, useState } from "react"

interface Participant {
  id: string
  name: string
  email: string
  teamId: string
  teamName: string
  count: number
  createdAt: string | null
  updatedAt: string | null
  isVerified: boolean
}

const PAGE_SIZE = 20

export default function ParticipantsTable() {
  const [rows, setRows] = useState<Participant[]>([])
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch("/api/admin/all-participants")
        const data = await res.json()

        if (data.success) {
          setRows(data.data)
        } else {
          setError(data.message || "Failed to load participants")
        }
      } catch (error) {
        console.error("Failed to load participants:", error)
        setError("Failed to load participants")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Filter
  const filtered = rows.filter((r) =>
    r.name?.toLowerCase().includes(query.toLowerCase()) ||
    r.email?.toLowerCase().includes(query.toLowerCase()) ||
    (typeof r.teamName === 'string' && r.teamName.toLowerCase().includes(query.toLowerCase())) ||
    r.teamId?.toString().includes(query)
  )

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1)
  }, [query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const startIndex = (page - 1) * PAGE_SIZE
  const endIndex = startIndex + PAGE_SIZE
  const pageRows = filtered.slice(startIndex, endIndex)

  const verifiedCount = filtered.filter((p) => p.isVerified).length
  const unverifiedCount = filtered.length - verifiedCount

  if (loading) {
    return (
      <div className="bg-white  border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Participants
          </h2>
          <span className="inline-flex items-center text-xs text-slate-500">
            Syncing latest data…
          </span>
        </div>
        <div className="flex items-center justify-center h-40">
          <div className="flex items-center gap-3 text-slate-600">
            <div className="animate-spin h-8 w-8 border-b-2 border-indigo-600" />
            <span className="text-sm">Loading participants...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white border border-rose-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-slate-900">
            Participants
          </h2>
        </div>
        <div className=" border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 inline-flex items-center text-xs font-medium text-rose-700 hover:text-rose-900 underline underline-offset-2"
          >
            Retry loading
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white  border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Participants
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            All registered teams and members for the contest.
          </p>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex items-center gap-3 text-xs">
            <span className="inline-flex items-center  px-2.5 py-0.5 font-medium text-emerald-700 ">
          
              Verified: {verifiedCount}
            </span>
            <span className="inline-flex items-center   px-2.5 py-0.5 font-medium text-amber-700">
              Pending: {unverifiedCount}
            </span>
            <span className="inline-flex items-center  px-2.5 py-0.5 font-medium text-slate-600 ">
              Total: {filtered.length}
            </span>
          </div>

          <div className="relative w-full md:w-64">
            <input
              className="w-full  border border-slate-200 bg-slate-50/60 px-9 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
              placeholder="Search name, email or team..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
              {/* search icon */}
              <svg
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.25 15.5C12.5637 15.5 15.25 12.8137 15.25 9.5C15.25 6.18629 12.5637 3.5 9.25 3.5C5.93629 3.5 3.25 6.18629 3.25 9.5C3.25 12.8137 5.93629 15.5 9.25 15.5Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M14 14L16.75 16.75"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-t border-slate-100">
          <thead className="bg-slate-50/80">
            <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-6 py-3 text-left">Participant</th>
              <th className="px-6 py-3 text-left">Team</th>
              <th className="px-6 py-3 text-center">Downloads</th>
              <th className="px-6 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-100">
            {pageRows.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-10 text-center text-slate-500"
                >
                  {query
                    ? "No participants match your search."
                    : "No participants found yet."}
                </td>
              </tr>
            ) : (
              pageRows.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  <td className="px-6 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">
                        {p.name}
                      </span>
                      <span className="text-xs text-slate-500">
                        {p.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex flex-col">
                      <span className="text-slate-900">
                        {p.teamName || "-"}
                      </span>
                      {/* <span className="text-xs text-slate-500">
                        Team ID: {p.teamId}
                      </span> */}
                    </div>
                  </td>
                  <td className="px-6 py-3 text-center">
                    <span className="inline-flex items-center  px-2.5 py-0.5 text-xs font-medium text-indigo-700 ">
                      {p.count}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center">
                    {p.isVerified ? (
                      <span className="inline-flex items-center  px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium text-amber-700 ">
                        Pending verification
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer & pagination */}
      {filtered.length > 0 && (
        <div className="px-6 py-4 border-t border-slate-100 flex flex-col gap-3 md:flex-row md:items-center md:justify-between text-xs text-slate-600">
          <span>
            Showing{" "}
            <span className="font-medium">
              {startIndex + 1}-{Math.min(endIndex, filtered.length)}
            </span>{" "}
            of <span className="font-medium">{filtered.length}</span> filtered
            participants (total {rows.length})
          </span>

          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="inline-flex items-center  border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              Prev
            </button>

            <span className="text-xs text-slate-500">
              Page <span className="font-semibold">{page}</span> of{" "}
              <span className="font-semibold">{totalPages}</span>
            </span>

            <button
              onClick={() =>
                setPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={page === totalPages}
              className="inline-flex items-center  border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
