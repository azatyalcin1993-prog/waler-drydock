export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ProjectStatus = 'PLANNING' | 'TENDERING' | 'AWARDED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
export type WorkOrderPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL'
export type WorkOrderStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED'
export type TenderStatus = 'DRAFT' | 'SENT' | 'RECEIVED' | 'REJECTED' | 'AWARDED'
export type ReportStatus = 'PENDING' | 'GENERATING' | 'READY' | 'FAILED'
export type ReportType = 'PROGRESS_REPORT' | 'COMPLETION_REPORT' | 'WORK_ORDER_LIST' | 'DAILY_REPORT'
export type DocType = 'SPECIFICATION' | 'QUOTATION' | 'REPORT' | 'PHOTO' | 'CERTIFICATE' | 'OTHER'
export type UserRole = 'ADMIN' | 'MANAGER' | 'INSPECTOR' | 'VIEWER'

export interface Organization {
  id: string
  name: string
  created_at: string
}

export interface Profile {
  id: string
  organization_id: string | null
  full_name: string | null
  role: UserRole
  created_at: string
}

export interface Vessel {
  id: string
  organization_id: string
  name: string
  imo_number: string | null
  flag: string | null
  vessel_type: string | null
  created_at: string
}

export interface Project {
  id: string
  organization_id: string
  vessel_id: string
  name: string
  status: ProjectStatus
  planned_start: string | null
  planned_end: string | null
  actual_start: string | null
  actual_end: string | null
  created_at: string
  updated_at: string
  vessel?: Vessel
  work_orders?: WorkOrder[]
}

export interface WorkOrder {
  id: string
  project_id: string
  sfi_code: string | null
  title: string
  description: string | null
  category: string | null
  priority: WorkOrderPriority
  status: WorkOrderStatus
  created_at: string
  updated_at: string
  updates?: WorkOrderUpdate[]
}

export interface WorkOrderUpdate {
  id: string
  work_order_id: string
  user_id: string
  progress: number
  note: string | null
  offline_id: string | null
  created_at: string
  profile?: Profile
}

export interface Tender {
  id: string
  project_id: string
  yard_name: string
  yard_country: string | null
  status: TenderStatus
  sent_at: string | null
  due_date: string | null
  created_at: string
  quotations?: Quotation[]
}

export interface Quotation {
  id: string
  tender_id: string
  total_amount: number | null
  currency: string | null
  notes: string | null
  file_url: string | null
  is_awarded: boolean | null
  created_at: string
}

export interface Document {
  id: string
  project_id: string | null
  work_order_id: string | null
  update_id: string | null
  name: string
  doc_type: DocType
  storage_path: string
  mime_type: string | null
  size_bytes: number | null
  created_at: string
}

export interface Report {
  id: string
  project_id: string
  report_type: ReportType
  status: ReportStatus
  file_url: string | null
  created_at: string
}