import { createClient } from '@/lib/supabase/client'
import type { DailyReport, DailyReportStats } from '@/lib/types'

const supabase = createClient()

export async function getProjectDailyReports(projectId: string) {
  const { data, error } = await supabase
    .from('daily_reports')
    .select('*')
    .eq('project_id', projectId)
    .order('report_date', { ascending: false })

  if (error) throw error
  return data as DailyReport[]
}

export async function getDailyReportById(reportId: string) {
  const { data, error } = await supabase
    .from('daily_reports')
    .select('*')
    .eq('id', reportId)
    .single()

  if (error) throw error
  return data as DailyReport
}

export async function getDailyReportByDate(projectId: string, reportDate: string) {
  const { data, error } = await supabase
    .from('daily_reports')
    .select('*')
    .eq('project_id', projectId)
    .eq('report_date', reportDate)
    .maybeSingle()

  if (error) throw error
  return data as DailyReport | null
}

export async function createDailyReport(report: Omit<DailyReport, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('daily_reports')
    .insert(report)
    .select()
    .single()

  if (error) throw error
  return data as DailyReport
}

export async function updateDailyReport(reportId: string, updates: Partial<DailyReport>) {
  const { data, error } = await supabase
    .from('daily_reports')
    .update(updates)
    .eq('id', reportId)
    .select()
    .single()

  if (error) throw error
  return data as DailyReport
}

export async function deleteDailyReport(reportId: string) {
  const { error } = await supabase
    .from('daily_reports')
    .delete()
    .eq('id', reportId)

  if (error) throw error
}

export async function getDailyReportStats(projectId: string): Promise<DailyReportStats> {
  const { data, error } = await supabase
    .from('daily_reports')
    .select('crew_count, contractor_count, safety_incidents')
    .eq('project_id', projectId)

  if (error) throw error

  const total = data.length
  const totalManpower = data.reduce((sum, r) => sum + (r.crew_count || 0) + (r.contractor_count || 0), 0)
  const safetyIncidents = data.filter(r => r.safety_incidents && r.safety_incidents.trim().length > 0).length

  return {
    totalReports: total,
    totalManpower,
    safetyIncidents,
    avgCrew: total > 0 ? Math.round(data.reduce((s, r) => s + (r.crew_count || 0), 0) / total) : 0,
    avgContractors: total > 0 ? Math.round(data.reduce((s, r) => s + (r.contractor_count || 0), 0) / total) : 0,
  }
}