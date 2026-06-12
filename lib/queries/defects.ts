import { createClient } from '@/lib/supabase/client'
import type { Defect, DefectWithRelations } from '@/lib/types'

const supabase = createClient()

export async function getProjectDefects(projectId: string) {
  const { data, error } = await supabase
    .from('defects')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Defect[]
}

export async function getDefectById(defectId: string) {
  const { data, error } = await supabase
    .from('defects')
    .select(`
      *,
      profiles_reporter:reported_by(id, full_name),
      profiles_assigned:assigned_to(id, full_name)
    `)
    .eq('id', defectId)
    .single()

  if (error) throw error
  return data as DefectWithRelations
}

export async function createDefect(defect: Omit<Defect, 'id' | 'created_at' | 'updated_at' | 'closed_at'>) {
  const { data, error } = await supabase
    .from('defects')
    .insert(defect)
    .select()
    .single()

  if (error) throw error
  return data as Defect
}

export async function updateDefect(defectId: string, updates: Partial<Defect>) {
  const { data, error } = await supabase
    .from('defects')
    .update(updates)
    .eq('id', defectId)
    .select()
    .single()

  if (error) throw error
  return data as Defect
}

export async function deleteDefect(defectId: string) {
  const { error } = await supabase
    .from('defects')
    .delete()
    .eq('id', defectId)

  if (error) throw error
}

export async function getDefectsByStatus(projectId: string, status: string) {
  const { data, error } = await supabase
    .from('defects')
    .select('*')
    .eq('project_id', projectId)
    .eq('status', status)
    .order('severity', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Defect[]
}

export async function getDefectsByLocation(projectId: string, location: string) {
  const { data, error } = await supabase
    .from('defects')
    .select('*')
    .eq('project_id', projectId)
    .eq('location', location)
    .order('severity', { ascending: false })

  if (error) throw error
  return data as Defect[]
}

export async function getDefectStatistics(projectId: string) {
  const { data, error } = await supabase
    .from('defects')
    .select('status, severity')
    .eq('project_id', projectId)

  if (error) throw error

  const stats = {
    total: data.length,
    open: data.filter(d => d.status === 'Open').length,
    inProgress: data.filter(d => d.status === 'In Progress').length,
    closed: data.filter(d => d.status === 'Closed').length,
    critical: data.filter(d => d.severity === 'Critical').length,
    high: data.filter(d => d.severity === 'High').length,
  }

  return stats
}
