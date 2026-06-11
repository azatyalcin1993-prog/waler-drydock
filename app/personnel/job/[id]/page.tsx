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
  const { id } = use(params)
  const [job, setJob] = useState<any>(null)
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [note, setNote] = useState('')
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const { data: jobData } = await supabase.from('jobs').select('*, ships(name)').eq('id', id).single()
      const { data: logData } = await supabase.from('job_logs').select('*, profiles(full_name)').eq('job_id', id).order('created_at', { ascending: false })
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
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('jobs').update({ progress, status, updated_at: new Date().toISOString() }).eq('id', id)
    if (note.trim()) {
      await supabase.from('job_logs').insert({ job_id: id, user_id: user?.id, content: note.trim() })
    }
    setSaving(false)
    router.push('/personnel')
  }

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><p className="text-slate-400">Yükleniyor...</p></div>
  if (!job) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><p className="text-red-400">İş bulunamadı.</p></div>

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
        {job.description && (
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p className="text-xs text-slate-400 mb-1">İş Açıklaması</p>
            <p className="text-sm text-white">{job.description}</p>
          </div>
        )}
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 space-y-4">
          <h2 className="font-semibold text-sm text-slate-300">Güncelleme Yap</h2>
          <div>
            <label className="text-xs text-slate-400 block mb-2">Durum</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(statusLabels).map(([val, label]) => (
                <button key={val} onClick={() => setStatus(val)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition border ${status === val ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-500'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-2">İlerleme: <span className="text-white font-semibold">{progress}%</span></label>
            <input type="range" min={0} max={100} step={5} value={progress} onChange={(e) => setProgress(Number(e.target.value))} className="w-full accent-blue-500" />
            <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2">
              <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-2">Not Ekle (opsiyonel)</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ne yaptığınızı kısaca açıklayın..." rows={3}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleUpdate} disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 py-2.5 rounded-lg font-semibold transition disabled:opacity-50">
              {saving ? 'Kaydediliyor...' : 'Kaydet & Geri Dön'}
            </button>
            <a href={`/personnel/job/${id}/upload`}
              className="bg-slate-700 hover:bg-slate-600 px-4 py-2.5 rounded-lg font-semibold transition flex items-center">
              📷
            </a>
          </div>
        </div>
        {logs.length > 0 && (
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <h2 className="font-semibold text-sm text-slate-300 mb-3">Güncelleme Geçmişi</h2>
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="border-l-2 border-slate-600 pl-3">
                  <p className="text-sm text-white">{log.content}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{log.profiles?.full_name ?? 'Bilinmeyen'} · {new Date(log.created_at).toLocaleString('tr-TR')}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}