import type { JobPhoto } from '@/lib/types'

interface JobPhotoGalleryProps {
  photos: JobPhoto[]
  title?: string
}

export function JobPhotoGallery({ photos, title = 'Fotoğraflar' }: JobPhotoGalleryProps) {
  if (photos.length === 0) return null

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
      <h2 className="text-sm font-semibold text-slate-300 mb-3">
        {title} ({photos.length})
      </h2>
      <div className="grid grid-cols-3 gap-2">
        {photos.map((photo) => (
          <a key={photo.id} href={photo.url} target="_blank" rel="noreferrer" title={photo.file_name}>
            <img
              src={photo.url}
              alt={photo.file_name}
              className="w-full h-24 object-cover rounded-lg border border-slate-600 hover:border-blue-500 transition"
            />
          </a>
        ))}
      </div>
    </div>
  )
}
