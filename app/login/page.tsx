'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'inspector' | 'personnel'>('personnel')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // 1. Auth Girişi
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      })

      if (authError || !data?.user) {
        console.error("Auth Hatası:", authError)
        setError('Giriş başarısız: E-posta adresi veya şifre hatalı.')
        setLoading(false)
        return
      }

      // 2. Profil Sorgusu
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      console.log("Veritabanı Sorgu Sonucu:", { profile, profileError })

      if (profileError || !profile) {
        setError('Kullanıcı profili veya rolü veritabanında bulunamadı.')
        setLoading(false)
        return
      }

      // 3. Rol Karşılaştırma
      // trim() kullanarak olası boşluk hatalarını önlüyoruz
      if (profile.role.trim() !== role.trim()) {
        setError(`Bu hesap ile seçtiğiniz panele giriş yapamazsınız. Rolünüz: ${profile.role}`)
        setLoading(false)
        return
      }

      // 4. Başarılı Yönlendirme
      if (profile.role === 'inspector') {
        window.location.href = '/inspector'
      } else {
        window.location.href = '/personnel'
      }

    } catch (err) {
      console.error("Beklenmedik Hata:", err)
      setError('Sistemde beklenmedik bir hata oluştu.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-white">
      <div className="max-w-md w-full bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700">
        <h1 className="text-2xl font-bold text-center mb-1">Waler Dry Dock</h1>
        <p className="text-slate-400 text-sm text-center mb-6">Tersane İş Takip Sistemi</p>
        
        <div className="flex bg-slate-900 p-1 rounded-lg mb-6 border border-slate-700">
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${role === 'personnel' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            onClick={() => setRole('personnel')}
          >
            Gemi Personeli
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${role === 'inspector' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            onClick={() => setRole('inspector')}
          >
            Enspektör
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">E-posta</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 rounded bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-blue-500"
              placeholder={role === 'inspector' ? 'enspektor@waler.com' : 'personel@waler.com'}
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Şifre</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2.5 rounded bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-blue-500"
              required 
            />
          </div>
          
          {error && (
            <p className="text-red-400 text-sm text-center font-medium bg-red-950/50 p-2.5 rounded border border-red-900">
              {error}
            </p>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 p-2.5 rounded font-semibold transition disabled:bg-slate-600"
          >
            {loading ? 'Doğrulanıyor...' : role === 'inspector' ? 'Enspektör Paneline Gir →' : 'Personel Paneline Gir →'}
          </button>
        </form>
      </div>
    </div>
  )
}