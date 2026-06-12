export type JobStatus = 'beklemede' | 'devam_ediyor' | 'tamamlandi' | 'gecikti'

export type UserRole = 'personnel' | 'inspector' | 'captain' | 'chief_officer' | 'chief_engineer' | 'second_engineer' | 'eto'

export interface JobPhoto {
  id: string
  job_id: string
  user_id: string
  url: string
  file_name: string
  created_at: string
}

export interface JobLog {
  id: string
  job_id: string
  user_id: string
  content: string
  created_at: string
  profiles?: { full_name: string } | null
}

export interface Job {
  id: string
  job_no: string
  ship_id: string | null
  section: string
  description: string | null
  start_date: string | null
  end_date: string | null
  responsible_id: string | null
  status: JobStatus
  progress: number
  created_at: string
  updated_at: string
  ships?: { name: string } | null
  profiles?: { full_name: string } | null
}

export interface ShipOption {
  id: string
  name: string
}

export interface PersonnelOption {
  id: string
  full_name: string
}

export interface JobWithRelations extends Job {
  ships?: { name: string } | null
  profiles?: { full_name: string } | null
}

export interface DryDockJob {
  id: string
  isNo: string
  gemi: string
  bolum: string
  aciklama: string
  durum: JobStatus
  sorumlu: string
  baslangicTarihi: string
  bitisTarihi: string
  ilerleme: number
}

export interface PersonnelJob {
  id: string
  baslik: string
  konum: string
  durum: JobStatus
  sonGuncelleme: string
  logSayisi: number
  fotoSayisi: number
}

export interface JobUpdate {
  id: string
  job_id: string
  user_id: string
  progress: number
  note: string | null
  created_at: string
  profiles?: { full_name: string } | null
}

// Defect Types
export type DefectSeverity = 'Low' | 'Medium' | 'High' | 'Critical'
export type DefectStatus = 'Open' | 'In Progress' | 'Closed' | 'Deferred'
export type DefectLocation = 'Deck' | 'Engine Room' | 'Hull' | 'Propeller' | 'Rudder' | 'Valves' | 'Piping' | 'Electrical' | 'Other'

export interface Defect {
  id: string
  work_order_id?: string | null
  project_id: string
  title: string
  description?: string | null
  location: DefectLocation
  severity: DefectSeverity
  status: DefectStatus
  photo_before_url?: string | null
  photo_after_url?: string | null
  reported_by?: string | null
  assigned_to?: string | null
  created_at: string
  updated_at: string
  closed_at?: string | null
}

export interface DefectWithRelations extends Defect {
  profiles_reporter?: { id: string; full_name: string } | null
  profiles_assigned?: { id: string; full_name: string } | null
}

// Daily Report Types
export type WeatherCondition = 'Sunny' | 'Cloudy' | 'Rainy' | 'Stormy' | 'Windy' | 'Foggy'

export interface DailyReport {
  id: string
  project_id: string
  report_date: string
  weather: WeatherCondition | null
  temperature: string | null
  crew_count: number
  contractor_count: number
  completed_works: string
  delay_reasons: string | null
  safety_incidents: string | null
  photos: string[]
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface DailyReportStats {
  totalReports: number
  totalManpower: number
  safetyIncidents: number
  avgCrew: number
  avgContractors: number
}

export type VariationOrderStatus = 'pending' | 'approved' | 'rejected'

export interface VariationOrder {
  id: string
  job_id: string
  title: string
  description: string | null
  estimated_cost: number | null
  estimated_hours: number | null
  status: VariationOrderStatus
  requested_by: string | null
  approved_by: string | null
  created_at: string
  updated_at: string
  profiles?: { full_name: string } | null
  approver?: { full_name: string } | null
}
