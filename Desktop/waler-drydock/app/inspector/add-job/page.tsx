'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AddJobPage() {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)

    const { error } = await supabase.from('jobs').insert({
      job_no: formData.get('job_no'),
      ship_id: 'a0000000-0000-0000-0000-000000000001', // Örnek gemi ID
      section: formData.get('section'),
      description: formData.get('description'),
      start_date: formData.get('start_date'),
      end_date: formData.get('end_date'),
      status: 'beklemede',
      progress: 0
    })

    if (error) {
      alert('Hata: ' + error.message)
    } else {
      router.push('/inspector') // Başarılı olunca paneli yenile
    }
    setLoading(false)
  }

  return (
    <div className="p-6 max-w-lg mx-auto text-white">
      <h1 className="text-xl font-bold mb-4">Yeni İş Ekle</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="job_no" placeholder="İş No (örn: DD-2026-006)" className="w-full p-2 bg-slate-800 rounded" required />
        <input name="section" placeholder="Bölüm (örn: Makine Dairesi)" className="w-full p-2 bg-slate-800 rounded" required />
        <textarea name="description" placeholder="İş Açıklaması" className="w-full p-2 bg-slate-800 rounded" required />
        <div className="flex gap-2">
          <input type="date" name="start_date" className="w-full p-2 bg-slate-800 rounded" required />
          <input type="date" name="end_date" className="w-full p-2 bg-slate-800 rounded" required />
        </div>
        <button disabled={loading} className="w-full bg-blue-600 p-2 rounded font-bold">
          {loading ? 'Ekleniyor...' : 'İşi Oluştur'}
        </button>
      </form>
    </div>
  )
}