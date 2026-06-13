'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Plus,
  AlertTriangle,
  Image,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  PauseCircle,
} from 'lucide-react'
import { getProjectDefects, deleteDefect, getDefectStatistics } from '@/lib/queries/defects'
import DefectFormModal from '@/components/defects/DefectFormModal'
import type { Defect, DefectStatus, DefectSeverity } from '@/lib/types'

const SEVERITY_CONFIG: Record<DefectSeverity, { label: string; className: string }> = {
  Low:      { label: 'Low',      className: 'bg-slate-700 text-slate-300' },
  Medium:   { label: 'Medium',   className: 'bg-yellow-900/60 text-yellow-300' },
  High:     { label: 'High',     className: 'bg-orange-900/60 text-orange-300' },
  Critical: { label: 'Critical', className: 'bg-red-900/60 text-red-300' },
}

const STATUS_CONFIG: Record<DefectStatus, { label: string; icon: React.ReactNode; className: string }> = {
  'Open':        { label: 'Open',        icon: <AlertTriangle className="w-3.5 h-3.5" />, className: 'bg-red-900/60 text-red-300' },
  'In Progress': { label: 'In Progress', icon: <Clock className="w-3.5 h-3.5" />,         className: 'bg-blue-900/60 text-blue-300' },
  'Closed':      { label: 'Closed',      icon: <CheckCircle2 className="w-3.5 h-3.5" />,  className: 'bg-emerald-900/60 text-emerald-300' },
  'Deferred':    { label: 'Deferred',    icon: <PauseCircle className="w-3.5 h-3.5" />,   className: 'bg-slate-700 text-slate-300' },
}

const LOCATION_EMOJI: Record<string, string> = {
  Deck: '🛳️',
  'Engine Room': '⚙️',
  Hull: '🔩',
  Propeller: '🌀',
  Rudder: '🚢',
  Valves: '🔧',
  Piping: '🔗',
  Electrical: '⚡',
  Other: '📍',
}

export default function DefectsPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [defects, setDefects] = useState<Defect[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editDefect, setEditDefect] = useState<Defect | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('All')
  const [filterSeverity, setFilterSeverity] = useState<string>('All')
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, closed: 0, critical: 0, high: 0 })

  const loadData = async () => {
    setLoading(true)
    try {
      const [data, statData] = await Promise.all([
        getProjectDefects(projectId),
        getDefectStatistics(projectId),
      ])
      setDefects(data)
      setStats(statData)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [projectId])

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this defect?')) return
    try {
      await deleteDefect(id)
      loadData()
    } catch (e) {
      console.error(e)
    }
  }

  const filtered = defects.filter((d) => {
    const matchStatus = filterStatus === 'All' || d.status === filterStatus
    const matchSev = filterSeverity === 'All' || d.severity === filterSeverity
    return matchStatus && matchSev
  })

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => router.push(`/projects/${projectId}`)}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Project
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-red-900/40 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Defect List</h1>
                <p className="text-xs text-slate-400">{stats.total} total · {stats.open} open · {stats.critical} critical</p>
              </div>
            </div>
            <button
              onClick={() => { setEditDefect(null); setShowModal(true) }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Report Defect
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Open', value: stats.open, color: 'text-red-400', bg: 'bg-red-900/20 border-red-900/40' },
            { label: 'In Progress', value: stats.inProgress, color: 'text-blue-400', bg: 'bg-blue-900/20 border-blue-900/40' },
            { label: 'Closed', value: stats.closed, color: 'text-emerald-400', bg: 'bg-emerald-900/20 border-emerald-900/40' },
            { label: 'Critical', value: stats.critical, color: 'text-orange-400', bg: 'bg-orange-900/20 border-orange-900/40' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`rounded-xl border p-4 ${bg}`}>
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-xs text-slate-400 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            Filter:
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
          >
            <option value="All">All Statuses</option>
            {(['Open', 'In Progress', 'Closed', 'Deferred'] as DefectStatus[]).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
          >
            <option value="All">All Severities</option>
            {(['Low', 'Medium', 'High', 'Critical'] as DefectSeverity[]).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {(filterStatus !== 'All' || filterSeverity !== 'All') && (
            <button
              onClick={() => { setFilterStatus('All'); setFilterSeverity('All') }}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
          <span className="text-xs text-slate-500 ml-auto">{filtered.length} defects</span>
        </div>

        {/* Defect List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium">No defects found</p>
            <p className="text-xs mt-1">
              {filterStatus !== 'All' || filterSeverity !== 'All'
                ? 'Try changing your filters'
                : 'Report your first defect using the button above'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((defect) => {
              const sev = SEVERITY_CONFIG[defect.severity]
              const stat = STATUS_CONFIG[defect.status]
              const locEmoji = LOCATION_EMOJI[defect.location] || '📍'

              return (
                <div
                  key={defect.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Photos */}
                    <div className="flex gap-2 shrink-0">
                      {defect.photo_before_url ? (
                        <button
                          onClick={() => setLightboxUrl(defect.photo_before_url!)}
                          className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-700 hover:border-blue-500 transition group"
                        >
                          <img
                            src={defect.photo_before_url}
                            alt="Before"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-end justify-center pb-0.5">
                            <span className="text-[9px] text-white/0 group-hover:text-white/90 font-medium transition">BEFORE</span>
                          </div>
                        </button>
                      ) : (
                        <div className="w-16 h-16 rounded-lg border-2 border-dashed border-slate-700 flex items-center justify-center">
                          <Image className="w-5 h-5 text-slate-600" />
                        </div>
                      )}
                      {defect.photo_after_url ? (
                        <button
                          onClick={() => setLightboxUrl(defect.photo_after_url!)}
                          className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-700 hover:border-blue-500 transition group"
                        >
                          <img
                            src={defect.photo_after_url}
                            alt="After"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-end justify-center pb-0.5">
                            <span className="text-[9px] text-white/0 group-hover:text-white/90 font-medium transition">AFTER</span>
                          </div>
                        </button>
                      ) : (
                        <div className="w-16 h-16 rounded-lg border-2 border-dashed border-slate-700 flex items-center justify-center">
                          <Image className="w-5 h-5 text-slate-600" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start gap-2 mb-1">
                        <h3 className="font-semibold text-white text-sm leading-tight">{defect.title}</h3>
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${stat.className}`}>
                          {stat.icon}
                          {stat.label}
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sev.className}`}>
                          {sev.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mb-1.5">
                        <span>{locEmoji} {defect.location}</span>
                        <span>·</span>
                        <span>{new Date(defect.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                      {defect.description && (
                        <p className="text-xs text-slate-400 line-clamp-2">{defect.description}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => { setEditDefect(defect); setShowModal(true) }}
                        className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(defect.id)}
                        className="px-3 py-1.5 text-xs bg-red-950/60 hover:bg-red-900/60 rounded-lg text-red-400 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Photo Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <img
            src={lightboxUrl}
            alt="Full size"
            className="max-w-full max-h-full rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/80 rounded-lg text-white transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Form Modal */}
      {showModal && (
        <DefectFormModal
          projectId={projectId}
          defect={editDefect}
          onSave={() => { setShowModal(false); setEditDefect(null); loadData() }}
          onClose={() => { setShowModal(false); setEditDefect(null) }}
        />
      )}
    </div>
  )
}
