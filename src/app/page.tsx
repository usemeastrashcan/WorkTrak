"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Clock, History, FileText, DollarSign, BarChart3, Settings, Play, Pause, Square } from "lucide-react"
import { supabase } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { Power } from 'lucide-react' // Import an icon

import Link from "next/link"
import "@/app/globals.css" 

type Company = "VedaAI" | "CK" | "BrandSurge"
type TimerState = "ready" | "running" | "paused"

interface CompanyOption {
  name: Company
  type: string
  color: string
}

const companies: CompanyOption[] = [
  { name: "VedaAI", type: "Contract-based", color: "bg-blue-600" },
  { name: "CK", type: "Hourly", color: "bg-green-600" },
  { name: "BrandSurge", type: "Monthly", color: "bg-purple-600" },
]

export default function TimeTrackingPage() {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [timerState, setTimerState] = useState<TimerState>("ready")
  const [seconds, setSeconds] = useState(0)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [todayTotal, setTodayTotal] = useState(0) // 03:45:12 in seconds
  const [isSubmitting, setIsSubmitting] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (timerState === "running") {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [timerState])

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60
    return {
      hours: hours.toString().padStart(2, "0"),
      minutes: minutes.toString().padStart(2, "0"),
      seconds: secs.toString().padStart(2, "0"),
    }
  }

  const formatTodayTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleClockIn = () => {
    if (!selectedCompany) return

    setStartTime(new Date())
    setTimerState("running")
    setSeconds(0)
  }

  const handlePause = () => {
    setTimerState("paused")
  }

  const handleResume = () => {
    setTimerState("running")
  }

  const handleSubmit = async () => {
    if (!selectedCompany || !startTime) return

    setIsSubmitting(true)


    try {
    const endTime = new Date(startTime.getTime() + seconds * 1000);

    const response = await fetch("/api/timer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        company: selectedCompany,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),         // ✅ include this
        duration: seconds / 3600,
        isSubmitted: true,
      }),
    });

      const result = await response.json()

      if (result.success) {
        // Reset timer
        setTimerState("ready")
        setSeconds(0)
        setStartTime(null)
        setSelectedCompany(null)
        // Update today's total
        setTodayTotal((prev) => prev + seconds)
      } else {
        console.error("Failed to submit:", result.error)
        alert("Failed to submit time entry. Please try again.")
      }
    } catch (error) {
      console.error("Error submitting:", error)
      alert("Error submitting time entry. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }
      const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }



  const currentTime = formatTime(seconds)
  const isClockInDisabled = !selectedCompany || timerState !== "ready"

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Main Content */}
      
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 gap-5">
        <button
      onClick={handleLogout}
      className="flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition-colors"
    >
      <Power className="w-5 h-5" />
      <span className="font-mono text-sm">Logout</span>
    </button>
        {/* Company Selection */}
        {timerState === "ready" && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-center text-gray-300">Select Company</h2>
            <div className="flex gap-4 flex-wrap justify-center">
              {companies.map((company) => (
                <button
                  key={company.name}
                  onClick={() => setSelectedCompany(company.name)}
                  className={`px-6 py-3 rounded-lg border-2 transition-all ${
                    selectedCompany === company.name
                      ? "border-yellow-500 bg-yellow-500/20 text-yellow-400"
                      : "border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500"
                  }`}
                >
                  <div className="text-center">
                    <div className="font-semibold">{company.name}</div>
                    <div className="text-sm opacity-75">{company.type}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Status */}
        <div className="mb-8">
          <div className="bg-gray-800 px-6 py-2 rounded-lg border border-gray-700">
            <span className="text-gray-400 font-mono text-sm tracking-wider">
              {timerState === "ready" ? "READY" : timerState === "running" ? "RUNNING" : "PAUSED"}
            </span>
          </div>
        </div>

        {/* Timer Display */}
        <div className="mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              {/* Hours */}
              <div className="text-center">
                <div className="text-6xl font-mono font-bold text-yellow-400 tracking-wider">{currentTime.hours}</div>
                <div className="text-gray-400 text-sm font-mono tracking-wider mt-2">HOURS</div>
              </div>

              <div className="text-6xl font-mono font-bold text-yellow-400">:</div>

              {/* Minutes */}
              <div className="text-center">
                <div className="text-6xl font-mono font-bold text-yellow-400 tracking-wider">{currentTime.minutes}</div>
                <div className="text-gray-400 text-sm font-mono tracking-wider mt-2">MINUTES</div>
              </div>

              <div className="text-6xl font-mono font-bold text-yellow-400">:</div>

              {/* Seconds */}
              <div className="text-center">
                <div className="text-6xl font-mono font-bold text-yellow-400 tracking-wider">{currentTime.seconds}</div>
                <div className="text-gray-400 text-sm font-mono tracking-wider mt-2">SECONDS</div>
              </div>
            </div>
          </div>
        </div>

        {/* Today Total */}
        <div className="mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-lg px-6 py-3 flex items-center gap-3">
            <Clock className="w-5 h-5 text-gray-400" />
            <span className="text-gray-400 font-mono">Today:</span>
            <span className="text-yellow-400 font-mono font-bold">{formatTodayTime(todayTotal)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-4">
          {timerState === "ready" && (
            <Button
              onClick={handleClockIn}
              disabled={isClockInDisabled}
              className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-700 disabled:text-gray-500 text-black font-semibold px-8 py-4 text-lg border-2 border-yellow-500 disabled:border-gray-600"
            >
              <Play className="w-5 h-5 mr-2" />
              CLOCK IN
            </Button>
          )}

          {timerState === "running" && (
            <>
              <Button
                onClick={handlePause}
                className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-4 text-lg border-2 border-orange-500"
              >
                <Pause className="w-5 h-5 mr-2" />
                PAUSE
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white font-semibold px-6 py-4 text-lg border-2 border-green-500 disabled:border-gray-600"
              >
                <Square className="w-5 h-5 mr-2" />
                {isSubmitting ? "SUBMITTING..." : "SUBMIT"}
              </Button>
            </>
          )}

          {timerState === "paused" && (
            <>
              <Button
                onClick={handleResume}
                className="bg-yellow-600 hover:bg-yellow-700 text-black font-semibold px-6 py-4 text-lg border-2 border-yellow-500"
              >
                <Play className="w-5 h-5 mr-2" />
                RESUME
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white font-semibold px-6 py-4 text-lg border-2 border-green-500 disabled:border-gray-600"
              >
                <Square className="w-5 h-5 mr-2" />
                {isSubmitting ? "SUBMITTING..." : "SUBMIT"}
              </Button>
            </>
          )}
        </div>

        {/* Selected Company Display */}
        {selectedCompany && timerState !== "ready" && (
          <div className="mt-6">
            <div className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2">
              <span className="text-gray-400 text-sm">Working for: </span>
              <span className="text-yellow-400 font-semibold">{selectedCompany}</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="bg-gray-800 border-t border-gray-700">
        <div className="flex justify-around items-center py-4 px-4">
          <Link href="/" className="flex flex-col items-center gap-1 text-yellow-400">
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
