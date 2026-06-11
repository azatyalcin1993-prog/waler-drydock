import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

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

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="bg-slate-800 border-b border-slate-700 px-5 py-4 flex items-center gap-3">
        <Link href="/inspector" className="text-slate-400 hover:text-white transition text-lg">←</Link>
        <div className="flex-1">
          <h1 className="font-bold">{job.section}</h1>
          <p className="text-xs text-slate-400">{job.ships?.name} · {job.job_no}</p>
        </div>
        <a
          href={`/api/reports/job/${job.id}`}
          target="_blank"
          className="bg-amber-600 hover:bg-amber-700 px-3 py-2 rounded-lg text-xs font-semibold transition"
        >
          📄 PDF Rapor
        </a>
      </header>

      <main className="p-5 max-w-lg mx-auto space-y-4">
        {/* İş Bilgileri */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400">Durum</span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyles[job.status]}`}>
              {statusLabels[job.status]}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">İlerleme</span>
            <span className="font-semibold">{job.progress ?? 0}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                job.status === 'gecikti' ? 'bg-amber-500' :
                job.status === 'tamamlandi' ? 'bg-emerald-500' : 'bg-blue-500'
              }`}
              style={{ width: `${job.progress ?? 0}%` }}
            />
          </div>
          {job.description && (
            <div>
              <p className="text-xs text-slate-400 mb-1">Açıklama</p>
              <p className="text-sm">{job.description}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-slate-400">Sorumlu</p>
              <p className="font-medium">{job.profiles?.full_name || 'Atanmamış'}</p>
            </div>
            <div>
              <p className="text-slate-400">Tarih</p>
              <p className="font-medium">{job.start_date || '-'} → {job.end_date || '-'}</p>
            </div>
          </div>
        </div>

        {/* Fotoğraflar */}
        {photos && photos.length > 0 && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <h2 className="text-sm font-semibold text-slate-300 mb-3">Fotoğraflar ({photos.length})</h2>
            <div className="grid grid-cols-3 gap-2">
              {photos.map((photo: any) => (
                <a key={photo.id} href={photo.url} target="_blank" rel="noreferrer">
                  <img src={photo.url} alt={photo.file_name} className="w-full h-24 object-cover rounded-lg border border-slate-600 hover:border-blue-500 transition" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* İşlem Geçmişi */}
        {logs && logs.length > 0 && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <h2 className="text-sm font-semibold text-slate-300 mb-3">Güncelleme Geçmişi</h2>
            <div className="space-y-3">
              {logs.map((log: any) => (
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