import Link from 'next/link'
import { redirect } from 'next/navigation'
import { JobPhotoGallery } from '@/components/job-photo-gallery'
import { createClient } from '@/lib/supabase/server'
import type { Job, JobLog, JobPhoto } from '@/lib/types'
import { JobUpdateForm } from './job-update-form'

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'personnel') redirect('/inspector')

  const { data: job } = await supabase
    .from('jobs')
    .select('*, ships(name)')
    .eq('id', id)
    .single()

  if (!job || job.responsible_id !== user.id) redirect('/personnel')

  const { data: logs } = await supabase
    .from('job_logs')
    .select('*, profiles(full_name)')
    .eq('job_id', id)
    .order('created_at', { ascending: false })

  const { data: photos } = await supabase
    .from('job_photos')
    .select('*')
    .eq('job_id', id)
    .order('created_at', { ascending: false })

  const typedJob = job as Job
  const typedLogs = (logs ?? []) as JobLog[]
  const typedPhotos = (photos ?? []) as JobPhoto[]

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="bg-slate-800 border-b border-slate-700 px-5 py-4 flex items-center gap-3">
        <Link href="/personnel" className="text-slate-400 hover:text-white transition text-lg">←</Link>
        <div>
          <h1 className="font-bold">{typedJob.section}</h1>
          <p className="text-xs text-slate-400">{typedJob.ships?.name} · {typedJob.job_no}</p>
        </div>
      </header>

      <main className="p-5 max-w-lg mx-auto space-y-5">
        {typedJob.description && (
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p className="text-xs text-slate-400 mb-1">İş Açıklaması</p>
            <p className="text-sm text-white">{typedJob.description}</p>
          </div>
        )}

        <JobUpdateForm job={typedJob} />

        <JobPhotoGallery photos={typedPhotos} />

        {typedLogs.length > 0 && (
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <h2 className="font-semibold text-sm text-slate-300 mb-3">Güncelleme Geçmişi</h2>
            <div className="space-y-3">
              {typedLogs.map((log) => (
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
