'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { createDefect, updateDefect } from '@/lib/queries/defects'
import type { Defect } from '@/lib/types'
import DefectPhotoUpload from './DefectPhotoUpload'

const LOCATIONS = ['Deck', 'Engine Room', 'Hull', 'Propeller', 'Rudder', 'Valves', 'Piping', 'Electrical', 'Other'] as const
const SEVERITIES = ['Low', 'Medium', 'High', 'Critical'] as const
const STATUSES = ['Open', 'In Progress', 'Closed', 'Deferred'] as const

interface DefectFormModalProps {
  projectId: string
  defect?: Defect | null
  onSave: () => void
  onClose: () => void
}

export default function DefectFormModal({ projectId, defect, onSave, onClose }: DefectFormModalProps) {
  const [form, setForm] = useState({
    title: defect?.title || '',
    description: defect?.description || '',
    location: defect?.location || 'Deck',
    severity: defect?.severity || 'Medium',
    status: defect?.status || 'Open',
    photo_before_url: defect?.photo_before_url || '',
    photo_after_url: defect?.photo_after_url || '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const payload = {
        project_id: projectId,
        title: form.title,
        description: form.description,
        location: form.location,
        severity: form.severity,
        status: form.status,
        photo_before_url: form.photo_before_url || null,
        photo_after_url: form.photo_after_url || null,
        reported_by: user.id,
      }

      if (defect) {
        await updateDefect(defect.id, payload)
      } else {
        await createDefect(payload as any)
      }

      onSave()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-2xl bg-slate-900 rounded-t-2xl sm:rounded-2xl border border-slate-700 z-10 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 sticky top-0 bg-slate-900">
          <h2 className="text-xl font-semibold text-white">
            {defect ? 'Edit Defect' : 'New Defect'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-950/50 border border-red-900 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Title & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-2">
                Title *
              </label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Rust on deck plate"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-2">
                Location *
              </label>
              <select
                required
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-2">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Detailed description of the defect..."
              rows={3}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition resize-none"
            />
          </div>

          {/* Severity & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-2">
                Severity *
              </label>
              <select
                required
                value={form.severity}
                onChange={(e) => setForm({ ...form, severity: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
              >
                {SEVERITIES.map((sev) => (
                  <option key={sev}>{sev}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-2">
                Status *
              </label>
              <select
                required
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
              >
                {STATUSES.map((stat) => (
                  <option key={stat}>{stat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Photo Upload */}
          <DefectPhotoUpload
            photoBefore={form.photo_before_url}
            photoAfter={form.photo_after_url}
            onPhotoBeforeChange={(url) => setForm({ ...form, photo_before_url: url || '' })}
            onPhotoAfterChange={(url) => setForm({ ...form, photo_after_url: url || '' })}
          />

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-800 font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 rounded-lg text-white font-medium transition"
            >
              {loading ? 'Saving...' : defect ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
