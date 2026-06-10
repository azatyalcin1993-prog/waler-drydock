'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const statusLabels: Record<string, string> = {
  beklemede: 'Beklemede',
  devam_ediyor: 'Devam Ediyor',
  tamamlandi: 'Tamamlandı',
  gecikti: 'Gecikti',
}

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Next.js 15: params artık Promise, use() ile unwrap edilmeli
  const { id } = use(params)

  const [job, setJob] = useState<any>(null)
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [note, setNote] = useState('')
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('*, ships(name)')
        .eq('id', id)
        .single()

      if (jobError) {
        console.error('İş yüklenirken hata:', jobError)
        setLoading(false)
        return
      }

      const { data: logData, error: logError } = await supabase
        .from('job_logs')
        .select('*, profiles(full_name)')
        .eq('job_id', id)
        .order('created_at', { ascending: false })

      if (logError) {
        console.error('Log yüklenirken hata:', logError)
      }

      setJob(jobData)
      setProgress(jobData?.progress ?? 0)
      setStatus(jobData?.status ?? 'beklemede')
      setLogs(logData ?? [])
      setLoading(false)
    }
    load()
  }, [id])

  const handleUpdate = async () => {
    setSaving(true)
    setError(null)

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        setError('Oturum bulunamadı. Lütfen tekrar giriş yapın.')
        setSaving(false)
        return
      }

      // İşi güncelle
      const { error: updateError } = await supabase
        .from('jobs')
        .update({ progress, status })
        .eq('id', id)

      if (updateError) {
        console.error('Güncelleme hatası:', updateError)
        setError(`Güncelleme başarısız: ${updateError.message}`)
        setSaving(false)
        return
      }

      // Not varsa log ekle
      if (note.trim()) {
        const { error: logError } = await supabase.from('job_logs').insert({
          job_id: id,
          user_id: user.id,
          content: note.trim(),
        })

        if (logError) {
          console.error('Log ekleme hatası:', logError)
          // Log eklenemese bile güncelleme başarılıydı, sadece uyar
          setError(`Not kaydedilemedi: ${logError.message}`)
          setSaving(false)
          return
        }
      }

      setNote('')
      setSaving(false)
      router.push('/personnel')
    } catch (err: any) {
      console.error('Beklenmeyen hata:', err)
      setError(`Beklenmeyen hata: ${err.message}`)
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
      <p className="text-slate-400">Yükleniyor...</p>
    </div>
  )

  if (!job) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
      <p className="text-red-400">İş bulunamadı.</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="bg-slate-800 border-b border-slate-700 px-5 py-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-slate-400 hover:text-white transition text-lg">←</button>
        <div>
          <h1 className="font-bold">{job.section}</h1>
          <p className="text-xs text-slate-400">{job.ships?.name} · {job.job_no}</p>
        </div>
      </header>

      <main className="p-5 max-w-lg mx-auto space-y-5">
        {/* Hata Mesajı */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-xl p-4">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Açıklama */}
        {job.description && (
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p className="text-xs text-slate-400 mb-1">İş Açıklaması</p>
            <p className="text-sm text-white">{job.description}</p>
          </div>
        )}

        {/* Güncelleme Formu */}
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 space-y-4">
          <h2 className="font-semibold text-sm text-slate-300">Güncelleme Yap</h2>

          {/* Durum */}
          <div>
            <label className="text-xs text-slate-400 block mb-2">Durum</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(statusLabels).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setStatus(val)}
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

          {/* İlerleme */}
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

          {/* Not */}
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

          <button
            onClick={handleUpdate}
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 py-2.5 rounded-lg font-semibold transition disabled:opacity-50"
          >
            {saving ? 'Kaydediliyor...' : 'Kaydet & Geri Dön'}
          </button>
        </div>

        {/* Log Geçmişi */}
        {logs.length > 0 && (
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <h2 className="font-semibold text-sm text-slate-300 mb-3">Güncelleme Geçmişi</h2>
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="border-l-2 border-slate-600 pl-3">
                  <p className="text-sm text-white">{log.content}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {log.profiles?.full_name ?? 'Bilinmeyen'} · {new Date(log.created_at).toLocaleString('tr-TR')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
