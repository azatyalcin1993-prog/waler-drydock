'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { statusLabels } from '@/lib/constants'
import type { Job, JobStatus } from '@/lib/types'

interface JobUpdateFormProps {
  job: Job
}

export function JobUpdateForm({ job }: JobUpdateFormProps) {
  const [note, setNote] = useState('')
  const [progress, setProgress] = useState(job.progress ?? 0)
  const [status, setStatus] = useState<JobStatus>(job.status ?? 'beklemede')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const handleUpdate = async () => {
    setSaving(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Oturum bulunamadı.')
      setSaving(false)
      return
    }

    const { error: updateError } = await supabase
      .from('jobs')
      .update({ progress, status, updated_at: new Date().toISOString() })
      .eq('id', job.id)

    if (updateError) {
      setError(updateError.message)
      setSaving(false)
      return
    }

    if (note.trim()) {
      const { error: logError } = await supabase
        .from('job_logs')
        .insert({ job_id: job.id, user_id: user.id, content: note.trim() })

      if (logError) {
        setError(logError.message)
        setSaving(false)
        return
      }
    }

    setSaving(false)
    router.push('/personnel')
  }

  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 space-y-4">
      <h2 className="font-semibold text-sm text-slate-300">Güncelleme Yap</h2>

      <div>
        <label className="text-xs text-slate-400 block mb-2">Durum</label>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(statusLabels).map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => setStatus(val as JobStatus)}
              className={`py-2 px-3 rounded-lg text-sm font-medium transition border ${
                status === val
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-500'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-slate-400 block mb-2">
          İlerleme: <span className="text-white font-semibold">{progress}%</span>
        </label>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={progress}
          onChange={(e) => setProgress(Number(e.target.value))}
          className="w-full accent-blue-500"
        />
        <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2">
          <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div>
        <label className="text-xs text-slate-400 block mb-2">Not Ekle (opsiyonel)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ne yaptığınızı kısaca açıklayın..."
          rows={3}
          className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
        />
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-950/50 border border-red-900 p-3 rounded-lg">{error}</p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleUpdate}
          disabled={saving}
          className="flex-1 bg-blue-600 hover:bg-blue-700 py-2.5 rounded-lg font-semibold transition disabled:opacity-50"
        >
          {saving ? 'Kaydediliyor...' : 'Kaydet & Geri Dön'}
        </button>
        <Link
          href={`/personnel/job/${job.id}/upload`}
          className="bg-slate-700 hover:bg-slate-600 px-4 py-2.5 rounded-lg font-semibold transition flex items-center"
          title="Fotoğraf Yükle"
        >
          📷
        </Link>
      </div>
    </div>
  )
}
