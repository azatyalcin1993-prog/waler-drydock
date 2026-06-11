import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

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

const statusDot: Record<string, string> = {
  beklemede: 'bg-slate-400',
  devam_ediyor: 'bg-blue-400 animate-pulse',
  tamamlandi: 'bg-emerald-400',
  gecikti: 'bg-amber-400',
}

export default async function InspectorDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'inspector') redirect('/personnel')

  const { data: jobs, error } = await supabase
    .from('jobs')
    .select(`*, ships(name), profiles(full_name)`)
    .order('created_at', { ascending: false })

  const stats = {
    toplam: jobs?.length ?? 0,
    beklemede: jobs?.filter(j => j.status === 'beklemede').length ?? 0,
    devam: jobs?.filter(j => j.status === 'devam_ediyor').length ?? 0,
    tamamlandi: jobs?.filter(j => j.status === 'tamamlandi').length ?? 0,
    gecikti: jobs?.filter(j => j.status === 'gecikti').length ?? 0,
  }

  const avgProgress = jobs && jobs.length > 0
    ? Math.round(jobs.reduce((acc, j) => acc + (j.progress ?? 0), 0) / jobs.length)
    : 0

  if (error) return <div className="p-10 text-red-500">Hata: {error.message}</div>

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-5 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Waler Dry Dock</h1>
          <p className="text-xs text-slate-400">Enspektör Paneli</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-300">{profile?.full_name ?? user.email}</span>
          <form action="/api/logout" method="POST">
            <button className="text-xs text-slate-400 hover:text-white bg-slate-700 px-3 py-1.5 rounded-lg transition">
              Çıkış
            </button>
          </form>
        </div>
      </header>

      <main className="p-5 max-w-4xl mx-auto">
        {/* Özet istatistikler */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 col-span-1">
            <p className="text-3xl font-bold">{stats.toplam}</p>
            <p className="text-xs text-slate-400 mt-0.5">Toplam İş</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 col-span-2">
            <p className="text-3xl font-bold text-blue-400">{avgProgress}%</p>
            <p className="text-xs text-slate-400 mt-0.5">Ortalama İlerleme</p>
            <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2">
              <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${avgProgress}%` }} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-6">
          {[
            { label: 'Beklemede', count: stats.beklemede, color: 'text-slate-300' },
            { label: 'Devam', count: stats.devam, color: 'text-blue-400' },
            { label: 'Tamamlandı', count: stats.tamamlandi, color: 'text-emerald-400' },
            { label: 'Gecikti', count: stats.gecikti, color: 'text-amber-400' },
          ].map(s => (
            <div key={s.label} className="bg-slate-800 rounded-xl p-3 border border-slate-700 text-center">
              <p className={`text-xl font-bold ${s.color}`}>{s.count}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* İş Listesi Header */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Tüm İşler</h2>
          <a
            href="/inspector/add-job"
            className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-1"
          >
            + Yeni İş
          </a>
        </div>

        {/* İş Kartları */}
        {!jobs || jobs.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <p className="text-4xl mb-3">⚓</p>
            <p>Henüz hiç iş oluşturulmamış.</p>
            <a href="/inspector/add-job" className="mt-4 inline-block text-blue-400 hover:underline text-sm">
              İlk işi oluştur →
            </a>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {jobs.map((job: any) => (
              <div key={job.id} className="bg-slate-800 rounded-xl border border-slate-700 p-4 hover:border-slate-500 transition">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 mr-2">
                    <h3 className="font-semibold text-white leading-tight">{job.section}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{job.ships?.name ?? '—'} · {job.job_no}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1.5 shrink-0 ${statusStyles[job.status]}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusDot[job.status]}`} />
                    {statusLabels[job.status]}
                  </span>
                </div>

                {job.description && (
                  <p className="text-xs text-slate-400 mb-3 line-clamp-2">{job.description}</p>
                )}

                <div className="mb-3">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>İlerleme</span>
                    <span className="font-medium text-white">{job.progress ?? 0}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        job.status === 'gecikti' ? 'bg-amber-500' :
                        job.status === 'tamamlandi' ? 'bg-emerald-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${job.progress ?? 0}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span>{job.profiles?.full_name ?? 'Atanmamış'}</span>
                  {job.end_date && <span>📅 {job.end_date}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
