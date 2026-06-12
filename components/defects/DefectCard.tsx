'use client'

import { AlertTriangle, Clock, CheckCircle, Edit, Trash2, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { deleteDefect } from '@/lib/queries/defects'
import type { Defect } from '@/lib/types'
import { format } from 'date-fns'

const SEVERITY_COLORS = {
  Critical: 'bg-red-950 text-red-400 border-red-900',
  High: 'bg-orange-950 text-orange-400 border-orange-900',
  Medium: 'bg-yellow-950 text-yellow-400 border-yellow-900',
  Low: 'bg-blue-950 text-blue-400 border-blue-900',
}

const SEVERITY_ICONS = {
  Critical: <AlertTriangle className="w-4 h-4" />,
  High: <AlertTriangle className="w-4 h-4" />,
  Medium: <Clock className="w-4 h-4" />,
  Low: <CheckCircle className="w-4 h-4" />,
}

const STATUS_COLORS = {
  Open: 'bg-red-950/50 text-red-400',
  'In Progress': 'bg-blue-950/50 text-blue-400',
  Closed: 'bg-green-950/50 text-green-400',
  Deferred: 'bg-slate-800 text-slate-400',
}

interface DefectCardProps {
  defect: Defect
  onEdit: () => void
  onRefresh: () => void
}

export default function DefectCard({ defect, onEdit, onRefresh }: DefectCardProps) {
  const handleDelete = async () => {
    if (!confirm('Delete this defect?')) return

    try {
      await deleteDefect(defect.id)
      onRefresh()
    } catch (error) {
      console.error('Error deleting defect:', error)
    }
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 hover:border-slate-600 transition">
      <div className="flex items-start justify-between gap-4">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-base font-semibold text-white truncate">{defect.title}</h3>
            <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${SEVERITY_COLORS[defect.severity]}`}>
              {SEVERITY_ICONS[defect.severity]}
              {defect.severity}
            </span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[defect.status]}`}>
              {defect.status}
            </span>
          </div>

          {defect.description && (
            <p className="text-sm text-slate-400 mb-2 line-clamp-2">{defect.description}</p>
          )}

          <div className="flex flex-wrap gap-3 text-xs text-slate-500">
            <span>📍 {defect.location}</span>
            <span>📅 {format(new Date(defect.created_at), 'MMM d, yyyy')}</span>
            {defect.closed_at && (
              <span className="text-green-400">✓ Closed {format(new Date(defect.closed_at), 'MMM d')}</span>
            )}
          </div>
        </div>

        {/* Photos Preview */}
        <div className="flex gap-2">
          {defect.photo_before_url && (
            <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-700 group cursor-pointer">
              <img
                src={defect.photo_before_url}
                alt="Before"
                className="w-full h-full object-cover group-hover:scale-110 transition"
                title="Before"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-white font-medium transition">
                Before
              </div>
            </div>
          )}
          {defect.photo_after_url && (
            <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-700 group cursor-pointer">
              <img
                src={defect.photo_after_url}
                alt="After"
                className="w-full h-full object-cover group-hover:scale-110 transition"
                title="After"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-white font-medium transition">
                After
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 shrink-0">
          <button
            onClick={onEdit}
            className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 rounded-lg bg-red-950/50 hover:bg-red-900/50 text-red-400 transition"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
