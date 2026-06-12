import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProgressUpdateForm } from '@/components/progress-update-form'
import { JobPhotoGallery } from '@/components/job-photo-gallery'
import { VariationOrderApproval } from '@/components/variation-order-approval'
import type { Job, JobLog, JobPhoto, VariationOrder } from '@/lib/types'

const statusLabels: Record<string, string> = {
  beklemede: 'Beklemede',
  devam_ediyor: 'Devam Ediyor',
  tamamlandi: 'Tamamlandı',
  gecikti: 'Gecikti',
}

const statusStyles: Record<string, string> = {
  beklemede: 'bg-slate-700 text-slate-300',
  devam_ediyor: 'bg-blue-900/60 text-blue-300',
  tamamlandi: 'bg-emerald-900/60 text-emerald-300',
  gecikti: 'bg-amber-900/60 text-amber-300',
}

export default async function InspectorJobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'inspector') redirect('/personnel')

  const { data: job } = await supabase
    .from('jobs')
    .select('*, ships(name), profiles(full_name)')
    .eq('id', id)
    .single()

  if (!job) return redirect('/inspector')

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

  const { data: variationOrders } = await supabase
    .from('variation_orders')
    .select('*, profiles(full_name)')
    .eq('job_id', id)
    .order('created_at', { ascending: false })

  const typedJob = job as Job
  const typedLogs = (logs ?? []) as JobLog[]
  const typedPhotos = (photos ?? []) as JobPhoto[]
  const typedOrders = (variationOrders ?? []) as VariationOrder[]
  const progress = Math.min(Math.max(typedJob.progress ?? 0, 0), 100)
  const today = new Date()
  const endDate = typedJob.end_date ? new Date(`${typedJob.end_date}T23:59:59`) : null
  const isOverdue = Boolean(endDate && endDate < today && typedJob.status !== 'tamamlandi')
  const pendingOrders = typedOrders.filter((order) => order.status === 'pending').length
  const latestLog = typedLogs[0]

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="bg-slate-800 border-b border-slate-700 px-5 py-4 flex items-center gap-3">
        <Link href="/inspector" className="text-slate-400 hover:text-white transition text-lg">←</Link>
        <div className="flex-1">
          <h1 className="font-bold">{typedJob.section}</h1>
          <p className="text-xs text-slate-400">{typedJob.ships?.name} · {typedJob.job_no}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/inspector/job/${typedJob.id}/edit`}
            className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg text-xs font-semibold transition"
          >
            ✏️ Düzenle
          </Link>
          <a
            href={`/api/reports/job/${typedJob.id}`}
            target="_blank"
            className="bg-amber-600 hover:bg-amber-700 px-3 py-2 rounded-lg text-xs font-semibold transition"
          >
            📄 PDF Rapor
          </a>
        </div>
      </header>

      <main className="p-5 max-w-lg mx-auto space-y-5">
        {isOverdue && (
          <div className="bg-amber-950/50 border border-amber-800 text-amber-200 rounded-xl p-4 text-sm">
            ⚠️ Bu iş planlanan bitiş tarihini geçmiş ve henüz tamamlanmamış görünüyor.
          </div>
        )}

        {/* İş Bilgileri */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400">Durum</span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyles[typedJob.status]}`}>
              {statusLabels[typedJob.status]}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">İlerleme</span>
            <span className="font-semibold">{progress}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                typedJob.status === 'gecikti' ? 'bg-amber-500' :
                typedJob.status === 'tamamlandi' ? 'bg-emerald-500' : 'bg-blue-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-lg bg-slate-700/60 p-2">
              <p className="text-lg font-bold text-white">{typedPhotos.length}</p>
              <p className="text-slate-400">Fotoğraf</p>
            </div>
            <div className="rounded-lg bg-slate-700/60 p-2">
              <p className="text-lg font-bold text-white">{typedLogs.length}</p>
              <p className="text-slate-400">Güncelleme</p>
            </div>
            <div className="rounded-lg bg-slate-700/60 p-2">
              <p className="text-lg font-bold text-amber-300">{pendingOrders}</p>
              <p className="text-slate-400">Bekleyen VO</p>
            </div>
          </div>
          {typedJob.description && (
            <div>
              <p className="text-xs text-slate-400 mb-1">Açıklama</p>
              <p className="text-sm">{typedJob.description}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-slate-400">Sorumlu</p>
              <p className="font-medium">{typedJob.profiles?.full_name || 'Atanmamış'}</p>
            </div>
            <div>
              <p className="text-slate-400">Tarih</p>
              <p className="font-medium">{typedJob.start_date || '-'} → {typedJob.end_date || '-'}</p>
            </div>
          </div>
          {latestLog && (
            <div className="rounded-lg bg-slate-900/50 border border-slate-700 p-3">
              <p className="text-xs text-slate-400 mb-1">Son Güncelleme</p>
              <p className="text-sm text-white">{latestLog.content}</p>
              <p className="text-xs text-slate-500 mt-1">
                {latestLog.profiles?.full_name ?? 'Bilinmeyen'} · {new Date(latestLog.created_at).toLocaleString('tr-TR')}
              </p>
            </div>
          )}
        </div>

        {/* İlerleme Güncelleme (Enspektör için) */}
        <ProgressUpdateForm jobId={typedJob.id} currentProgress={typedJob.progress ?? 0} />

        {/* Fotoğraflar */}
        <JobPhotoGallery photos={typedPhotos} />

        {/* Değişim Emirleri */}
        <VariationOrderApproval orders={typedOrders} />

        {/* İşlem Geçmişi */}
        {typedLogs.length > 0 ? (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <h2 className="text-sm font-semibold text-slate-300 mb-3">Güncelleme Geçmişi</h2>
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
        ) : (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <h2 className="text-sm font-semibold text-slate-300 mb-2">Güncelleme Geçmişi</h2>
            <p className="text-sm text-slate-500 italic">Henüz işlem geçmişi bulunmuyor.</p>
          </div>
        )}
      </main>
    </div>
  )
}
