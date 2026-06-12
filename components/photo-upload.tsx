'use client'

/* eslint-disable @next/next/no-img-element */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { uploadJobPhoto } from '@/lib/photos'
import type { JobPhoto } from '@/lib/types'

interface PhotoUploadProps {
  jobId: string
  initialPhotos?: JobPhoto[]
}

export function PhotoUpload({ jobId, initialPhotos = [] }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [photos, setPhotos] = useState<JobPhoto[]>(initialPhotos)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Oturum bulunamadı. Lütfen tekrar giriş yapın.')
      setUploading(false)
      return
    }

    const newPhotos: JobPhoto[] = []
    const errors: string[] = []

    for (const file of Array.from(files)) {
      const result = await uploadJobPhoto(supabase, jobId, user.id, file)
      if (result.success) {
        newPhotos.push(result.photo)
      } else {
        errors.push(`${file.name}: ${result.error}`)
      }
    }

    if (newPhotos.length > 0) {
      setPhotos((prev) => [...newPhotos, ...prev])
    }
    if (errors.length > 0) {
      setError(errors.join('\n'))
    }

    setUploading(false)
    e.target.value = ''
  }

  return (
    <div className="space-y-5">
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 text-center">
        <p className="text-4xl mb-3">📷</p>
        <p className="text-slate-400 text-sm mb-4">İş ile ilgili fotoğraf yükleyin</p>
        <label
          className={`block w-full py-3 rounded-xl font-semibold cursor-pointer transition ${
            uploading ? 'bg-slate-600 text-slate-400' : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {uploading ? 'Yükleniyor...' : '📁 Fotoğraf Seç'}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
        <p className="text-xs text-slate-500 mt-2">JPG, PNG, WEBP, HEIC · Maks. 10 MB · Birden fazla seçebilirsiniz</p>
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-950/50 border border-red-900 p-3 rounded-lg whitespace-pre-line">
          {error}
        </p>
      )}

      {photos.length > 0 && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <h2 className="text-sm font-semibold text-slate-300 mb-3">Yüklenen Fotoğraflar ({photos.length})</h2>
          <div className="grid grid-cols-3 gap-2">
            {photos.map((photo) => (
              <img
                key={photo.id}
                src={photo.url}
                alt={photo.file_name}
                className="w-full h-24 object-cover rounded-lg border border-slate-600"
              />
            ))}
          </div>
          <button
            onClick={() => router.push(`/personnel/job/${jobId}`)}
            className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 py-2.5 rounded-lg font-semibold transition text-sm"
          >
            İş Detayına Dön
          </button>
        </div>
      )}
    </div>
  )
}
