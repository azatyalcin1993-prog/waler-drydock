'use client'

import { Sun, Cloud, CloudRain, CloudLightning, Wind, CloudFog, Users, AlertTriangle, Camera, Calendar, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { deleteDailyReport } from '@/lib/queries/daily-reports'
import type { DailyReport, WeatherCondition } from '@/lib/types'

const WEATHER_ICONS: Record<WeatherCondition, React.ReactNode> = {
  Sunny: <Sun className="w-5 h-5 text-yellow-400" />,
  Cloudy: <Cloud className="w-5 h-5 text-slate-400" />,
  Rainy: <CloudRain className="w-5 h-5 text-blue-400" />,
  Stormy: <CloudLightning className="w-5 h-5 text-red-400" />,
  Windy: <Wind className="w-5 h-5 text-cyan-400" />,
  Foggy: <CloudFog className="w-5 h-5 text-slate-500" />,
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

interface DailyReportCardProps {
  report: DailyReport
  onEdit: () => void
  onRefresh: () => void
}

export default function DailyReportCard({ report, onEdit, onRefresh }: DailyReportCardProps) {
  const date = new Date(report.report_date)
  const day = date.getDate()
  const month = MONTHS[date.getMonth()]
  const year = date.getFullYear()
  const totalManpower = (report.crew_count || 0) + (report.contractor_count || 0)

  const handleDelete = async () => {
    if (!window.confirm('Delete this daily report?')) return
    try {
      await deleteDailyReport(report.id)
      onRefresh()
    } catch (err) {
      console.error('Error deleting report:', err)
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition">
      {/* Date Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="text-center">
            <div className="text-lg font-bold text-white leading-tight">{day}</div>
            <div className="text-xs text-slate-400">{month}</div>
          </div>
          <div className="h-8 w-px bg-slate-700" />
          <div className="flex items-center gap-2">
            {report.weather && WEATHER_ICONS[report.weather]}
            {report.weather && (
              <span className="text-sm text-slate-300">{report.weather}</span>
            )}
            {report.temperature && (
              <span className="text-sm text-slate-400">{report.temperature}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="px-2.5 py-1 text-xs bg-red-950 hover:bg-red-900 rounded-lg text-red-400 transition"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Manpower Stats */}
        <div className="flex gap-3">
          <div className="flex-1 bg-slate-800/50 rounded-lg px-3 py-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Users className="w-3 h-3" /> Crew
            </div>
            <div className="text-lg font-bold text-white">{report.crew_count || 0}</div>
          </div>
          <div className="flex-1 bg-slate-800/50 rounded-lg px-3 py-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Users className="w-3 h-3" /> Contractors
            </div>
            <div className="text-lg font-bold text-white">{report.contractor_count || 0}</div>
          </div>
          <div className="flex-1 bg-slate-800/50 rounded-lg px-3 py-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Users className="w-3 h-3" /> Total
            </div>
            <div className="text-lg font-bold text-blue-400">{totalManpower}</div>
          </div>
        </div>

        {/* Completed Works */}
        <div>
          <h4 className="text-xs font-medium text-slate-400 mb-1">Completed Works</h4>
          <p className="text-sm text-slate-200">{report.completed_works}</p>
        </div>

        {/* Delay Reasons */}
        {report.delay_reasons && (
          <div>
            <h4 className="text-xs font-medium text-amber-400 mb-1">Delays</h4>
            <p className="text-sm text-amber-300/80">{report.delay_reasons}</p>
          </div>
        )}

        {/* Safety Incidents */}
        {report.safety_incidents && (
          <div className="bg-red-950/30 border border-red-900/50 rounded-lg px-3 py-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-red-400 mb-1">
              <AlertTriangle className="w-3 h-3" /> Safety Incident
            </div>
            <p className="text-sm text-red-300/80">{report.safety_incidents}</p>
          </div>
        )}

        {/* Photos */}
        {report.photos && report.photos.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
              <Camera className="w-3 h-3" /> {report.photos.length} photo{report.photos.length > 1 ? 's' : ''}
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {report.photos.map((url, idx) => (
                <div key={idx} className="w-16 h-16 rounded-lg overflow-hidden border border-slate-700 shrink-0">
                  <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {report.notes && (
          <p className="text-xs text-slate-500 italic">{report.notes}</p>
        )}
      </div>
    </div>
  )
}