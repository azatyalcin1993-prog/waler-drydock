'use client'

import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'

interface Job {
  id: string
  section: string
  status: string
  progress: number
  ships?: { name: string } | null
}

interface HealthDashboardProps {
  jobs: Job[]
}

const STATUS_COLORS = {
  beklemede: '#94a3b8',
  devam_ediyor: '#3b82f6',
  tamamlandi: '#10b981',
  gecikti: '#f59e0b',
}

const STATUS_LABELS: Record<string, string> = {
  beklemede: 'Beklemede',
  devam_ediyor: 'Devam Ediyor',
  tamamlandi: 'Tamamlandı',
  gecikti: 'Gecikti',
}

export function HealthDashboard({ jobs }: HealthDashboardProps) {
  const stats = useMemo(() => {
    const total = jobs.length
    const byStatus = Object.entries(
      jobs.reduce((acc, j) => {
        acc[j.status] = (acc[j.status] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    ).map(([name, value]) => ({ name: STATUS_LABELS[name] || name, value, status: name }))

    const avgProgress = total > 0
      ? Math.round(jobs.reduce((sum, j) => sum + (j.progress ?? 0), 0) / total)
      : 0

    const completed80Plus = jobs.filter(j => (j.progress ?? 0) >= 80).length
    const overdue = jobs.filter(j => j.status === 'gecikti').length
    const notStarted = jobs.filter(j => (j.progress ?? 0) === 0).length

    const byShip = Object.entries(
      jobs.reduce((acc, j) => {
        const ship = j.ships?.name || 'Gemi Yok'
        acc[ship] = (acc[ship] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    ).map(([name, count]) => ({ name: name.length > 15 ? name.substring(0, 15) + '...' : name, count }))

    return { total, byStatus, avgProgress, completed80Plus, overdue, notStarted, byShip }
  }, [jobs])

  return (
    <div className="space-y-4">
      {/* Özet Kartlar */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-slate-800 rounded-xl p-3 border border-slate-700 text-center">
          <p className="text-2xl font-bold text-blue-400">{stats.avgProgress}%</p>
          <p className="text-xs text-slate-500 mt-0.5">Ort. İlerleme</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-3 border border-slate-700 text-center">
          <p className="text-2xl font-bold text-emerald-400">{stats.completed80Plus}</p>
          <p className="text-xs text-slate-500 mt-0.5">%80+ Tamamlandı</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-3 border border-slate-700 text-center">
          <p className="text-2xl font-bold text-amber-400">{stats.overdue}</p>
          <p className="text-xs text-slate-500 mt-0.5">Gecikti</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-3 border border-slate-700 text-center">
          <p className="text-2xl font-bold text-slate-400">{stats.notStarted}</p>
          <p className="text-xs text-slate-500 mt-0.5">Başlanmadı</p>
        </div>
      </div>

      {/* Grafikler */}
      <div className="grid grid-cols-2 gap-4">
        {/* Durum Dağılımı */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Durum Dağılımı</h3>
          {stats.byStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={stats.byStatus}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={({ name, percent }: { name?: string; percent?: number }) => `${name || ''} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {stats.byStatus.map((entry, i) => (
                    <Cell key={i} fill={STATUS_COLORS[entry.status as keyof typeof STATUS_COLORS] || '#6b7280'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500 text-sm text-center py-8">Veri yok</p>
          )}
        </div>

        {/* Gemi Bazlı İş Dağılımı */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Gemi Bazlı İşler</h3>
          {stats.byShip.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.byShip} layout="vertical">
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500 text-sm text-center py-8">Veri yok</p>
          )}
        </div>
      </div>
    </div>
  )
}