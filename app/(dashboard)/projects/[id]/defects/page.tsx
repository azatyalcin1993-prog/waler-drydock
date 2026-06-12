'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Plus, Search, Filter, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getProjectDefects, getDefectStatistics } from '@/lib/queries/defects'
import type { Defect, DefectSeverity, DefectStatus, DefectLocation } from '@/lib/types'
import DefectFormModal from '@/components/defects/DefectFormModal'
import DefectCard from '@/components/defects/DefectCard'

const SEVERITY_COLORS = {
  Critical: 'text-red-400 bg-red-950',
  High: 'text-orange-400 bg-orange-950',
  Medium: 'text-yellow-400 bg-yellow-950',
  Low: 'text-blue-400 bg-blue-950',
}

const STATUS_ICONS = {
  Open: <AlertTriangle className="w-4 h-4" />,
  'In Progress': <Clock className="w-4 h-4" />,
  Closed: <CheckCircle className="w-4 h-4" />,
  Deferred: <Clock className="w-4 h-4" />,
}

export default function DefectsPage() {
  const params = useParams()
  const projectId = params.id as string
  const [defects, setDefects] = useState<Defect[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<DefectStatus | 'All'>('All')
  const [filterSeverity, setFilterSeverity] = useState<DefectSeverity | 'All'>('All')
  const [filterLocation, setFilterLocation] = useState<DefectLocation | 'All'>('All')
  const [showForm, setShowForm] = useState(false)
  const [editDefect, setEditDefect] = useState<Defect | null>(null)
  const [stats, setStats] = useState<any>(null)

  const supabase = createClient()

  useEffect(() => {
    loadDefects()
    loadStats()
  }, [projectId])

  const loadDefects = async () => {
    setLoading(true)
    try {
      const data = await getProjectDefects(projectId)
      setDefects(data)
    } catch (error) {
      console.error('Error loading defects:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const data = await getDefectStatistics(projectId)
      setStats(data)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const filtered = defects.filter((d) => {
    const matchSearch = !search ||
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.description?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'All' || d.status === filterStatus
    const matchSeverity = filterSeverity === 'All' || d.severity === filterSeverity
    const matchLocation = filterLocation === 'All' || d.location === filterLocation
    return matchSearch && matchStatus && matchSeverity && matchLocation
  })

  const handleSave = async () => {
    await loadDefects()
    await loadStats()
    setShowForm(false)
    setEditDefect(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Defects</h1>
          <p className="text-slate-400 text-sm mt-1">Track and manage discovered defects</p>
        </div>
        <button
          onClick={() => {
            setEditDefect(null)
            setShowForm(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition"
        >
          <Plus className="w-4 h-4" /> New Defect
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-xs text-slate-400 mt-1">Total Defects</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="text-2xl font-bold text-white">{stats.open}</div>
            <div className="text-xs text-slate-400 mt-1">Open</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="text-2xl font-bold text-white">{stats.inProgress}</div>
            <div className="text-xs text-slate-400 mt-1">In Progress</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="text-2xl font-bold text-white">{stats.closed}</div>
            <div className="text-xs text-slate-400 mt-1">Closed</div>
          </div>
          <div className="bg-red-950/50 rounded-lg p-4 border border-red-900">
            <div className="text-2xl font-bold text-red-400">{stats.critical}</div>
            <div className="text-xs text-red-400/70 mt-1">Critical</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search defects..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as DefectStatus | 'All')}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
        >
          <option>All Status</option>
          <option>Open</option>
          <option>In Progress</option>
          <option>Closed</option>
          <option>Deferred</option>
        </select>
        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value as DefectSeverity | 'All')}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
        >
          <option>All Severity</option>
          <option>Critical</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
        <select
          value={filterLocation}
          onChange={(e) => setFilterLocation(e.target.value as DefectLocation | 'All')}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
        >
          <option value="All">All Locations</option>
          <option>Deck</option>
          <option>Engine Room</option>
          <option>Hull</option>
          <option>Propeller</option>
          <option>Rudder</option>
          <option>Valves</option>
          <option>Piping</option>
          <option>Electrical</option>
          <option>Other</option>
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          No defects found. Create your first defect to get started.
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((defect) => (
            <DefectCard
              key={defect.id}
              defect={defect}
              onEdit={() => {
                setEditDefect(defect)
                setShowForm(true)
              }}
              onRefresh={loadDefects}
            />
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <DefectFormModal
          projectId={projectId}
          defect={editDefect}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false)
            setEditDefect(null)
          }}
        />
      )}
    </div>
  )
}
