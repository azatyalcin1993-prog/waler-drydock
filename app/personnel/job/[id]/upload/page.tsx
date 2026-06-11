'use client'

import { useState, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function UploadPhotoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploading(true)
    setError(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()
      const fileName = `${id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('job-photos').upload(fileName, file)
      if (uploadError) { setError('Hata: ' + uploadError.message); continue }
      const { data: { publicUrl } } = supabase.storage.from('job-photos').getPublicUrl(fileName)
      await supabase.from('job_photos').insert({ job_id: id, user_id: user.id, url: publicUrl, file_name: file.name })
      setUploaded(prev => [...prev, publicUrl])
    }
    setUploading(false)
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="bg-slate-800 border-b border-slate-700 px-5 py-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-slate-400 hover:text-white text-lg">←</button>
        <h1 className="font-bold">Fotoğraf Ekle</h1>
      </header>
      <main className="p-5 max-w-lg mx-auto space-y-5">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 text-center">
          <p className="text-4xl mb-3">📷</p>
          <p className="text-slate-400 text-sm mb-4">İş ile ilgili fotoğraf yükleyin</p>
          <label className={`block w-full py-3 rounded-xl font-semibold cursor-pointer transition ${uploading ? 'bg-slate-600 text-slate-400' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
            {uploading ? 'Yükleniyor...' : '📁 Fotoğraf Seç'}
            <input type="file" accept="image/*" multiple onChange={handleUpload} disabled={uploading} className="hidden" />
          </label>
          <p className="text-xs text-slate-500 mt-2">JPG, PNG, HEIC · Birden fazla seçebilirsiniz</p>
        </div>
        {error && <p className="text-red-400 text-sm bg-red-950/50 border border-red-900 p-3 rounded-lg">{error}</p>}
        {uploaded.length > 0 && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <h2 className="text-sm font-semibold text-slate-300 mb-3">✅ Yüklenenler ({uploaded.length})</h2>
            <div className="grid grid-cols-3 gap-2">
              {uploaded.map((url, i) => (
                <img key={i} src={url} alt="" className="w-full h-24 object-cover rounded-lg border border-slate-600" />
              ))}
            </div>
            <button onClick={() => router.back()} className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 py-2.5 rounded-lg font-semibold transition text-sm">
              Geri Dön
            </button>
          </div>
        )}
      </main>
    </div>
  )
}