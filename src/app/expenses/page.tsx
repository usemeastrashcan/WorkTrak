"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Calendar,
  Clock,
  History,
  FileText,
  DollarSign,
  BarChart3,
  Settings,
  X,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface Expense {
  id?: number
  amount: number
  description: string
  category: string
  subcategory: string
  date: string
  company?: string
}

interface GroupedExpenses {
  [date: string]: Expense[]
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedJob, setSelectedJob] = useState("All Jobs")
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [formData, setFormData] = useState<Expense>({
    amount: 0,
    description: "",
    category: "",
    subcategory: "",
    date: new Date().toISOString().split("T")[0],
    company: "",
  })

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    try {
      const response = await fetch("/api/expenses")
      const result = await response.json()
      if (result.success) {
        setExpenses(result.data)
      }
    } catch (error) {
      console.error("Error fetching expenses:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingExpense ? "/api/expenses" : "/api/expenses"
      const method = editingExpense ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingExpense ? { ...formData, id: editingExpense.id } : formData),
      })

      const result = await response.json()

      if (result.success) {
        await fetchExpenses()
        resetForm()
      } else {
        alert("Error saving expense: " + result.error)
      }
    } catch (error) {
      console.error("Error saving expense:", error)
      alert("Error saving expense")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this expense?")) return

    try {
      const response = await fetch(`/api/expenses?id=${id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        await fetchExpenses()
      } else {
        alert("Error deleting expense: " + result.error)
      }
    } catch (error) {
      console.error("Error deleting expense:", error)
      alert("Error deleting expense")
    }
  }

  const resetForm = () => {
    setFormData({
      amount: 0,
      description: "",
      category: "",
      subcategory: "",
      date: new Date().toISOString().split("T")[0],
      company: "",
    })
    setShowAddForm(false)
    setEditingExpense(null)
  }

  const startEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setFormData(expense)
    setShowAddForm(true)
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

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesJob = selectedJob === "All Jobs" || expense.company === selectedJob
    return matchesSearch && matchesJob
  })

  const groupedExpenses = filteredExpenses.reduce((groups, expense) => {
    const date = new Date(expense.date).toDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(expense)
    return groups
  }, {} as GroupedExpenses)

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const expenseCount = filteredExpenses.length

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
          <h1 className="text-3xl font-mono font-bold text-white">Expenses</h1>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-yellow-600 hover:bg-yellow-700 text-black font-mono font-semibold px-4 py-2 border-2 border-yellow-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white font-mono placeholder-gray-400 focus:border-yellow-500 focus:outline-none"
            />
          </div>
          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white font-mono focus:border-yellow-500 focus:outline-none"
          >
            <option>All Jobs</option>
            <option>VedaAI</option>
            <option>CK</option>
            <option>BrandSurge</option>
          </select>
        </div>

        {/* Summary */}
        <div className="flex justify-between items-center">
          <div>
            <div className="text-gray-400 font-mono text-sm">Total Expenses:</div>
            <div className="text-yellow-400 font-mono text-2xl font-bold">£{totalExpenses.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-gray-400 font-mono text-sm">Count:</div>
            <div className="text-yellow-400 font-mono text-2xl font-bold">{expenseCount} items</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {Object.keys(groupedExpenses).length === 0 ? (
          <div className="text-center text-gray-400 font-mono mt-12">No expenses found.</div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedExpenses).map(([date, dateExpenses]) => (
              <div key={date} className="border border-gray-700 rounded-lg bg-gray-800">
                {/* Date Header */}
                <div className="p-4 border-b border-gray-700">
                  <div className="flex items-center gap-3 text-yellow-400 font-mono">
                    <Calendar className="w-5 h-5" />
                    <span className="text-lg font-semibold">{formatDate(date)}</span>
                  </div>
                </div>

                {/* Expenses */}
                <div className="divide-y divide-gray-700">
                  {dateExpenses.map((expense) => (
                    <div key={expense.id} className="p-4 hover:bg-gray-750">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <span className="text-yellow-400 font-mono text-xl font-bold">
                              £{expense.amount.toFixed(2)}
                            </span>
                            <span className="text-white font-mono text-lg">{expense.description}</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded font-mono text-sm">
                              {expense.category}
                            </span>
                            <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded font-mono text-sm">
                              {expense.subcategory}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(expense)}
                            className="p-2 text-gray-400 hover:text-yellow-400 transition-colors"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => expense.id && handleDelete(expense.id)}
                            className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-mono font-bold text-white">
                {editingExpense ? "Edit Expense" : "Add Expense"}
              </h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-400 font-mono text-sm mb-2">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number.parseFloat(e.target.value) || 0 })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white font-mono focus:border-yellow-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 font-mono text-sm mb-2">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white font-mono focus:border-yellow-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 font-mono text-sm mb-2">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white font-mono focus:border-yellow-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 font-mono text-sm mb-2">Subcategory</label>
                <input
                  type="text"
                  value={formData.subcategory}
                  onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white font-mono focus:border-yellow-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 font-mono text-sm mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white font-mono focus:border-yellow-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 font-mono text-sm mb-2">Company</label>
                <select
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white font-mono focus:border-yellow-500 focus:outline-none"
                >
                  <option value="">Select Company</option>
                  <option value="VedaAI">VedaAI</option>
                  <option value="CK">CK</option>
                  <option value="BrandSurge">BrandSurge</option>
                  
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-black font-mono font-semibold"
                >
                  {editingExpense ? "Update" : "Add"} Expense
                </Button>
                <Button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-mono"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

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
          <Link href="/expenses" className="flex flex-col items-center gap-1 text-yellow-400">
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
