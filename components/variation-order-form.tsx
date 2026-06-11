'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface VariationOrderFormProps {
  jobId: string
  onCreated?: () => void
}

export function VariationOrderForm({ jobId, onCreated }: VariationOrderFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [estimatedCost, setEstimatedCost] = useState('')
  const [estimatedHours, setEstimatedHours] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Oturum bulunamadı.')
      setSaving(false)
      return
    }

    const { error: insertError } = await supabase
      .from('variation_orders')
      .insert({
        job_id: jobId,
        title: title.trim(),
        description: description.trim() || null,
        estimated_cost: estimatedCost ? parseFloat(estimatedCost) : null,
        estimated_hours: estimatedHours ? parseFloat(estimatedHours) : null,
        status: 'pending',
        requested_by: user.id,
      })

    if (insertError) {
      setError('Kayıt başarısız: ' + insertError.message)
      setSaving(false)
      return
    }

    setSaving(false)
    setSuccess(true)
    setTitle('')
    setDescription('')
    setEstimatedCost('')
    setEstimatedHours('')
    setTimeout(() => {
      setSuccess(false)
      onCreated?.()
    }, 1500)
  }

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
      <h2 className="font-semibold text-sm text-slate-300 mb-4">📝 Değişim Emri Talep Et</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-xs text-slate-400 block mb-1.5">Başlık *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Örn: Ek kaynak mtxrequired"
            required
            className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400 block mb-1.5">Açıklama</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Değişimin detaylarını açıklayın..."
            rows={2}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 block mb-1.5">Tahmini Maliyet (₺)</label>
            <input
              type="number"
              value={estimatedCost}
              onChange={(e) => setEstimatedCost(e.target.value)}
              placeholder="0"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1.5">Tahmini Süre (saat)</label>
            <input
              type="number"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(e.target.value)}
              placeholder="0"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        {error && <p className="text-red-400 text-sm bg-red-950/50 border border-red-900 p-2.5 rounded-lg">{error}</p>}
        {success && <p className="text-emerald-400 text-sm bg-emerald-950/50 border border-emerald-900 p-2.5 rounded-lg">✓ Değişim emri talebi oluşturuldu!</p>}
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-amber-600 hover:bg-amber-700 py-2.5 rounded-lg font-semibold transition disabled:opacity-50"
        >
          {saving ? 'Kaydediliyor...' : '📋 Değişim Emri Oluştur'}
        </button>
      </form>
    </div>
  )
}