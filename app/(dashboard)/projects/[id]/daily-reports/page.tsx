'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Plus, Search, Users, AlertTriangle, Calendar, Sun, Cloud, CloudRain, CloudLightning, Wind, CloudFog } from 'lucide-react'
import { getProjectDailyReports, getDailyReportStats } from '@/lib/queries/daily-reports'
import type { DailyReport, WeatherCondition } from '@/lib/types'
import DailyReportCard from '@/components/daily-reports/DailyReportCard'
import DailyReportFormModal from '@/components/daily-reports/DailyReportFormModal'

const WEATHER_ICONS: Record<WeatherCondition, React.ReactNode> = {
  Sunny: <Sun className="w-4 h-4" />,
  Cloudy: <Cloud className="w-4 h-4" />,
  Rainy: <CloudRain className="w-4 h-4" />,
  Stormy: <CloudLightning className="w-4 h-4" />,
  Windy: <Wind className="w-4 h-4" />,
  Foggy: <CloudFog className="w-4 h-4" />,
}

export default function DailyReportsPage() {
  const params = useParams()
  const projectId = params.id as string
  const [reports, setReports] = useState<DailyReport[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editReport, setEditReport] = useState<DailyReport | null>(null)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    loadReports()
    loadStats()
  }, [projectId])

  const loadReports = async () => {
    setLoading(true)
    try {
      const data = await getProjectDailyReports(projectId)
      setReports(data)
    } catch (error) {
      console.error('Error loading daily reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const data = await getDailyReportStats(projectId)
      setStats(data)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const filtered = reports.filter((r) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      r.completed_works.toLowerCase().includes(q) ||
      r.weather?.toLowerCase().includes(q) ||
      r.notes?.toLowerCase().includes(q)
    )
  })

  const handleSave = async () => {
    await loadReports()
    await loadStats()
    setShowForm(false)
    setEditReport(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Daily Reports</h1>
          <p className="text-slate-400 text-sm mt-1">Track daily progress, manpower, and incidents</p>
        </div>
        <button
          onClick={() => {
            setEditReport(null)
            setShowForm(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition"
        >
          <Plus className="w-4 h-4" /> New Report
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="text-2xl font-bold text-white">{stats.totalReports}</div>
            <div className="text-xs text-slate-400 mt-1">Total Reports</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="text-2xl font-bold text-white">{stats.totalManpower}</div>
            <div className="text-xs text-slate-400 mt-1">Total Manpower</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="text-2xl font-bold text-white">{stats.avgCrew}</div>
            <div className="text-xs text-slate-400 mt-1">Avg Crew/Day</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="text-2xl font-bold text-white">{stats.avgContractors}</div>
            <div className="text-xs text-slate-400 mt-1">Avg Contractors/Day</div>
          </div>
          <div className={`rounded-lg p-4 border ${stats.safetyIncidents > 0 ? 'bg-red-950/50 border-red-900' : 'bg-slate-800 border-slate-700'}`}>
            <div className={`text-2xl font-bold ${stats.safetyIncidents > 0 ? 'text-red-400' : 'text-white'}`}>{stats.safetyIncidents}</div>
            <div className={`text-xs mt-1 ${stats.safetyIncidents > 0 ? 'text-red-400/70' : 'text-slate-400'}`}>Safety Incidents</div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search reports..."
          className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No daily reports yet</p>
          <p className="text-xs mt-1">Create your first daily report to start tracking progress</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((report) => (
            <DailyReportCard
              key={report.id}
              report={report}
              onEdit={() => {
                setEditReport(report)
                setShowForm(true)
              }}
              onRefresh={loadReports}
            />
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <DailyReportFormModal
          projectId={projectId}
          report={editReport}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false)
            setEditReport(null)
          }}
        />
      )}
    </div>
  )
}