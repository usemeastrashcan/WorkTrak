"use client"

import { useState, useEffect } from "react"
import {
  Download,
  Search,
  Calendar,
  Clock,
  History,
  FileText,
  DollarSign,
  BarChart3,
  Settings,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

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

type DateRange = "week" | "month" | "custom"

export default function ReportsPage() {
  const [entries, setEntries] = useState<WorkEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<DateRange>("week")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [selectedJob, setSelectedJob] = useState("All Jobs")
  const [sortBy, setSortBy] = useState("Date")
  const [sortOrder, setSortOrder] = useState("Newest First")
  const [searchTerm, setSearchTerm] = useState("")
  const [downloading, setDownloading] = useState(false)
  
  // New state for rate inputs
  const [contractAmount, setContractAmount] = useState("")
  const [hourlyRate, setHourlyRate] = useState("")
  const [monthlySalary, setMonthlySalary] = useState("")
  const [customRates, setCustomRates] = useState({
    VedaAI: 45,
    CK: 35,
    BrandSurge: 40
  })

  useEffect(() => {
    fetchEntries()
    const today = new Date()
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    setStartDate(weekAgo.toISOString().split("T")[0])
    setEndDate(today.toISOString().split("T")[0])
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

  const handleDownloadReport = async () => {
    setDownloading(true)
    try {
      const response = await fetch("/api/reports")
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "combined_report.xlsx"
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert("Failed to download report")
      }
    } catch (error) {
      console.error("Error downloading report:", error)
      alert("Error downloading report")
    } finally {
      setDownloading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
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

  const calculateEarnings = (duration: number, company: string) => {
    // Use custom rates if available, otherwise fall back to defaults
    const rate = customRates[company as keyof typeof customRates] || 35
    return (duration * rate).toFixed(2)
  }

  const handleJobChange = (job: string) => {
    setSelectedJob(job)
    // Reset all rate inputs when job changes
    setContractAmount("")
    setHourlyRate("")
    setMonthlySalary("")
  }

  const updateCustomRates = () => {
    if (selectedJob === "VedaAI" && contractAmount) {
      // Calculate hourly rate based on contract amount (assuming 160 hours/month)
      const hourly = parseFloat(contractAmount) / 160
      setCustomRates(prev => ({ ...prev, VedaAI: hourly }))
    } else if (selectedJob === "CK" && hourlyRate) {
      setCustomRates(prev => ({ ...prev, CK: parseFloat(hourlyRate) }))
    } else if (selectedJob === "BrandSurge" && monthlySalary) {
      // Calculate hourly rate based on monthly salary (assuming 160 hours/month)
      const hourly = parseFloat(monthlySalary) / 160
      setCustomRates(prev => ({ ...prev, BrandSurge: hourly }))
    }
  }

  // Filter entries
  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.startTime.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesJob = selectedJob === "All Jobs" || entry.company === selectedJob
    const entryDate = entry.created_at.split("T")[0]
    const isInDateRange = (!startDate || entryDate >= startDate) && (!endDate || entryDate <= endDate)
    return matchesSearch && matchesJob && isInDateRange
  })

  // Sort entries
  const sortedEntries = [...filteredEntries].sort((a, b) => {
    if (sortBy === "Date") {
      const aDate = new Date(a.created_at).getTime()
      const bDate = new Date(b.created_at).getTime()
      return sortOrder === "Newest First" ? bDate - aDate : aDate - bDate
    }
    return 0
  })

  const groupedEntries = sortedEntries.reduce((groups, entry) => {
    const date = new Date(entry.created_at).toDateString()
    if (!groups[date]) groups[date] = []
    groups[date].push(entry)
    return groups
  }, {} as GroupedEntries)

  const totalHours = sortedEntries.reduce((sum, entry) => sum + entry.duration, 0)
  const totalEarnings = sortedEntries.reduce((sum, entry) => {
    return sum + Number.parseFloat(calculateEarnings(entry.duration, entry.company))
  }, 0)

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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-mono font-bold text-white">Time Reports</h1>
          <Button
            onClick={handleDownloadReport}
            disabled={downloading}
            className="bg-yellow-600 hover:bg-yellow-700 text-black font-mono font-semibold px-4 py-2 border-2 border-yellow-500"
          >
            <Download className="w-4 h-4 mr-2" />
            {downloading ? "Downloading..." : "Download Excel"}
          </Button>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          {/* Date Range */}
          <div>
            <label className="block text-gray-400 font-mono text-sm mb-2">Date Range</label>
            <div className="flex gap-4">
              <button
                onClick={() => setDateRange("week")}
                className={`px-4 py-2 font-mono text-sm border-2 rounded ${
                  dateRange === "week"
                    ? "border-gray-600 bg-gray-700 text-white"
                    : "border-gray-600 text-gray-400 hover:border-gray-500"
                }`}
              >
                This Week
              </button>
              <button
                onClick={() => setDateRange("month")}
                className={`px-4 py-2 font-mono text-sm border-2 rounded ${
                  dateRange === "month"
                    ? "border-gray-600 bg-gray-700 text-white"
                    : "border-gray-600 text-gray-400 hover:border-gray-500"
                }`}
              >
                This Month
              </button>
              <button
                onClick={() => setDateRange("custom")}
                className={`px-4 py-2 font-mono text-sm border-2 rounded ${
                  dateRange === "custom"
                    ? "border-yellow-500 bg-yellow-500/20 text-yellow-400"
                    : "border-gray-600 text-gray-400 hover:border-gray-500"
                }`}
              >
                Custom
              </button>
              <select
                value={selectedJob}
                onChange={(e) => handleJobChange(e.target.value)}
                className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white font-mono focus:border-yellow-500 focus:outline-none"
              >
                <option>All Jobs</option>
                <option>VedaAI</option>
                <option>CK</option>
                <option>BrandSurge</option>
              </select>
            </div>
          </div>

          {/* Rate Inputs */}
          {selectedJob === "VedaAI" && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <label className="block text-yellow-400 font-mono text-sm mb-2">VedaAI Contract Amount (£)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={contractAmount}
                  onChange={(e) => setContractAmount(e.target.value)}
                  placeholder="Enter contract amount"
                  className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white font-mono focus:border-yellow-500 focus:outline-none"
                />
                <Button
                  onClick={updateCustomRates}
                  className="bg-yellow-600 hover:bg-yellow-700 text-black font-mono"
                >
                  Apply
                </Button>
              </div>
              {customRates.VedaAI !== 45 && (
                <div className="mt-2 text-gray-300 font-mono text-sm">
                  Calculated Hourly Rate: £{customRates.VedaAI.toFixed(2)}
                </div>
              )}
            </div>
          )}

          {selectedJob === "CK" && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <label className="block text-yellow-400 font-mono text-sm mb-2">CK Hourly Rate (£)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  placeholder="Enter hourly rate"
                  className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white font-mono focus:border-yellow-500 focus:outline-none"
                />
                <Button
                  onClick={updateCustomRates}
                  className="bg-yellow-600 hover:bg-yellow-700 text-black font-mono"
                >
                  Apply
                </Button>
              </div>
            </div>
          )}

          {selectedJob === "BrandSurge" && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <label className="block text-yellow-400 font-mono text-sm mb-2">BrandSurge Monthly Salary (£)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={monthlySalary}
                  onChange={(e) => setMonthlySalary(e.target.value)}
                  placeholder="Enter monthly salary"
                  className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white font-mono focus:border-yellow-500 focus:outline-none"
                />
                <Button
                  onClick={updateCustomRates}
                  className="bg-yellow-600 hover:bg-yellow-700 text-black font-mono"
                >
                  Apply
                </Button>
              </div>
              {customRates.BrandSurge !== 40 && (
                <div className="mt-2 text-gray-300 font-mono text-sm">
                  Calculated Hourly Rate: £{customRates.BrandSurge.toFixed(2)}
                </div>
              )}
            </div>
          )}
{/* 
          Other Filters 
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-gray-400 font-mono text-sm mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white font-mono focus:border-yellow-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-400 font-mono text-sm mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white font-mono focus:border-yellow-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-400 font-mono text-sm mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white font-mono focus:border-yellow-500 focus:outline-none"
              >
                <option>Date</option>
                <option>Duration</option>
                <option>Company</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-400 font-mono text-sm mb-2">Order</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white font-mono focus:border-yellow-500 focus:outline-none"
              >
                <option>Newest First</option>
                <option>Oldest First</option>
              </select>
            </div>
          </div>

          Search 
          <div>
            <label className="block text-gray-400 font-mono text-sm mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded pl-10 pr-3 py-2 text-white font-mono placeholder-gray-400 focus:border-yellow-500 focus:outline-none"
              />
            </div>
          </div> */}
        </div>

        {/* Summary */}
        <div className="flex gap-6 mt-6">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex items-center gap-3">
            <Clock className="w-6 h-6 text-yellow-400" />
            <div>
              <div className="text-gray-400 font-mono text-sm">Total Hours</div>
              <div className="text-yellow-400 font-mono text-2xl font-bold">{totalHours.toFixed(2)}</div>
            </div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-yellow-400" />
            <div>
              <div className="text-gray-400 font-mono text-sm">Total Earnings</div>
              <div className="text-yellow-400 font-mono text-2xl font-bold">£{totalEarnings.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {Object.keys(groupedEntries).length === 0 ? (
          <div className="text-center text-gray-400 font-mono mt-12">No entries found for the selected criteria.</div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedEntries).map(([date, dateEntries]) => (
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
                  {dateEntries.map((entry) => {
                    const startDateObj = new Date(entry.startTime)
                    const endDateObj = new Date(startDateObj.getTime() + entry.duration * 3600000)
                    const startTime = formatTime(entry.startTime)
                    //const endTimeFormatted = formatTime(endDateObj.toISOString())

                    if (!(endDateObj instanceof Date) || isNaN(endDateObj)) {
                        console.error("Invalid endTime:", endDateObj);
                        return;
}
                      const endTimeFormatted = formatTime(endDateObj)


                    const earnings = calculateEarnings(entry.duration, entry.company)
                    const currentRate = customRates[entry.company as keyof typeof customRates] || 35

                    return (
                      <div key={entry.id} className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-mono text-white text-lg mb-1">
                              {startTime} — {endTimeFormatted}
                            </div>
                            <div className="font-mono text-yellow-400 text-lg font-semibold mb-2">
                              {formatDuration(entry.duration)}
                            </div>
                            <div className="text-gray-400 font-mono text-sm">
                              <div className="mb-1">{entry.company} • £{currentRate.toFixed(2)}/hr</div>
                              <div className="text-gray-500">Breaks (1)</div>
                              <div className="mt-2 space-y-1">
                                <div className="flex justify-between">
                                  <span>Duration</span>
                                  <span className="text-white">{formatDuration(entry.duration)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Rate</span>
                                  <span className="text-white">£{currentRate.toFixed(2)}/hr</span>
                                </div>
                                <div className="flex justify-between font-semibold">
                                  <span>Total</span>
                                  <span className="text-yellow-400">£{earnings}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-gray-400 font-mono text-sm">Earnings</div>
                            <div className="text-yellow-400 font-mono text-xl font-bold">£{earnings}</div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
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
          <Link href="/history" className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-300">
            <History className="w-6 h-6" />
            <span className="text-xs font-medium">History</span>
          </Link>
          <Link href="/reports" className="flex flex-col items-center gap-1 text-yellow-400">
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