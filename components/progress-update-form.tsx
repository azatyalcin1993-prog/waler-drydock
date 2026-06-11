'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { uploadJobPhoto } from '@/lib/photos'
import { useRouter } from 'next/navigation'

interface ProgressUpdateFormProps {
  jobId: string
  currentProgress: number
}

export function ProgressUpdateForm({ jobId, currentProgress }: ProgressUpdateFormProps) {
  const [progress, setProgress] = useState(currentProgress)
  const [note, setNote] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Oturum bulunamadı.')
      setSaving(false)
      return
    }

    // 1. Job update kaydı
    const { error: updateError } = await supabase
      .from('job_updates')
      .insert({ job_id: jobId, user_id: user.id, progress, note: note.trim() || null })

    if (updateError) {
      setError('Güncelleme kaydedilemedi: ' + updateError.message)
      setSaving(false)
      return
    }

    // 2. İlerlemeyi job tablosuna da yaz
    await supabase
      .from('jobs')
      .update({ progress, status: progress === 100 ? 'tamamlandi' : progress > 0 ? 'devam_ediyor' : undefined, updated_at: new Date().toISOString() })
      .eq('id', jobId)

    // 3. Fotoğraf yükle
    if (fileRef.current?.files?.length) {
      setUploading(true)
      for (const file of Array.from(fileRef.current.files)) {
        await uploadJobPhoto(supabase, jobId, user.id, file)
      }
      setUploading(false)
    }

    setSaving(false)
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      router.refresh()
    }, 1500)
  }

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
      <h2 className="font-semibold text-sm text-slate-300 mb-4">📱 İlerleme Güncelle</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* İlerleme Slider */}
        <div>
          <label className="text-xs text-slate-400 block mb-2">
            Tamamlanma: <span className="text-white font-bold text-lg">{progress}%</span>
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
          <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
            <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Not */}
        <div>
          <label className="text-xs text-slate-400 block mb-2">Kısa Not (isteğe bağlı)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ne yaptığınızı kısaca açıklayın..."
            rows={2}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

        {/* Fotoğraf Yükle */}
        <div>
          <label className="text-xs text-slate-400 block mb-2">Fotoğraf (isteğe bağlı)</label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full bg-slate-700 hover:bg-slate-600 border border-slate-600 py-2.5 rounded-lg text-sm text-slate-300 transition"
          >
            📷 Fotoğraf Ekle
          </button>
        </div>

        {error && <p className="text-red-400 text-sm bg-red-950/50 border border-red-900 p-2.5 rounded-lg">{error}</p>}
        {success && <p className="text-emerald-400 text-sm bg-emerald-950/50 border border-emerald-900 p-2.5 rounded-lg">✓ Kaydedildi!</p>}

        <button
          type="submit"
          disabled={saving || uploading}
          className="w-full bg-blue-600 hover:bg-blue-700 py-2.5 rounded-lg font-semibold transition disabled:opacity-50"
        >
          {saving ? 'Kaydediliyor...' : uploading ? 'Fotoğraf yükleniyor...' : '✓ Güncelle'}
        </button>
      </form>
    </div>
  )
}