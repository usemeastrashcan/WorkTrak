"use client"

import { useState, useEffect } from "react"
import { Clock, Calendar, Target, History, FileText, DollarSign, BarChart3, Settings } from "lucide-react"
import Link from "next/link"

interface WorkEntry {
  id: number
  company: string
  startTime: string
  duration: number
  is_submitted: boolean
  created_at: string
}

interface WeeklyData {
  day: string
  hours: number
}

interface WorkPattern {
  day: string
  hours: number[]
}

export default function StatsPage() {
  const [entries, setEntries] = useState<WorkEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"week" | "month">("week")
  const [showBreaks, setShowBreaks] = useState(false)

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



  const getWeeklyData = (): WeeklyData[] => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    const weekData = days.map((day) => ({ day, hours: 0 }))

    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    entries
      .filter((entry) => new Date(entry.created_at) >= weekAgo)
      .forEach((entry) => {
        const dayIndex = new Date(entry.created_at).getDay()
        const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1 // Convert Sunday=0 to Sunday=6
        weekData[adjustedIndex].hours += entry.duration
      })

    return weekData
  }

  const getWorkPattern = (): WorkPattern[] => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri"]
    const hours = Array.from({ length: 24 }, (_, i) => i)

    return days.map((day) => ({
      day,
      hours: hours.map(() => (Math.random() > 0.7 ? Math.random() * 2 : 0)), // Mock data
    }))
  }

  const calculateStats = () => {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const weekEntries = entries.filter((entry) => new Date(entry.created_at) >= weekAgo)

    const totalHours = weekEntries.reduce((sum, entry) => sum + entry.duration, 0)
    const workDays = new Set(weekEntries.map((entry) => new Date(entry.created_at).toDateString())).size
    const dailyAverage = workDays > 0 ? totalHours / workDays : 0

    // Calculate streak (consecutive days with work)
    let streak = 0
    const today = new Date()
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
      const hasWork = entries.some((entry) => {
        const entryDate = new Date(entry.created_at)
        return entryDate.toDateString() === checkDate.toDateString()
      })
      if (hasWork) {
        streak++
      } else {
        break
      }
    }

    // Calculate productivity score (mock calculation)
    const targetHours = 8
    const productivity = Math.min(100, Math.round((dailyAverage / targetHours) * 100))

    return {
      totalHours: totalHours.toFixed(1),
      dailyAverage: dailyAverage.toFixed(1),
      streak,
      productivity,
    }
  }

  const weeklyData = getWeeklyData()
  const workPattern = getWorkPattern()
  const stats = calculateStats()
  const maxHours = Math.max(...weeklyData.map((d) => d.hours), 1)

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
        <h1 className="text-3xl font-mono font-bold text-white mb-6">Analytics</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("week")}
            className={`px-6 py-3 font-mono text-sm rounded ${
              activeTab === "week"
                ? "bg-yellow-600 text-black font-semibold"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setActiveTab("month")}
            className={`px-6 py-3 font-mono text-sm rounded ${
              activeTab === "month"
                ? "bg-yellow-600 text-black font-semibold"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            This Month
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
            <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
            <div className="text-gray-400 font-mono text-sm mb-1">Total Hours</div>
            <div className="text-yellow-400 font-mono text-3xl font-bold">{stats.totalHours}h</div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
            <Calendar className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
            <div className="text-gray-400 font-mono text-sm mb-1">Daily Average</div>
            <div className="text-yellow-400 font-mono text-3xl font-bold">{stats.dailyAverage}h</div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
            <Target className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
            <div className="text-gray-400 font-mono text-sm mb-1">Streak</div>
            <div className="text-yellow-400 font-mono text-3xl font-bold">{stats.streak} days</div>
          </div>
        </div>

        {/* Productivity Score */}
        <div className="text-center mb-8">
          <h2 className="text-white font-mono text-xl font-bold mb-6">Productivity Score</h2>
          <div className="relative inline-flex items-center justify-center">
            <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-700"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - stats.productivity / 100)}`}
                className="text-green-500 transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-mono font-bold text-white">{stats.productivity}%</div>
                <div className="text-gray-400 font-mono text-sm">Productivity</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 space-y-8">
        {/* Weekly Overview */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white font-mono text-xl font-bold">Weekly Overview</h2>
            <label className="flex items-center gap-2 text-yellow-400 font-mono text-sm">
              <input
                type="checkbox"
                checked={showBreaks}
                onChange={(e) => setShowBreaks(e.target.checked)}
                className="rounded"
              />
              Show Breaks
            </label>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-end justify-between h-48 gap-4">
              {weeklyData.map((data) => (
                <div key={data.day} className="flex flex-col items-center flex-1">
                  <div
                    className="bg-yellow-600 rounded-t w-full transition-all duration-500"
                    style={{
                      height: `${(data.hours / maxHours) * 160}px`,
                      minHeight: data.hours > 0 ? "8px" : "0px",
                    }}
                  />
                  <div className="mt-2 text-center">
                    <div className="text-white font-mono text-sm">{data.day}</div>
                    <div className="text-yellow-400 font-mono text-xs font-bold">{data.hours.toFixed(1)}h</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Work Pattern
        <div>
          <h2 className="text-white font-mono text-xl font-bold mb-4">Work Pattern</h2>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="space-y-2">
              {workPattern.map((pattern) => (
                <div key={pattern.day} className="flex items-center gap-4">
                  <div className="w-12 text-white font-mono text-sm">{pattern.day}</div>
                  <div className="flex gap-1 flex-1">
                    {pattern.hours.map((intensity, hour) => (
                      <div
                        key={hour}
                        className={`h-4 w-2 rounded-sm ${
                          intensity > 0 ? (intensity > 1 ? "bg-yellow-500" : "bg-yellow-600") : "bg-gray-700"
                        }`}
                        title={`${hour}:00 - ${intensity.toFixed(1)}h`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div> */}

      {/* Bottom Navigation */}
      <div className="bg-gray-800 border-t border-gray-700">
        <div className="flex justify-around items-center py-4 px-4">
          <Link href="/" className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-300">
            <Clock className="w-6 h-6" />
            <span className="text-xs font-medium">Track</span>
          </Link>
          <Link href="/history" className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-300">
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
          <Link href="/stats" className="flex flex-col items-center gap-1 text-yellow-400">
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
    </div>
  )
}
