'use client'

import { useState, useEffect } from 'react'
import { X, Upload, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { createDailyReport, updateDailyReport, getDailyReportByDate } from '@/lib/queries/daily-reports'
import type { DailyReport, WeatherCondition } from '@/lib/types'

const WEATHERS: WeatherCondition[] = ['Sunny', 'Cloudy', 'Rainy', 'Stormy', 'Windy', 'Foggy']

interface DailyReportFormModalProps {
  projectId: string
  report?: DailyReport | null
  onSave: () => void
  onClose: () => void
}

export default function DailyReportFormModal({ projectId, report, onSave, onClose }: DailyReportFormModalProps) {
  const [form, setForm] = useState({
    project_id: projectId,
    report_date: report?.report_date || new Date().toISOString().split('T')[0],
    weather: report?.weather || 'Sunny',
    temperature: report?.temperature || '',
    crew_count: report?.crew_count || 0,
    contractor_count: report?.contractor_count || 0,
    completed_works: report?.completed_works || '',
    delay_reasons: report?.delay_reasons || '',
    safety_incidents: report?.safety_incidents || '',
    photos: report?.photos || [],
    notes: report?.notes || '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [existingReport, setExistingReport] = useState<DailyReport | null>(null)
  const supabase = createClient()

  // Check for existing report on same date
  useEffect(() => {
    if (!report && form.report_date) {
      getDailyReportByDate(projectId, form.report_date).then(existing => {
        setExistingReport(existing)
      })
    }
  }, [form.report_date, projectId, report])

  const handlePhotoUpload = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const uploadedUrls: string[] = []
      for (const file of files) {
        const fileExt = file.name.split('.').pop()
        const filePath = `daily-reports/${projectId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`
        const { data, error } = await supabase.storage.from('photos').upload(filePath, file)
        if (error) throw error
        const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(filePath)
        uploadedUrls.push(publicUrl)
      }
      setForm({ ...form, photos: [...form.photos, ...uploadedUrls] })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const removePhoto = (idx: number) => {
    setForm({ ...form, photos: form.photos.filter((_, i) => i !== idx) })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const payload = {
        project_id: projectId,
        report_date: form.report_date,
        weather: form.weather,
        temperature: form.temperature || null,
        crew_count: Number(form.crew_count),
        contractor_count: Number(form.contractor_count),
        completed_works: form.completed_works,
        delay_reasons: form.delay_reasons || null,
        safety_incidents: form.safety_incidents || null,
        photos: form.photos,
        notes: form.notes || null,
        created_by: user.id,
      }

      if (report) {
        await updateDailyReport(report.id, payload)
      } else {
        await createDailyReport(payload as any)
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
            {report ? 'Edit Daily Report' : 'New Daily Report'}
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

          {existingReport && !report && (
            <div className="bg-amber-950/50 border border-amber-900 rounded-lg p-3 text-amber-400 text-sm">
              A report already exists for this date. You can edit the existing one instead.
            </div>
          )}

          {/* Date & Weather */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-2">Date *</label>
              <input
                required
                type="date"
                value={form.report_date}
                onChange={(e) => setForm({ ...form, report_date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 outline-none transition"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-2">Weather</label>
              <select
                value={form.weather}
                onChange={(e) => setForm({ ...form, weather: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 outline-none transition"
              >
                {WEATHERS.map((w) => <option key={w}>{w}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-2">Temperature</label>
              <input
                value={form.temperature}
                onChange={(e) => setForm({ ...form, temperature: e.target.value })}
                placeholder="e.g. 28°C"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 outline-none transition"
              />
            </div>
          </div>

          {/* Manpower */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-2">Own Crew Count</label>
              <input
                type="number"
                min="0"
                value={form.crew_count}
                onChange={(e) => setForm({ ...form, crew_count: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 outline-none transition"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-2">Contractor Count</label>
              <input
                type="number"
                min="0"
                value={form.contractor_count}
                onChange={(e) => setForm({ ...form, contractor_count: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 outline-none transition"
              />
            </div>
          </div>

          {/* Completed Works */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-2">Completed Works *</label>
            <textarea
              required
              value={form.completed_works}
              onChange={(e) => setForm({ ...form, completed_works: e.target.value })}
              placeholder="Describe the work completed today..."
              rows={3}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 outline-none transition resize-none"
            />
          </div>

          {/* Delay Reasons */}
          <div>
            <label className="text-xs font-medium text-amber-400 block mb-2">Delay Reasons</label>
            <textarea
              value={form.delay_reasons}
              onChange={(e) => setForm({ ...form, delay_reasons: e.target.value })}
              placeholder="Any delays or issues encountered..."
              rows={2}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 outline-none transition resize-none"
            />
          </div>

          {/* Safety Incidents */}
          <div>
            <label className="text-xs font-medium text-red-400 block mb-2">Safety Incidents</label>
            <textarea
              value={form.safety_incidents}
              onChange={(e) => setForm({ ...form, safety_incidents: e.target.value })}
              placeholder="Any safety incidents or near misses..."
              rows={2}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 outline-none transition resize-none"
            />
          </div>

          {/* Photos */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-2">Photos</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.photos.map((url, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-700 group">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              ))}
              <label className="w-20 h-20 rounded-lg border-2 border-dashed border-slate-700 hover:border-blue-500 flex items-center justify-center cursor-pointer transition">
                <Upload className="w-5 h-5 text-slate-500" />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handlePhotoUpload(e.target.files)}
                />
              </label>
            </div>
            {uploading && <p className="text-xs text-blue-400 animate-pulse">Uploading...</p>}
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-2">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Additional notes..."
              rows={2}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 outline-none transition resize-none"
            />
          </div>

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
              {loading ? 'Saving...' : report ? 'Update' : 'Create Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}