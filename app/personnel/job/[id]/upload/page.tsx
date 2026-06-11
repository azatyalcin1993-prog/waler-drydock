import Link from 'next/link'
import { redirect } from 'next/navigation'
import { PhotoUpload } from '@/components/photo-upload'
import { createClient } from '@/lib/supabase/server'
import type { JobPhoto } from '@/lib/types'

export default async function UploadPhotoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'personnel') redirect('/inspector')

  const { data: job } = await supabase
    .from('jobs')
    .select('id, section, responsible_id')
    .eq('id', id)
    .single()

  if (!job || job.responsible_id !== user.id) redirect('/personnel')

  const { data: photos } = await supabase
    .from('job_photos')
    .select('*')
    .eq('job_id', id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="bg-slate-800 border-b border-slate-700 px-5 py-4 flex items-center gap-3">
        <Link href={`/personnel/job/${id}`} className="text-slate-400 hover:text-white text-lg">←</Link>
        <div>
          <h1 className="font-bold">Fotoğraf Ekle</h1>
          <p className="text-xs text-slate-400">{job.section}</p>
        </div>
      </header>
      <main className="p-5 max-w-lg mx-auto">
        <PhotoUpload jobId={id} initialPhotos={(photos ?? []) as JobPhoto[]} />
      </main>
    </div>
  )
}
