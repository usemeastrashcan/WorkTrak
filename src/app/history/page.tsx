"use client"

import { useState, useEffect } from "react"
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  History,
  FileText,
  DollarSign,
  BarChart3,
  Settings,
} from "lucide-react"
import Link from "next/link"

interface WorkEntry {
  id: number
  company: string
  startTime: string
  duration: number
  is_submitted: boolean
  created_at: string
}

interface GroupedEntries {
  [date: string]: WorkEntry[]
}

type FilterType = "week" | "month" | "all"

export default function HistoryPage() {
  const [entries, setEntries] = useState<WorkEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>("week")
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchEntries()
  }, [])

  const fetchEntries = async () => {
    try {
      const response = await fetch("/api/timer")
      const result = await response.json()
      if (result.success) {
        setEntries(result.data)
      }
    } catch (error) {
      console.error("Error fetching entries:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]

    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const formatDuration = (hours: number) => {
    const totalSeconds = Math.floor(hours * 3600)
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  const filterEntries = (entries: WorkEntry[]) => {
    const now = new Date()
    const filtered = entries.filter((entry) => {
      const entryDate = new Date(entry.created_at)

      switch (filter) {
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          return entryDate >= weekAgo
        case "month":
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          return entryDate >= monthAgo
        default:
          return true
      }
    })
    return filtered
  }

  const groupEntriesByDate = (entries: WorkEntry[]): GroupedEntries => {
    return entries.reduce((groups, entry) => {
      const date = new Date(entry.created_at).toDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(entry)
      return groups
    }, {} as GroupedEntries)
  }

  const toggleDateExpansion = (date: string) => {
    const newExpanded = new Set(expandedDates)
    if (newExpanded.has(date)) {
      newExpanded.delete(date)
    } else {
      newExpanded.add(date)
    }
    setExpandedDates(newExpanded)
  }

  const filteredEntries = filterEntries(entries)
  const groupedEntries = groupEntriesByDate(filteredEntries)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-yellow-400 font-mono text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-3xl font-mono font-bold text-white mb-6">Time History</h1>

        {/* Filter Tabs */}
        <div className="flex gap-4">
          <button
            onClick={() => setFilter("week")}
            className={`px-4 py-2 font-mono text-sm border-2 rounded ${
              filter === "week"
                ? "border-yellow-500 bg-yellow-500/20 text-yellow-400"
                : "border-gray-600 text-gray-400 hover:border-gray-500"
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setFilter("month")}
            className={`px-4 py-2 font-mono text-sm border-2 rounded ${
              filter === "month"
                ? "border-yellow-500 bg-yellow-500/20 text-yellow-400"
                : "border-gray-600 text-gray-400 hover:border-gray-500"
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 font-mono text-sm border-2 rounded ${
              filter === "all"
                ? "border-yellow-500 bg-yellow-500/20 text-yellow-400"
                : "border-gray-600 text-gray-400 hover:border-gray-500"
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {Object.keys(groupedEntries).length === 0 ? (
          <div className="text-center text-gray-400 font-mono mt-12">
            No time entries found for the selected period.
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedEntries).map(([date, dateEntries]) => {
              const totalDuration = dateEntries.reduce((sum, entry) => sum + entry.duration, 0)
              const isExpanded = expandedDates.has(date)

              return (
                <div key={date} className="border border-gray-700 rounded-lg bg-gray-800">
                  {/* Date Header */}
                  <div className="p-4 border-b border-gray-700">
                    <div className="flex items-center gap-3 text-yellow-400 font-mono">
                      <Calendar className="w-5 h-5" />
                      <span className="text-lg font-semibold">{formatDate(date)}</span>
                    </div>
                  </div>

                  {/* Entries */}
                  <div className="divide-y divide-gray-700">
                    {dateEntries.map((entry, index) => {
                      const startTime = formatTime(entry.startTime)
                      const endTime = new Date(new Date(entry.startTime).getTime() + entry.duration * 3600000)
                      if (!(endTime instanceof Date) || isNaN(endTime)) {
                        console.error("Invalid endTime:", endTime);
                        return;
}
                      const endTimeFormatted = formatTime(endTime)

                      return (
                        <div
                          key={entry.id}
                          className="p-4 hover:bg-gray-750 cursor-pointer flex items-center justify-between"
                          onClick={() => toggleDateExpansion(`${date}-${entry.id}`)}
                        >
                          <div className="flex-1">
                            <div className="font-mono text-white text-lg">
                              {startTime} — {endTimeFormatted}
                            </div>
                            <div className="font-mono text-yellow-400 text-lg font-semibold mt-1">
                              {formatDuration(entry.duration)}
                            </div>
                            {expandedDates.has(`${date}-${entry.id}`) && (
                              <div className="mt-3 pt-3 border-t border-gray-600">
                                <div className="text-gray-400 font-mono text-sm">
                                  <div>
                                    Company: <span className="text-white">{entry.company}</span>
                                  </div>
                                  <div>
                                    Status: <span className="text-green-400">Submitted</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="text-gray-400">
                            {expandedDates.has(`${date}-${entry.id}`) ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Date Total */}
                  <div className="p-4 bg-gray-750 border-t border-gray-700">
                    <div className="font-mono text-yellow-400 text-lg font-semibold">
                      Total: {formatDuration(totalDuration)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="bg-gray-800 border-t border-gray-700">
        <div className="flex justify-around items-center py-4 px-4">
          <Link href="/" className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-300">
            <Clock className="w-6 h-6" />
            <span className="text-xs font-medium">Track</span>
          </Link>
          <Link href="/history" className="flex flex-col items-center gap-1 text-yellow-400">
            <History className="w-6 h-6" />
            <span className="text-xs font-medium">History</span>
          </Link>
          <Link href="/reports" className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-300">
            <FileText className="w-6 h-6" />
            <span className="text-xs font-medium">Reports</span>
          </Link>
          <Link href="/expenses" className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-300">
            <DollarSign className="w-6 h-6" />
            <span className="text-xs font-medium">Expenses</span>
          </Link>
          <Link href="/stats" className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-300">
            <BarChart3 className="w-6 h-6" />
            <span className="text-xs font-medium">Stats</span>
          </Link>
          <Link href="/admin" className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-300">
            <Settings className="w-6 h-6" />
            <span className="text-xs font-medium">Admin</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
