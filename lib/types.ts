export type JobStatus = 'beklemede' | 'devam_ediyor' | 'tamamlandi' | 'gecikti'

export type UserRole = 'personnel' | 'inspector'

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
