import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function InspectorDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // 1. Rol kontrolü
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'inspector') redirect('/personnel')

  // 2. Verileri çek
  const { data: jobs, error } = await supabase
    .from('jobs')
    .select(`*, ships (name)`)
    .order('created_at', { ascending: false })

  // Hata durumunda render
  if (error) {
    return <div className="p-10 text-red-500">Hata: {error.message}</div>
  }

  // 3. Render
  return (
    <div className="p-6 max-w-4xl mx-auto text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Enspektör Paneli</h1>
        <a href="/inspector/add-job" className="bg-emerald-600 px-4 py-2 rounded-lg font-bold hover:bg-emerald-700">
          + Yeni İş Ekle
        </a>
      </div>

      {!jobs || jobs.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p>Veritabanında henüz hiç iş bulunmuyor.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job: any) => (
            <div key={job.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <div className="flex justify-between">
                <h3 className="font-bold text-lg">{job.section}</h3>
                <span className="text-xs bg-slate-700 px-2 py-1 rounded">{job.job_no}</span>
              </div>
              <p className="text-slate-400 text-sm mt-1">{job.description}</p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-xs font-bold text-blue-400">Gemi: {job.ships?.name || 'Belirtilmemiş'}</span>
                <span className="text-xs bg-blue-900 text-blue-200 px-2 py-1 rounded capitalize">{job.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}