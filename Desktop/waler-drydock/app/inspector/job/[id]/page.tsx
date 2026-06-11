import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const statusLabels: Record<string, string> = {
  beklemede: 'Beklemede', devam_ediyor: 'Devam Ediyor', tamamlandi: 'Tamamlandı', gecikti: 'Gecikti',
}
const statusStyles: Record<string, string> = {
  beklemede: 'bg-slate-700 text-slate-300',
  devam_ediyor: 'bg-blue-900/60 text-blue-300',
  tamamlandi: 'bg-emerald-900/60 text-emerald-300',
  gecikti: 'bg-amber-900/60 text-amber-300',
}

export default async function InspectorJobDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'inspector') redirect('/personnel')
  const { data: job } = await supabase.from('jobs').select('*, ships(name), profiles(full_name)').eq('id', id).single()
  if (!job) redirect('/inspector')
  const { data: logs } = await supabase.from('job_logs').select('*, profiles(full_name)').eq('job_id', id).order('created_at', { ascending: false })
  const { data: photos } = await supabase.from('job_photos').select('*').eq('job_id', id).order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="bg-slate-800 border-b border-slate-700 px-5 py-4 flex items-center gap-3">
        <a href="/inspector" className="text-slate-400 hover:text-white transition text-lg">←</a>
        <div className="flex-1">
          <h1 className="font-bold">{job.section}</h1>
          <p className="text-xs text-slate-400">{job.ships?.name} · {job.job_no}</p>
        </div>
        <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${statusStyles[job.status]}`}>
          {statusLabels[job.status]}
        </span>
      </header>
      <main className="p-5 max-w-2xl mx-auto space-y-5">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 space-y-3">
          <h2 className="text-sm font-semibold text-slate-300">İş Bilgileri</h2>
          {job.description && <p className="text-sm text-slate-300">{job.description}</p>}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-xs text-slate-500">Sorumlu</p><p className="text-white">{job.profiles?.full_name ?? 'Atanmamış'}</p></div>
            <div><p className="text-xs text-slate-500">Bitiş Tarihi</p><p className="text-white">{job.end_date ?? '—'}</p></div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>İlerleme</span><span className="font-semibold text-white">{job.progress ?? 0}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div className={`h-2 rounded-full transition-all ${job.status === 'gecikti' ? 'bg-amber-500' : job.status === 'tamamlandi' ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${job.progress ?? 0}%` }} />
            </div>
          </div>
        </div>
        {photos && photos.length > 0 && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <h2 className="text-sm font-semibold text-slate-300 mb-3">Fotoğraflar ({photos.length})</h2>
            <div className="grid grid-cols-3 gap-2">
              {photos.map((photo: any) => (
                <a key={photo.id} href={photo.url} target="_blank" rel="noreferrer">
                  <img src={photo.url} alt="İş fotoğrafı" className="w-full h-24 object-cover rounded-lg border border-slate-600 hover:border-blue-500 transition" />
                </a>
              ))}
            </div>
          </div>
        )}
        {logs && logs.length > 0 && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <h2 className="text-sm font-semibold text-slate-300 mb-3">Güncelleme Geçmişi ({logs.length})</h2>
            <div className="space-y-3">
              {logs.map((log: any) => (
                <div key={log.id} className="border-l-2 border-slate-600 pl-3">
                  {log.content && <p className="text-sm text-white">{log.content}</p>}
                  <p className="text-xs text-slate-500 mt-0.5">{log.profiles?.full_name ?? 'Bilinmeyen'} · {new Date(log.created_at).toLocaleString('tr-TR')}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {!logs?.length && !photos?.length && (
          <div className="text-center py-10 text-slate-500"><p>Henüz güncelleme veya fotoğraf yok.</p></div>
        )}
      </main>
    </div>
  )
}