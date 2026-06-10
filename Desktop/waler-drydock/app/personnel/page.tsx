import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

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
  devam_ediyor: 'bg-blue-400',
  tamamlandi: 'bg-emerald-400',
  gecikti: 'bg-amber-400',
}

export default async function PersonnelDashboard() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'personnel') redirect('/inspector')

  const { data: jobs } = await supabase
    .from('jobs')
    .select(`*, ships (name)`)
    .eq('responsible_id', user.id)
    .order('created_at', { ascending: false })

  const stats = {
    toplam: jobs?.length ?? 0,
    devam: jobs?.filter(j => j.status === 'devam_ediyor').length ?? 0,
    tamamlandi: jobs?.filter(j => j.status === 'tamamlandi').length ?? 0,
    gecikti: jobs?.filter(j => j.status === 'gecikti').length ?? 0,
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-5 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Waler Dry Dock</h1>
          <p className="text-xs text-slate-400">Personel Paneli</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-300">{profile?.full_name ?? user.email}</span>
          {/* DÜZELTME: <form method="POST"> yerine Next.js Server Action */}
          <form action={async () => {
            'use server'
            const supabase = await createClient()
            await supabase.auth.signOut()
            redirect('/login')
          }}>
            <button
              type="submit"
              className="text-xs text-slate-400 hover:text-white bg-slate-700 px-3 py-1.5 rounded-lg transition"
            >
              Çıkış
            </button>
          </form>
        </div>
      </header>

      <main className="p-5 max-w-2xl mx-auto">
        {/* İstatistikler */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p className="text-2xl font-bold text-white">{stats.toplam}</p>
            <p className="text-xs text-slate-400 mt-0.5">Toplam İş</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p className="text-2xl font-bold text-blue-400">{stats.devam}</p>
            <p className="text-xs text-slate-400 mt-0.5">Devam Ediyor</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p className="text-2xl font-bold text-emerald-400">{stats.tamamlandi}</p>
            <p className="text-xs text-slate-400 mt-0.5">Tamamlandı</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p className="text-2xl font-bold text-amber-400">{stats.gecikti}</p>
            <p className="text-xs text-slate-400 mt-0.5">Gecikti</p>
          </div>
        </div>

        {/* İş Listesi */}
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Bana Atanan İşler</h2>

        {!jobs || jobs.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <p className="text-4xl mb-3">🔧</p>
            <p>Henüz atanmış bir iş yok.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job: any) => (
              <div key={job.id} className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-white">{job.section}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{job.ships?.name} · {job.job_no}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 ${statusStyles[job.status]}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusDot[job.status]}`} />
                    {statusLabels[job.status]}
                  </span>
                </div>

                {job.description && (
                  <p className="text-sm text-slate-400 mb-3">{job.description}</p>
                )}

                {/* İlerleme */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>İlerleme</span>
                    <span>{job.progress ?? 0}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${job.progress ?? 0}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-xs text-slate-500">
                    {job.start_date && <span>{job.start_date} → {job.end_date}</span>}
                  </div>
                  {/* DÜZELTME: <a> yerine Next.js <Link> */}
                  <Link
                    href={`/personnel/job/${job.id}`}
                    className="text-xs bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg font-medium transition"
                  >
                    Güncelle →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
