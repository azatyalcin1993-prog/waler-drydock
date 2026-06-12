'use client'

export const dynamic = 'force-dynamic'

import { useMemo, useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import type { JobWithRelations, PersonnelOption, ShipOption } from '@/lib/types'

export default function EditJobPage() {
  const [loading, setLoading] = useState(false)
  const [job, setJob] = useState<JobWithRelations | null>(null)
  const [personnel, setPersonnel] = useState<PersonnelOption[]>([])
  const [ships, setShips] = useState<ShipOption[]>([])
  const [error, setError] = useState<string | null>(null)
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const params = useParams()
  const jobId = params.id as string

  useEffect(() => {
    const load = async () => {
      const { data: jobData } = await supabase
        .from('jobs')
        .select('*, ships(name), profiles(full_name)')
        .eq('id', jobId)
        .single()

      const { data: p } = await supabase.from('profiles').select('id, full_name').eq('role', 'personnel')
      const { data: s } = await supabase.from('ships').select('id, name')
      
      setJob(jobData as JobWithRelations | null)
      setPersonnel(p ?? [])
      setShips(s ?? [])
    }
    load()
  }, [jobId, supabase])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const f = new FormData(e.currentTarget)

    const { error } = await supabase
      .from('jobs')
      .update({
        job_no: f.get('job_no'),
        ship_id: f.get('ship_id') || null,
        section: f.get('section'),
        description: f.get('description'),
        start_date: f.get('start_date'),
        end_date: f.get('end_date'),
        responsible_id: f.get('responsible_id') || null,
        status: f.get('status'),
        progress: parseInt(f.get('progress') as string) || 0,
      })
      .eq('id', jobId)

    if (error) {
      setError('Hata: ' + error.message)
      setLoading(false)
    } else {
      // Add log entry
      await supabase.from('job_logs').insert({
        job_id: jobId,
        content: 'Is bilgileri guncellendi',
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      
      router.push(`/inspector/job/${jobId}`)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Bu isi silmek istediginize emin misiniz? Bu islem geri alinamaz.')) return
    
    setLoading(true)
    const { error } = await supabase.from('jobs').delete().eq('id', jobId)
    
    if (error) {
      setError('Hata: ' + error.message)
      setLoading(false)
    } else {
      router.push('/inspector')
    }
  }

  if (!job) return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="text-center">
        <p className="text-slate-400">Yukleniyor...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="bg-slate-800 border-b border-slate-700 px-5 py-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-slate-400 hover:text-white transition text-lg">←</button>
        <div>
          <h1 className="font-bold">Isi Duzenle</h1>
          <p className="text-xs text-slate-400">{job.section}</p>
        </div>
      </header>

      <main className="p-5 max-w-lg mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 space-y-4">
            <h2 className="text-sm font-semibold text-slate-300">Is Bilgileri</h2>

            <div>
              <label className="text-xs text-slate-400 block mb-1.5">Is No *</label>
              <input
                name="job_no"
                defaultValue={job.job_no}
                placeholder="DD-2026-006"
                required
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1.5">Gemi</label>
              <select
                name="ship_id"
                defaultValue={job.ship_id ?? ''}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Gemi secin...</option>
                {ships.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1.5">Bolum / Konum *</label>
              <input
                name="section"
                defaultValue={job.section}
                placeholder="orn: Makine Dairesi, Guverte"
                required
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1.5">Is Aciklamasi</label>
              <textarea
                name="description"
                defaultValue={job.description ?? ''}
                placeholder="Yapilacak isi detaylica aciklayin..."
                rows={3}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 space-y-4">
            <h2 className="text-sm font-semibold text-slate-300">Zamanlama & Atama</h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Baslangic *</label>
                <input
                  type="date"
                  name="start_date"
                  defaultValue={job.start_date ?? ''}
                  required
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Bitis *</label>
                <input
                  type="date"
                  name="end_date"
                  defaultValue={job.end_date ?? ''}
                  required
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1.5">Sorumlu Personel</label>
              <select
                name="responsible_id"
                defaultValue={job.responsible_id ?? ''}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Personel secin...</option>
                {personnel.map((p) => (
                  <option key={p.id} value={p.id}>{p.full_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 space-y-4">
            <h2 className="text-sm font-semibold text-slate-300">Durum & Ilerleme</h2>

            <div>
              <label className="text-xs text-slate-400 block mb-1.5">Durum</label>
              <select
                name="status"
                defaultValue={job.status}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="beklemede">Beklemede</option>
                <option value="devam_ediyor">Devam Ediyor</option>
                <option value="tamamlandi">Tamamlandi</option>
                <option value="gecikti">Gecikti</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1.5">Ilerleme (%)</label>
              <input
                type="number"
                name="progress"
                defaultValue={job.progress ?? 0}
                min="0"
                max="100"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-950/50 border border-red-900 p-3 rounded-lg">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 py-3 rounded-xl font-bold transition disabled:opacity-50 text-sm"
            >
              {loading ? 'Guncelleniyor...' : '✓ Guncelle'}
            </button>
            
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 px-4 py-3 rounded-xl font-bold transition disabled:opacity-50 text-sm"
            >
              🗑️ Sil
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
