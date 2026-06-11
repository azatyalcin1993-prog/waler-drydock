'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AddJobPage() {
  const [loading, setLoading] = useState(false)
  const [personnel, setPersonnel] = useState<any[]>([])
  const [ships, setShips] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const { data: p } = await supabase.from('profiles').select('id, full_name').eq('role', 'personnel')
      const { data: s } = await supabase.from('ships').select('id, name')
      setPersonnel(p ?? [])
      setShips(s ?? [])
    }
    load()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const f = new FormData(e.currentTarget)

    const { error } = await supabase.from('jobs').insert({
      job_no: f.get('job_no'),
      ship_id: f.get('ship_id') || null,
      section: f.get('section'),
      description: f.get('description'),
      start_date: f.get('start_date'),
      end_date: f.get('end_date'),
      responsible_id: f.get('responsible_id') || null,
      status: 'beklemede',
      progress: 0,
    })

    if (error) {
      setError('Hata: ' + error.message)
      setLoading(false)
    } else {
      router.push('/inspector')
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="bg-slate-800 border-b border-slate-700 px-5 py-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-slate-400 hover:text-white transition text-lg">←</button>
        <div>
          <h1 className="font-bold">Yeni İş Oluştur</h1>
          <p className="text-xs text-slate-400">Enspektör Paneli</p>
        </div>
      </header>

      <main className="p-5 max-w-lg mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 space-y-4">
            <h2 className="text-sm font-semibold text-slate-300">İş Bilgileri</h2>

            <div>
              <label className="text-xs text-slate-400 block mb-1.5">İş No *</label>
              <input
                name="job_no"
                placeholder="DD-2026-006"
                required
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1.5">Gemi</label>
              <select
                name="ship_id"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Gemi seçin...</option>
                {ships.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1.5">Bölüm / Konum *</label>
              <input
                name="section"
                placeholder="örn: Makine Dairesi, Güverte — Kargo Hold"
                required
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1.5">İş Açıklaması</label>
              <textarea
                name="description"
                placeholder="Yapılacak işi detaylıca açıklayın..."
                rows={3}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 space-y-4">
            <h2 className="text-sm font-semibold text-slate-300">Zamanlama & Atama</h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Başlangıç *</label>
                <input
                  type="date"
                  name="start_date"
                  required
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Bitiş *</label>
                <input
                  type="date"
                  name="end_date"
                  required
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1.5">Sorumlu Personel</label>
              <select
                name="responsible_id"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Personel seçin...</option>
                {personnel.map(p => (
                  <option key={p.id} value={p.id}>{p.full_name}</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-950/50 border border-red-900 p-3 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 py-3 rounded-xl font-bold transition disabled:opacity-50 text-sm"
          >
            {loading ? 'Oluşturuluyor...' : '✓ İşi Oluştur'}
          </button>
        </form>
      </main>
    </div>
  )
}
