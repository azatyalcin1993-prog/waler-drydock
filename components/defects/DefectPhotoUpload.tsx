'use client'

import { useState } from 'react'
import { Upload, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface DefectPhotoUploadProps {
  photoBefore: string | null
  photoAfter: string | null
  onPhotoBeforeChange: (url: string | null) => void
  onPhotoAfterChange: (url: string | null) => void
}

export default function DefectPhotoUpload({
  photoBefore,
  photoAfter,
  onPhotoBeforeChange,
  onPhotoAfterChange,
}: DefectPhotoUploadProps) {
  const [uploading, setUploading] = useState<'before' | 'after' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const uploadPhoto = async (
    file: File,
    type: 'before' | 'after'
  ) => {
    setUploading(type)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const timestamp = Date.now()
      const fileName = `defect-${type}-${timestamp}-${Math.random().toString(36).substring(7)}`
      const { data, error: uploadError } = await supabase.storage
        .from('defects')
        .upload(`${user.id}/${fileName}`, file)

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from('defects').getPublicUrl(data.path)

      if (type === 'before') {
        onPhotoBeforeChange(publicUrl)
      } else {
        onPhotoAfterChange(publicUrl)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(null)
    }
  }

  const handlePhotoSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'before' | 'after'
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      await uploadPhoto(file, type)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-xs font-medium text-slate-300">Photos</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Before Photo */}
        <div>
          <p className="text-xs text-slate-400 mb-2">Before Photo</p>
          {photoBefore ? (
            <div className="relative group">
              <img
                src={photoBefore}
                alt="Before"
                className="w-full h-48 object-cover rounded-lg border border-slate-700"
              />
              <button
                onClick={() => onPhotoBeforeChange(null)}
                className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 rounded-lg opacity-0 group-hover:opacity-100 transition z-10"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center h-48 border-2 border-dashed border-slate-700 rounded-lg bg-slate-800/50 hover:bg-slate-800 cursor-pointer transition">
              <div className="text-center">
                <Upload className="w-6 h-6 text-slate-500 mx-auto mb-2" />
                <p className="text-xs text-slate-400">
                  {uploading === 'before' ? 'Uploading...' : 'Click to upload'}
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handlePhotoSelect(e, 'before')}
                disabled={uploading !== null}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* After Photo */}
        <div>
          <p className="text-xs text-slate-400 mb-2">After Photo</p>
          {photoAfter ? (
            <div className="relative group">
              <img
                src={photoAfter}
                alt="After"
                className="w-full h-48 object-cover rounded-lg border border-slate-700"
              />
              <button
                onClick={() => onPhotoAfterChange(null)}
                className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 rounded-lg opacity-0 group-hover:opacity-100 transition z-10"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center h-48 border-2 border-dashed border-slate-700 rounded-lg bg-slate-800/50 hover:bg-slate-800 cursor-pointer transition">
              <div className="text-center">
                <Upload className="w-6 h-6 text-slate-500 mx-auto mb-2" />
                <p className="text-xs text-slate-400">
                  {uploading === 'after' ? 'Uploading...' : 'Click to upload'}
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handlePhotoSelect(e, 'after')}
                disabled={uploading !== null}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-xs bg-red-950/50 border border-red-900 p-2 rounded">
          {error}
        </p>
      )}
    </div>
  )
}
