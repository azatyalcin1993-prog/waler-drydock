'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface VariationOrder {
  id: string
  title: string
  description: string | null
  estimated_cost: number | null
  estimated_hours: number | null
  status: string
  requested_by: string | null
  created_at: string
  profiles?: { full_name: string } | null
}

interface VariationOrderApprovalProps {
  orders: VariationOrder[]
  jobId: string
}

export function VariationOrderApproval({ orders, jobId }: VariationOrderApprovalProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const handleApproval = async (orderId: string, newStatus: 'approved' | 'rejected') => {
    setUpdatingId(orderId)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Oturum bulunamadı.')
      setUpdatingId(null)
      return
    }

    const { error: updateError } = await supabase
      .from('variation_orders')
      .update({
        status: newStatus,
        approved_by: user.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)

    if (updateError) {
      setError('Güncelleme başarısız: ' + updateError.message)
    } else {
      router.refresh()
    }

    setUpdatingId(null)
  }

  const statusLabels: Record<string, string> = {
    pending: 'Beklemede',
    approved: 'Onaylandı',
    rejected: 'Reddedildi'
  }

  const statusStyles: Record<string, string> = {
    pending: 'bg-amber-900/60 text-amber-300',
    approved: 'bg-emerald-900/60 text-emerald-300',
    rejected: 'bg-red-900/60 text-red-300'
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
        <h2 className="font-semibold text-sm text-slate-300 mb-2">📝 Değişim Emirleri</h2>
        <p className="text-sm text-slate-500 italic">Henüz değişiklik emri bulunmuyor.</p>
      </div>
    )
  }

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
      <h2 className="font-semibold text-sm text-slate-300 mb-4">📝 Değişim Emirleri ({orders.length})</h2>
      
      {error && (
        <p className="text-red-400 text-sm bg-red-950/50 border border-red-900 p-2.5 rounded-lg mb-3">{error}</p>
      )}

      <div className="space-y-3">
        {orders.map((order) => (
          <div key={order.id} className="bg-slate-700/50 rounded-lg p-3 border border-slate-600">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h3 className="font-medium text-sm text-white">{order.title}</h3>
                {order.description && (
                  <p className="text-xs text-slate-400 mt-1">{order.description}</p>
                )}
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusStyles[order.status]}`}>
                {statusLabels[order.status]}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mb-3">
              {order.estimated_cost && (
                <div>
                  <span className="text-slate-500">Tahmini Maliyet:</span>
                  <span className="ml-1 text-white">₺{order.estimated_cost.toLocaleString('tr-TR')}</span>
                </div>
              )}
              {order.estimated_hours && (
                <div>
                  <span className="text-slate-500">Tahmini Süre:</span>
                  <span className="ml-1 text-white">{order.estimated_hours} saat</span>
                </div>
              )}
              <div>
                <span className="text-slate-500">Talep Eden:</span>
                <span className="ml-1 text-white">{order.profiles?.full_name || 'Bilinmeyen'}</span>
              </div>
              <div>
                <span className="text-slate-500">Tarih:</span>
                <span className="ml-1 text-white">{new Date(order.created_at).toLocaleDateString('tr-TR')}</span>
              </div>
            </div>

            {order.status === 'pending' && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleApproval(order.id, 'approved')}
                  disabled={updatingId === order.id}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 py-2 rounded-lg text-xs font-semibold transition disabled:opacity-50"
                >
                  {updatingId === order.id ? '...' : '✓ Onayla'}
                </button>
                <button
                  onClick={() => handleApproval(order.id, 'rejected')}
                  disabled={updatingId === order.id}
                  className="flex-1 bg-red-600 hover:bg-red-700 py-2 rounded-lg text-xs font-semibold transition disabled:opacity-50"
                >
                  {updatingId === order.id ? '...' : '✗ Reddet'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}