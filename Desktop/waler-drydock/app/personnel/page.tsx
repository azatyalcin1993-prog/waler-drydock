import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function PersonnelDashboard() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Rol kontrolü: Personel değilse enspektör sayfasına gönder
  if (profile?.role !== 'personnel') {
    redirect('/inspector')
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-5">
      <h1 className="text-xl font-bold">Personel Paneli</h1>
      {/* Buraya mevcut iş atama listenizi ekleyebilirsiniz */}
    </div>
  )
}